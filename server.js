'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const { PORT, EMAIL_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_TO } = require('./config');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.get('/', (req, res) => {
    res.json({ok: true});
});

app.post('/api/v1', (req,res) => {
  var data = req.body;

  let transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

var mailOptions = {
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