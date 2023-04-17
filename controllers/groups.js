// Get groups with links
const handleGetGroupsWithLinks = (db) => (req, res) => {
  const { topic_id } = req.params;

  if (!topic_id) return res.status(400).json("have no access to this data");
  /* Запрос к дб - забрать группы и линки в куче */
  db.select("id", "group_title")
    .from("groups")
    .where({ topic_id })
    .then((groups) => res.status(200).json(groups))
    .catch(() => res.status(400).json("something is going wrong"));
};

// Add new group
const handleAddGroup = (db) => (req, res) => {
  const { topic_id, group_title } = req.body;

  if (topic_id == null || !group_title)
    return res.status(400).json("have no access to this data");
  // Need check if group already exist
  db.insert({ topic_id, group_title, created_at: new Date() })
    .into("groups")
    .then(() => res.status(200).json("group succesfully added"))
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

// Delete group
const handleDeleteGroup = (db) => (req, res) => {
  const { id, user_id } = req.body;

  if (!id) return res.status(400).json("have no access to this data");

  db.transaction((trx) => {
    trx
      .del()
      .into("groups")
      .where({ id })
      .then(() => {
        return trx
          .del()
          .into("links")
          .where({ user_id, group_id: id })
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
};