const handleRegister = (db, bcrypt) => (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email)
    return res.status(400).json("not fill all properties");

  bcrypt.hash(password, 1, function (err, hash) {
    if (hash) {
      db.transaction((trx) => {
        trx
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
              .then((user) => res.json(user[0]));
          })
          .then(trx.commit)
          .catch(trx.rollback);
      }).catch(() => res.status(400).json("registration fail"));
    } else {
      res.status(400).json("no able to register");
    }
  });
};

module.exports = {
  handleRegister,
};
