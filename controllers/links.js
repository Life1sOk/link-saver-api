const redis = require("../utils/redis");

// Get Generic's links
const handleGetGenericLinks = (db) => (req, res) => {
  const { user_id } = req.params;

  if (!user_id) return res.status(400).json("have no access to this data");

  db.select("id", "link_title", "link_url", "status")
    .from("links")
    .where({ user_id, group_id: null })
    .orderBy("status")
    .then((links) => res.status(200).json(links))
    .catch(() => res.status(400).json("something is going wrong"));
};

// Get Groups's links
const handleGetGroupsLinks = (db) => (req, res) => {
  const { params } = req.params;
  let splited = params.split("&");
  let user_id = splited[0];
  let group_id = splited[1];

  if (!user_id || !group_id) return res.status(400).json("have no access to this data");

  db.select("id", "link_title", "link_url")
    .from("links")
    .where({ user_id, group_id })
    .orderBy("status")
    .then((links) => res.status(200).json(links))
    .catch(() => res.status(400).json("something is going wrong"));
};

// Add link
const handleAddLinks = (db) => (req, res) => {
  const { user_id, link_title, link_url, group_id } = req.body;

  if (!user_id || !link_url) return res.status(400).json("bad field");

  db.insert({
    user_id,
    group_id: group_id ? group_id : null,
    link_title,
    link_url,
    created_at: new Date(),
  })
    .into("links")
    .returning("id")
    .then((link_id) => res.status(200).json(link_id[0]))
    .catch(() => res.status(400).json("something is going wrong"));
};

// Change/update link:
// Title or Url
const handleChangeLinks = (db) => (req, res) => {
  const { id, link_title, link_url } = req.body;

  if (!id) return res.status(400).json("bad field");

  db.update({ link_title, link_url })
    .into("links")
    .where({ id })
    .then(() => res.status(200).json("link succesfully updated"))
    .catch(() => res.status(400).json("something is going wrong"));
};

// Status
const handleChangeStatus = (db) => (req, res) => {
  const { id, status } = req.body;

  if (!id) return res.status(400).json("bad field");

  db.update({ status })
    .into("links")
    .where({ id })
    .then(() => res.status(200).json("link succesfully updated"))
    .catch(() => res.status(400).json("something is going wrong"));
};

// Group
const handleChangeLinksGroup = (db) => (req, res) => {
  const { id, group_id } = req.body;

  if (!id) return res.status(400).json("bad field");

  db.update({ group_id })
    .into("links")
    .where({ id })
    .then(() => res.status(200).json("link succesfully updated"))
    .catch(() => res.status(400).json("something is going wrong"));
};

// Delete link
const handleDeleteLinks = (db) => (req, res) => {
  const { id, user_id } = req.body;

  if (!id || !user_id) return res.status(400).json("bad field");

  db.transaction((trx) => {
    trx
      .del()
      .into("links")
      .where({ id })
      .returning("*")
      .then((data) => {
        return trx
          .insert({ user_id, data_id: id, data_type: "link" })
          .into("archive")
          .then(() => data)
          .catch(() => "archive table fail");
      })
      .then((link) => redis.addIntoArchive(user_id, "link", link[0]))
      .then(() => res.status(200).json("link succesfully deleted"))
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch(() => res.status(400).json("something is going wrong"));
};

module.exports = {
  handleGetGenericLinks,
  handleGetGroupsLinks,
  handleAddLinks,
  handleChangeLinks,
  handleChangeLinksGroup,
  handleChangeStatus,
  handleDeleteLinks,
};
