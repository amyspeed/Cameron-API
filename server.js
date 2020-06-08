'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const cors = require('cors');

const { PORT, EMAIL_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_TO, MAILCHIMP_API_KEY, MAILCHIMP_LIST_ID } = require('./config');

const Mailchimp = require('mailchimp-api-v3');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.get('/', (req, res) => {
    res.json({ok: true});
});

app.post('/api/v1', (req,res) => {
    const data = req.body;

    // Does the user want to subscribe to list? (data.signMeUp is true)
    // If so, send to Mailchimp API
    if (data.signMeUp) {
        const mailchimp = new Mailchimp(MAILCHIMP_API_KEY);
        console.log('User opted IN to MailChimp List')
        const mcData = {
            members: [
                {
                    email_address: data.email,
                    status: 'subscribed',
                    merge_fields: {
                        FNAME: data.firstName,
                        LNAME: data.lastName
                    }
                }
            ]
        }

        mailchimp.post({
            path: `lists/${MAILCHIMP_LIST_ID}`,
            body: mcData
        })
        .then((response) => {
            if(response.statusCode === 200) {
                console.log('MailChimp success');
            }
        })
        .catch(err => {
            console.log('MailChimp ERROR');
            throw err;
        })
    }
    else {
        console.log('User opted OUT of MailChimp List')
    }

    // Send the email to Cameron
    let transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: 465,
        secure: true,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });

    const mailOptions = {
    from: data.email,
    to: EMAIL_TO,
    subject: data.subject,
    html: `<p>${data.firstName} ${data.lastName}</p>
            <p>${data.email}</p>
            <p>${data.message}</p>`
    };

    transporter.sendMail(mailOptions,
        (error, response) => {
            if (error) {
                console.log(data);
                console.log(mailOptions);
                console.log('ERROR')
                console.log(error)
                res.send(error)
            }
            else {
                console.log(data);
                console.log(mailOptions);
                console.log('SUCCESS')
                res.send('Success')
            }
        transporter.close();
    });
});



app.use('*', function (req, res) {
    res.status(404).json({ message: `Not Found` });
});

let server;

function runServer(port = PORT) {
    return new Promise((resolve, reject) => {
            server = app.listen(port, () => {
                console.log(`App is listening on port ${port}`);
                resolve();
            })
                .on('error', err => {
                    reject(err);
                });
    });
}

function closeServer() {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
}

if (require.main === module) {
    runServer().catch(err => console.error(err));
}

module.exports = { runServer, app, closeServer };