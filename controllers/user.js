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

// Get users search data
const handlerGetUserSearch = (db) => (req, res) => {
  const { uservalue } = req.params;
  let splited = uservalue.split("&");
  let user_id = Number(splited[0]);
  let value = splited[1];

  db.select("id", "username", "email")
    .from("users")
    .whereNot("id", user_id)
    .whereLike("email", `${value}%`)
    .then((users) => res.status(200).json(users))
    .catch(() => res.status(400).json("something is going wrong with searching"));
};

module.exports = {
  handlerGetUser,
  handlerGetUserSearch,
};
