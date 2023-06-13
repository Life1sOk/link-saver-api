const connectSocketHandler = (wss) => (ws, req) => {
  console.log("connection WEB SOCKET");

  ws.on("message", (connection) => {
    const msg = JSON.parse(connection);
    ws.id = msg.user_id;
  });
};

const handleSendMessage = (wss, toUser, message) => {
  const aWss = wss.getWss();

  aWss.clients.forEach((client) => {
    if (client.id === toUser.toString()) {
      client.send(JSON.stringify(message));
    }
  });
};

module.exports = {
  connectSocketHandler,
  handleSendMessage,
};
