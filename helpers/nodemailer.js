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
          <a href=http://localhost:3001/#/confirm/${hash}> Click here</a>
          </div>`,
  };

  return transporter
    .sendMail(mailOptions)
    .then(() => {
      return { emailConf: true };
    })
    .catch(() => Promise.reject("some fail with confirmation email"));
};

module.exports = {
  sendAuthEmail,
};
