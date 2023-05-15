const connect = require("../helpers/connect");

const handlerGetFriends = (db) => (req, res) => {};

const handleInviteFriend = (db) => (req, res) => {
  const { from, to } = req.body;
  if (!from || !to) return res.status(400).json("have no access to this data");

  db.transaction((trx) => {
    trx
      .insert({ user_id_one: from, user_id_two: to, created_at: new Date() })
      .into("friends")
      .returning("id")
      .then(async (friend_id) => {
        return trx
          .select("id", "username", "email")
          .from("users")
          .where({ id: from })
          .then((user) => {
            let response = {
              type: "invite",
              data: { friendTable: friend_id[0], user: user[0] },
            };
            // Emmit message
            connect.handleInviteFriend(to, response);
            return res.status(200).json("invite successfully sended");
          })
          .catch(() => res.status(400).json("something is going wrong with invite"));
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch(() => res.status(400).json("something is going wrong with invite"));
};

const handleAcceptFriend = (db) => (req, res) => {};

const handleCancleFriend = (db) => (req, res) => {};

module.exports = {
  handlerGetFriends,
  handleInviteFriend,
  handleAcceptFriend,
  handleCancleFriend,
};
