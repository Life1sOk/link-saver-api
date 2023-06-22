const redis = require("../helpers/redis");

// Get archive data
const handleGetArchive = (db) => (req, res) => {
  const { user_id } = req.params;

  if (!user_id) return res.status(400).json("have no access to this data");

  db.select("id", "data_id", "data_type")
    .into("archive")
    .where({ user_id })
    .then((archive) => {
      // redis take data and prep for sending
      return Promise.all(
        archive.map(async (data) => {
          return redis
            .getFromArchive(user_id, data.data_id, data.data_type)
            .then(async (check) => {
              if (!check) {
                // delete from table
                db.del()
                  .into("archive")
                  .where({ id: data.id })
                  .then(() => console.log("done"));
              } else {
                return check;
              }
            });
        })
      );
    })
    .then((upArchive) => res.status(200).json(upArchive))
    .catch(() => res.status(400).json("something is going wrong"));
};

const handleRestoreArchive = (db) => (req, res) => {
  const { user_id, data, data_type } = req.body;

  if (!user_id || !data || !data_type)
    return res.status(400).json("have no access to this data");

  db.del()
    .into("archive")
    .where({ user_id, data_id: data.id, data_type })
    .then(() => redis.deleteFromArchive(user_id, data.id, data_type))
    .then(() => {
      if (data_type === "group") {
        const { id, group_title, topic_id, links } = data;

        return db
          .insert({ id, topic_id, group_title, user_id, created_at: new Date() })
          .into("groups")
          .returning("id")
          .then((data) => {
            const group_id = data[0].id;

            return Promise.all(
              links.map((link) => {
                const { id, link_title, link_url } = link;
                console.log(link, "link");
                db.insert({
                  id,
                  user_id,
                  group_id,
                  link_title,
                  link_url,
                  created_at: new Date(),
                })
                  .into("links")
                  .then(() => console.log("done"));
              })
            ).then(() => res.status(200).json("archive group complited"));
          });
      }

      if (data_type === "link") {
        // Add to server
        return db
          .insert({
            id: data.id,
            user_id: data.user_id,
            group_id: null,
            link_title: data.link_title,
            link_url: data.link_url,
            created_at: new Date(),
          })
          .into("links")
          .then(() => res.status(200).json("archive links complited"));
      }
    })
    .catch(() => res.status(400).json("something is going wrong"));
};

module.exports = {
  handleGetArchive,
  handleRestoreArchive,
};
