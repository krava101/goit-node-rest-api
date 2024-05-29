import nodemailer from 'nodemailer';

const MAILTRAP_USERNAME = process.env.MAILTRAP_USERNAME;
const MAILTRAP_PASSWORD = process.env.MAILTRAP_PASSWORD;

const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: MAILTRAP_USERNAME,
    pass: MAILTRAP_PASSWORD
  }
})

function sendMail(message) {
  return transport.sendMail(message, (err, info) => {
    if (err) {
      return console.log(err);
    }
    console.log('Message sent: %s', info.messageId);
  });
}

export default { sendMail };