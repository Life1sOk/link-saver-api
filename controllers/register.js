const session = require("../helpers/redis");
const emailConf = require("../helpers/nodemailer");
const hashGen = require("../helpers/bcrypt");

const handleRegister = (db, bcrypt, req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) return Promise.reject("not fill all properties");

  const hash = hashGen.createHash(bcrypt, password);

  if (hash) {
    return db
      .transaction((trx) => {
        return trx
          .insert({
            hash,
            email,
            created_at: new Date(),
          })
          .into("login")
          .returning("email")
          .then((loginEmail) => {
            return trx("users")
              .returning("*")
              .insert({
                username,
                email: loginEmail[0].email,
                created_at: new Date(),
              })
              .then((user) => {
                return { user: user[0], hash };
              });
          })
          .then(trx.commit)
          .catch(trx.rollback);
      })
      .catch(() => Promise.reject("registration fail"));
  } else {
    return Promise.reject("no able to register");
  }
};

const registerAuthentication = (db, bcrypt) => (req, res) => {
  return handleRegister(db, bcrypt, req, res)
    .then(({ user, hash }) => {
      return user.id && user.email
        ? // Send verification email to user
          emailConf.sendAuthEmail(user, hash)
        : Promise.reject("rejcted");
    })
    .then((data) => res.status(200).json(data))
    .catch((err) => res.status(400).json(err));
  // return handleRegister(db, bcrypt, req, res)
  //   .then((user) => {
  //     return user.id && user.email
  //       ? session.createSession(user)
  //       : Promise.reject("rejcted");
  //   })
  //   .then((session) => res.status(200).json(session))
  //   .catch(() => res.status(400).json("some fail with user"));
};

const handleConfirmation = (db) => (req, res) => {
  const { token } = req.params;

  db.update({ confirmed: true })
    .into("login")
    .where({ hash: token })
    .then(() => res.status(200).json("User confirmed"))
    .catch(() => res.status(400).json("user failed"));
};

module.exports = {
  registerAuthentication,
  handleConfirmation,
};
