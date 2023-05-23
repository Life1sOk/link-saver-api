const connect = require("../helpers/connect");

const handleTransitionGet = (db) => (req, res) => {
  const { user_id } = req.params;

  if (!user_id) return res.status(400).json("have no access to this data");
  // Voob6e di4 kakajato - doljen byt sposob polu46e....
  db.transaction((trx) => {
    trx
      .select("id", "from_user_id", "group_id")
      .into("transition")
      .where({ to_user_id: user_id })
      .then(async (transitions) => {
        return Promise.all(
          transitions.map((transition) => {
            return trx
              .select("username", "email")
              .from("users")
              .where({ id: transition.from_user_id })
              .then((users) => {
                return trx
                  .select("id", "group_title")
                  .into("groups")
                  .where({ id: transition.group_id })
                  .then((groups) => {
                    return trx
                      .select("id", "link_title", "link_url", "status")
                      .into("links")
                      .where({ group_id: groups[0].id })
                      .then((links) => {
                        return {
                          transition_id: transition.id,
                          from: users[0],
                          group: {
                            ...groups[0],
                            links,
                          },
                        };
                      });
                  });
              });
          })
        );
      })
      .then((upTrans) => res.status(200).json(upTrans))
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch(() => res.status(400).json("something is going wrong"));
};

const handleTransitionAdd = (db) => (req, res) => {
  const { from, to, data } = req.body;

  if (!from || !to || !data) return res.status(400).json("have no access to this data");

  db.insert({
    from_user_id: from,
    to_user_id: to,
    group_id: data.id,
    created_at: new Date(),
  })
    .into("transition")
    .returning("id")
    .then((transition_id) => {
      db.select("username", "email")
        .from("users")
        .where({ id: from })
        .then((users) => {
          let message = {
            type: "transition box",
            data: {
              transition_id: transition_id[0].id,
              group: data,
              from: users[0],
            },
          };
          // Send message
          connect.handleSendMessage(to, message);
          res.status(200).json("transition successfully added");
        });
    })
    .catch(() => res.status(400).json("something is going wrong"));
};

const handleTransitionAccept = (db) => (req, res) => {
  const { transition_id, user_id, topic_id, group_title, links } = req.body;

  if (!transition_id || !user_id || !group_title || !links)
    return res.status(400).json("have no access to this data");

  db.transaction((trx) => {
    trx
      .del()
      .into("transition")
      .where({ id: transition_id })
      .then(() => {
        return trx
          .insert({
            topic_id: topic_id ? topic_id : 0,
            group_title,
            user_id,
            created_at: new Date(),
          })
          .into("groups")
          .returning("id")
          .then(async (group_id) => {
            return Promise.all(
              links.map(({ link_title, link_url }) => {
                return trx
                  .insert({
                    user_id,
                    group_id: group_id[0].id,
                    link_title,
                    link_url,
                    created_at: new Date(),
                  })
                  .into("links")
                  .returning("id")
                  .then((link_id) => {
                    return link_id[0].id;
                  });
              })
            ).then((links) => {
              return { group_id: group_id[0].id, links };
            });
          });
      })
      .then((upGroupIds) => res.status(200).json(upGroupIds))
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch(() => res.status(400).json("something is going wrong"));
};

module.exports = {
  handleTransitionGet,
  handleTransitionAdd,
  handleTransitionAccept,
};
