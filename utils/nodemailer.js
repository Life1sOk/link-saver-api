const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const sendAuthEmail = async (user, hash) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: user.email,
    subject: "Please confirm your account",
    html: `<h1>Email Confirmation</h1>
          <h2>Hello ${user.username}</h2>
          <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
          <a href=https://link-saver.herokuapp.com/#/confirm/${hash}> Click here</a>
          </div>`,
  };

  return transporter
    .sendMail(mailOptions)
    .then(() => {
      return { emailConf: true };
    })
    .catch((err) => Promise.reject(err, "some fail with confirmation email"));
};

const sendResetEmail = async (user, hash) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: user.email,
    subject: "Reset your password",
    html: `<h1>Email Confirmation</h1>
          <h2>Hello ${user.username}</h2>
          <p>Please click the link below to reset your password:</p>
          <a href=https://link-saver.herokuapp.com/#/password/${hash}> Click here</a>
          <p>This link will direct you to the password reset page where you can create a new password for your account. If you have any issues or require additional assistance, please let us know.</p>
          </div>`,
  };

  return transporter
    .sendMail(mailOptions)
    .then(() => {
      return { emailConf: true };
    })
    .catch(() => Promise.reject("some fail with reset email"));
};

module.exports = {
  sendAuthEmail,
  sendResetEmail,
};
