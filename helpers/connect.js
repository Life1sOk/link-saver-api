const EventEmitter = require("events");

const eventEmitter = new EventEmitter();

const handlerGetConnection = (db) => (req, res) => {
  const { user_id } = req.params;

  res.writeHead(200, {
    Connection: "keep-alive",
    "Content-type": "text/event-stream",
    "Cache-Control": "no-cache",
  });

  eventEmitter.on(`${user_id}`, (message) => {
    res.write(`data: ${JSON.stringify(message)} \n\n`);
  });
};

const handleInviteFriend = (toUser, message) => {
  eventEmitter.emit(`${toUser}`, message);
};

module.exports = {
  handlerGetConnection,
  handleInviteFriend,
};
