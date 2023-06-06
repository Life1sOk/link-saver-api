const EventEmitter = require("events");

const eventEmitter = new EventEmitter();

const handlerGetConnection = (db) => (req, res) => {
  const { user_id } = req.params;

  res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");

  res.writeHead(200, {
    Connection: "keep-alive",
    "Content-type": "text/event-stream",
    "Cache-Control": "no-cache",
    // "Access-Control-Allow-Origin": "*",
    // 'Access-Control-Allow-Credentials': 'true'
  });

  eventEmitter.on(`${user_id}`, (message) => {
    res.write(`data: ${JSON.stringify(message)} \n\n`);
  });
};

const handleSendMessage = (toUser, message) => {
  /* 
    toUser: user_id 
    message: {
      type: string,
      data: {} | any
    }
  */

  eventEmitter.emit(`${toUser}`, message);
};

module.exports = {
  handlerGetConnection,
  handleSendMessage,
};
