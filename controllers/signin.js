const session = require("../helpers/session");

const handleSignin = (db, bcrypt, req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json("not fill all properties");

  return db
    .select("email", "hash")
    .from("login")
    .where({ email })
    .then((loginUser) => {
      const { hash, email } = loginUser[0];
      let isValid = bcrypt.compareSync(password, hash);

      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where({ email })
          .then((user) => user[0])
          .catch(() => Promise.reject("no such user"));
      } else {
        Promise.reject("wrong credentials");
      }
    })
    .catch(() => Promise.reject("sign in fail"));
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
            : Promise.reject("rejcted");
        })
        .then((session) => res.status(200).json(session))
        .catch((err) => res.status(400).json("some fail with user"));
};

module.exports = {
  signinAuthentication,
};
