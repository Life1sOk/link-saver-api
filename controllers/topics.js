const redis = require("../helpers/redis");

// Get all topics
const handleGetTopics = (db) => (req, res) => {
  const { user_id } = req.params;

  if (!user_id) return res.status(400).json("have no access to this data");

  db.select("id", "topic_title")
    .from("topics")
    .where({ user_id })
    .orderBy("id")
    .then((topics) => res.json(topics))
    .catch(() => res.status(400).json("something is going wrong"));
};

const handleGetTopicCount = (db) => (req, res) => {
  const { params } = req.params;
  let splited = params.split("&");
  let user_id = splited[0];
  let topic_id = splited[1];

  if (!topic_id && !user_id) return res.status(400).json("have no access to this data");

  db.count("id")
    .where({ topic_id, user_id })
    .from("groups")
    .then((group_count) => res.json(group_count[0]))
    .catch(() => res.status(400).json("something is going wrong"));
};

// Add new topic
const handleAddTopic = (db) => (req, res) => {
  const { user_id, topic_title } = req.body;

  if (!user_id || !topic_title) return res.status(400).json("bad fields");

  db.insert({ user_id, topic_title, created_at: new Date() })
    .into("topics")
    .returning("id")
    .then((topic_id) => res.status(200).json(topic_id[0]))
    .catch(() => res.status(400).json("something is going wrong"));
};

// Change/Update topic
const handlerChangeTopic = (db) => (req, res) => {
  const { id, topic_title } = req.body;

  if (!id || !topic_title) return res.status(400).json("bad fields");

  db.update({ topic_title })
    .into("topics")
    .where({ id })
    .returning("*")
    .then((topic) => res.status(200).json(topic[0]))
    .catch(() => res.status(400).json("something is going wrong"));
};

// Delete topic
const handleDeleteTopic = (db) => (req, res) => {
  const { id, user_id } = req.body;

  if (!id | !user_id) return res.status(400).json("bad fields");

  db.transaction((trx) => {
    trx
      .del()
      .into("topics")
      .where({ id })
      .then(() => {
        return trx
          .del()
          .into("groups")
          .where({ topic_id: id })
          .returning(["id", "group_title"])
          .then((groups) => {
            return Promise.all(
              groups.map((data) => {
                return trx
                  .del()
                  .into("links")
                  .where({ user_id, group_id: data.id })
                  .returning(["id", "link_title", "link_url", "status"])
                  .then((links) => {
                    const prepData = { ...data, links };

                    return trx
                      .insert({ user_id, data_id: data.id, data_type: "group" })
                      .into("archive")
                      .then(() => redis.addIntoArchive(user_id, "group", prepData));
                  });
              })
            ).then(() => res.status(200).json("topic succesfully deleted"));
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((error) => res.status(400).json(error, "something is going wrong"));
};

module.exports = {
  handleGetTopics,
  handleAddTopic,
  handlerChangeTopic,
  handleDeleteTopic,
  handleGetTopicCount,
};
