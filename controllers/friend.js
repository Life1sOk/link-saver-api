const websocket = require("../utils/websocket");

const handlerGetFriends = (db) => (req, res) => {
  const { user_id } = req.params;
  if (!user_id) return res.status(400).json("have no access to this data");

  db.transaction((trx) => {
    trx
      .select("id", "user_id_one", "user_id_two", "confirmed")
      .from("friends")
      .where({ user_id_one: user_id })
      .orWhere({ user_id_two: user_id })
      .then(async (friendsStatus) => {
        const friendsList = [];
        const invitedList = [];
        const incomingList = [];

        return Promise.all(
          friendsStatus.map((status) => {
            const { id, user_id_one, user_id_two, confirmed } = status;

            if (user_id_one == user_id) {
              return trx
                .select("id", "username", "email")
                .from("users")
                .where({ id: user_id_two })
                .then((user) => {
                  if (confirmed)
                    friendsList.push({ ...user[0], status: "friends", friend_id: id });
                  if (!confirmed)
                    invitedList.push({ ...user[0], status: "invited", friend_id: id });
                });
            } else {
              return trx
                .select("id", "username", "email")
                .from("users")
                .where({ id: user_id_one })
                .then((user) => {
                  if (confirmed)
                    friendsList.push({ ...user[0], status: "friends", friend_id: id });
                  if (!confirmed)
                    incomingList.push({ ...user[0], status: "incoming", friend_id: id });
                });
            }
          })
        ).then(() => res.status(200).json({ friendsList, invitedList, incomingList }));
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch(() => res.status(400).json("something is going wrong with friends"));
};

const handleInviteFriend = (db, wss) => (req, res) => {
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
              type: "invite friend",
              data: { ...user[0], friend_id: friend_id[0].id },
            };
            // Websocket message
            websocket.handleSendMessage(wss, to, response);
            return res.status(200).json(friend_id[0].id);
          })
          .catch(() => res.status(400).json("something is going wrong with invite"));
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch(() => res.status(400).json("something is going wrong with invite"));
};

const handleAcceptFriend = (db, wss) => (req, res) => {
  const { friend_id } = req.body;

  if (!friend_id) return res.status(400).json("have no access to this data");

  db.transaction((trx) => {
    trx
      .update({ confirmed: true })
      .into("friends")
      .where({ id: friend_id })
      .returning(["user_id_one", "user_id_two"])
      .then((data) => {
        return trx
          .select("id", "username", "email")
          .from("users")
          .where({ id: data[0].user_id_two })
          .then((user) => {
            let response = {
              type: "confirmed friend",
              data: { ...user[0], friend_id },
            };
            // Websocket message
            websocket.handleSendMessage(wss, data[0].user_id_one, response);
            return res.status(200).json("friendship succesfully accepted");
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch(() => res.status(400).json("something is going wrong with accept"));
};

const handleCancleFriend = (db) => (req, res) => {
  const { friend_id } = req.body;

  if (!friend_id) return res.status(400).json("have no access to this data");

  db.del()
    .into("friends")
    .where({ id: friend_id })
    .then(() => res.status(200).json("friend raw succesfully deleted"))
    .catch(() => res.status(400).json("something is going wrong"));
};

const handleDeleteFriend = (db, wss) => (req, res) => {
  const { friend_id, from_id, to_id } = req.body;

  if (!friend_id) return res.status(400).json("have no access to this data");

  db.del()
    .into("friends")
    .where({ id: friend_id })
    .then(() => {
      let response = {
        type: "delete friend",
        data: { from_id },
      };
      // Websocket message
      websocket.handleSendMessage(wss, to_id, response);
      return res.status(200).json("friendship succesfully deleted");
    })
    .catch(() => res.status(400).json("something is going wrong"));
};

module.exports = {
  handlerGetFriends,
  handleInviteFriend,
  handleAcceptFriend,
  handleCancleFriend,
  handleDeleteFriend,
};
