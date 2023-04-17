const handleSignin = (db, bcrypt) => (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json("not fill all properties");

  db.select("email", "hash")
    .from("login")
    .where({ email })
    .then((loginUser) => {
      const { hash, email } = loginUser[0];
      bcrypt.compare(password, hash, function (err, result) {
        if (result) {
          return db
            .select("*")
            .from("users")
            .where({ email })
            .then((user) => res.json(user[0]))
            .catch(() => res.status(400).json("no such user"));
        } else {
          res.status(400).json("wrong credentials");
        }
      });
    })
    .catch(() => res.status(400).json("sign in fail"));
};

module.exports = {
  handleSignin,
};
