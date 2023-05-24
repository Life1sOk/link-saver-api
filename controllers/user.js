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
  handlerGetUserSearch,
};
