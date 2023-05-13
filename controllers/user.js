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

module.exports = {
  handlerGetUser,
};
