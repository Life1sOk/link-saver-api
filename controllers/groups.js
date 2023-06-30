const redis = require("../utils/redis");

// Get groups with links
const handleGetGroupsWithLinks = (db) => (req, res) => {
  const { params } = req.params;
  let splited = params.split("&");
  let user_id = splited[0];
  let topic_id = splited[1];

  if (!topic_id || !user_id) return res.status(400).json("have no access to this data");

  db.transaction((trx) => {
    trx
      .select("id", "group_title")
      .from("groups")
      .where({ topic_id, user_id })
      .then(async (groups) => {
        // Make faster and better
        return Promise.all(
          groups.map((group) => {
            return trx
              .select("id", "link_title", "link_url", "status")
              .from("links")
              .where({ user_id, group_id: group.id })
              .then((links) => {
                return { ...group, links };
              });
          })
        );
      })
      .then((upGroups) => res.status(200).json(upGroups))
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch(() => res.status(400).json("something is going wrong"));
};

// Add new group
const handleAddGroup = (db) => (req, res) => {
  const { topic_id, group_title, user_id } = req.body;

  if (topic_id == null || !group_title || !user_id)
    return res.status(400).json("have no access to this data");

  db.insert({ topic_id, group_title, user_id, created_at: new Date() })
    .into("groups")
    .returning("id")
    .then((group_id) => res.status(200).json(group_id[0]))
    .catch(() => res.status(400).json("something is going wrong"));
};

// Update/change group
const handleChangeGroup = (db) => (req, res) => {
  const { id, new_title } = req.body;

  if (!id) return res.status(400).json("have no access to this data");

  db.update({ group_title: new_title })
    .into("groups")
    .where({ id })
    .then(() => res.status(200).json("group succesfully updated"))
    .catch(() => res.status(400).json("something is going wrong"));
};

const handleChangeGroupTopicId = (db) => (req, res) => {
  const { group_id, new_topic_id } = req.body;

  if (!group_id) return res.status(400).json("have no access to this data");

  db.update({ topic_id: new_topic_id })
    .into("groups")
    .where({ id: group_id })
    .then(() => res.status(200).json("group transction succesfully done"))
    .catch(() => res.status(400).json("something is going wrong"));
};

// Delete group
const handleDeleteGroup = (db) => (req, res) => {
  const { id, user_id } = req.body;

  if (!id) return res.status(400).json("have no access to this data");

  db.transaction((trx) => {
    trx
      .del()
      .into("groups")
      .where({ id })
      .returning(["id", "group_title"])
      .then((data) => {
        return trx
          .del()
          .into("links")
          .where({ user_id, group_id: id })
          .returning(["id", "link_title", "link_url", "status"])
          .then((links) => {
            const prepData = { ...data[0], links };

            return trx
              .insert({ user_id, data_id: id, data_type: "group" })
              .into("archive")
              .then(() => redis.addIntoArchive(user_id, "group", prepData));
          })
          .then(() => res.status(200).json("group succesfully deleted"));
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch(() => res.status(400).json("something is going wrong"));
};

module.exports = {
  handleGetGroupsWithLinks,
  handleAddGroup,
  handleChangeGroup,
  handleDeleteGroup,
  handleChangeGroupTopicId,
};
