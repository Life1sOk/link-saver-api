const session = require("../utils/redis");
const hashGen = require("../utils/bcrypt");

const handleSignin = (db, bcrypt, req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json("not fill all properties");

  return db
    .select("email", "hash", "confirmed")
    .from("login")
    .where({ email })
    .then((loginUser) => {
      if (!loginUser[0]) return Promise.reject("User does not exist!");

      const { hash, email, confirmed } = loginUser[0];
      let isValid = hashGen.compareHash(bcrypt, password, hash);

      if (!confirmed) {
        return Promise.reject("User wasn't verified, please check your email");
      }

      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where({ email })
          .then((user) => user[0])
          .catch(() => Promise.reject("User doesn't  exist!"));
      } else {
        return Promise.reject("Wrong credentials!");
      }
    })
    .catch((err) => Promise.reject(err));
};

const signinAuthentication = (db, bcrypt) => (req, res) => {
  const { token } = req.headers;

  return token
    ? session
        .getUserIdByToken(token)
        .then((session) => res.status(200).json(session))
        .catch(() => res.status(400).json("some fail with user 2"))
    : handleSignin(db, bcrypt, req, res)
        .then((user) => {
          return user.id && user.email
            ? session.createSession(user)
            : Promise.reject("User doesn't  exist!");
        })
        .then((session) => res.status(200).json(session))
        .catch((err) => res.status(400).json(err));
};

module.exports = {
  signinAuthentication,
};

/*
  1) User does not exist;
  2) Wrong password;
  3) Not verified;
 */
