// Get users data
const handlerGetUser = (db) => (req, res) => {
  const { user_id } = req.params;

  if (!user_id) return res.status(400).json("have no access to this data");

  db.select("id", "username", "email")
    .from("users")
    .where({ id: user_id })
    .then((user) => res.status(200).json(user[0]))
    .catch(() => res.status(400).json("something is going wrong with user"));
};

const handlerUpdateUsername = (db) => (req, res) => {
  const { user_id, newUsername } = req.body;

  if (!user_id || !newUsername)
    return res.status(400).json("have no access to this data");

  db.update({ username: newUsername })
    .into("users")
    .where({ id: user_id })
    .then(() => res.status(200).json("username succesfully updated!!"))
    .catch(() => res.status(400).json("something wrong here"));
};

const handlerUpdateUserEmail = (db) => (req, res) => {
  const { user_id, newEmail, oldEmail } = req.body;
  console.log(req.body);
  if (!user_id || !newEmail) return res.status(400).json("have no access to this data");

  db.update({ email: newEmail })
    .into("users")
    .where({ id: user_id })
    .then(() => {
      return db.update({ email: newEmail }).into("login").where({ email: oldEmail });
    })
    .then(() => res.status(200).json("user succesfully updated!!"))
    .catch(() => res.status(400).json("something wrong here"));
};

const handlerChangeUserPassword = (db, bcrypt) => (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  if (!email || !oldPassword || !newPassword)
    return res.status(400).json("have no access to this data");

  db.select("hash")
    .from("login")
    .where({ email })
    .then((hash) => {
      let isValid = bcrypt.compareSync(oldPassword, hash[0].hash);

      if (isValid) {
        const salt = bcrypt.genSaltSync(10);
        const newHash = bcrypt.hashSync(newPassword, salt);

        return db.update({ hash: newHash }).into("login").where({ email });
      } else {
        return res.status(400).json("Invalid password");
      }
    })
    .then(() => res.status(200).json("user succesfully updated!!"))
    .catch(() => res.status(400).json("something wrong here"));
};

const handlerGetUserSearch = (db) => (req, res) => {
  const { uservalue } = req.params;
  let splited = uservalue.split("&");
  let user_id = Number(splited[0]);
  let value = splited[1];

  db.transaction((trx) => {
    trx
      .select("id", "username", "email")
      .from("users")
      .whereNot("id", user_id)
      .whereLike("email", `${value}%`)
      .then(async (users) => {
        return Promise.all(
          users.map((target) => {
            return trx
              .select("id")
              .from("friends")
              .where({ user_id_two: target.id, user_id_one: user_id })
              .orWhere({ user_id_two: user_id, user_id_one: target.id })
              .then((data) => {
                if (!data[0]) {
                  return target;
                }
              });
          })
        );
      })
      .then((users) => {
        const filtered = users.filter((user) => user !== undefined);
        res.status(200).json(filtered);
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch(() => res.status(400).json("something is going wrong with searching"));
};

module.exports = {
  handlerGetUser,
  handlerUpdateUsername,
  handlerUpdateUserEmail,
  handlerChangeUserPassword,
  handlerGetUserSearch,
};
