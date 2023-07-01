const emailConf = require("../utils/nodemailer");

const handleConfirmation = (db) => (req, res) => {
  const { token } = req.params;

  if (!token) return Promise.reject("not fill all properties");

  db.update({ confirmed: true })
    .into("login")
    .where({ hash: token })
    .then(() => res.status(200).json("User confirmed"))
    .catch(() => res.status(400).json("user failed"));
};

const handleSendConfirmationAgain = (db) => (req, res) => {
  const { email, username } = req.body;

  if (!email) return Promise.reject("not fill all properties");

  db.select("hash")
    .from("login")
    .where({ email })
    .then((data) => {
      const userData = { username, email };
      return emailConf.sendAuthEmail(userData, data[0].hash);
    })
    .then((data) => res.status(200).json(data))
    .catch((err) => res.status(400).json(err));
};

const handleSendResetPassword = (db) => (req, res) => {
  const { email } = req.body;

  if (!email) return Promise.reject("not fill all properties");

  db.select("hash")
    .from("login")
    .where({ email })
    .then((data) => {
      if (!data[0]) {
        return Promise.reject("Email does not exist");
      }

      const userData = { username: "Guest", email };
      return emailConf.sendResetEmail(userData, data[0].hash);
    })
    .then((data) => res.status(200).json(data))
    .catch((err) => res.status(400).json(err));
};

module.exports = {
  handleConfirmation,
  handleSendConfirmationAgain,
  handleSendResetPassword,
};
