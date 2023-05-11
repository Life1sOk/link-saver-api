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
  const { topic_id } = req.params;

  if (!topic_id) return res.status(400).json("have no access to this data");

  db.count("id")
    .where({ topic_id })
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
          .returning("id")
          .then((group_id) => {
            return trx
              .del()
              .into("links")
              .whereIn(
                "group_id",
                group_id.map((group) => group.id)
              )
              .then(() => res.status(200).json("group succesfully deleted"));
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
