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

const handleClearArchive = (db) => (req, res) => {
  const { user_id, data_id, data_type } = req.body;

  if (!user_id || !data_id || !data_type)
    return res.status(400).json("have no access to this data");

  db.del()
    .into("archive")
    .where({ user_id, data_id, data_type })
    .then(() => redis.deleteFromArchive(user_id, data_id, data_type))
    .then(() => res.status(200).json("archive succesfully deleted"))
    .catch(() => res.status(400).json("something is going wrong"));
};

module.exports = {
  handleGetArchive,
  handleClearArchive,
};