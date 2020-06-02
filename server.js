'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

const port = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.listen(port, () => {
  console.log('We are live on port 8080');
});


app.get('/', (req, res) => {
  res.send('Welcome to my api');
});

app.post('/api/v1', (req,res) => {
  var data = req.body;

  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

var mailOptions = {
  from: data.email,
  to: process.env.EMAIL_TO,
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
            console.log("ERROR")
            console.log(error)
            res.send(error)
        }
        else {
            console.log(data);
            console.log(mailOptions);
            console.log("SUCCESS")
            res.send('Success')
        }
        transporter.close();
    });
});