const express = require("express");
const app = express();
require("dotenv").config();

const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cors = require("cors");
const knex = require("knex");
const wss = require("express-ws")(app);

const user = require("./controllers/user");
const register = require("./controllers/register");
const signin = require("./controllers/signin");
const topics = require("./controllers/topics");
const groups = require("./controllers/groups");
const links = require("./controllers/links");
const friends = require("./controllers/friend");
const transition = require("./controllers/transition");
const archive = require("./controllers/archive");
const confirm = require("./controllers/confirm");

const websocket = require("./utils/websocket");

const db = knex({
  client: "pg",
  // connection: process.env.POSTGRES_URI,
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

app.use(bodyParser.json());
app.use(cors());

// WebSocket //
app.ws("/connect", websocket.connectSocketHandler(wss));
// ------------------ //

app.get("/", (request, response) => response.send("It is working right now"));

app.post("/signin", signin.signinAuthentication(db, bcrypt));
app.post("/register", register.registerAuthentication(db, bcrypt));

app.get("/confirm/:token", confirm.handleConfirmation(db));
app.post("/confirm/verification", confirm.handleSendConfirmationAgain(db));
app.post("/confirm/reset", confirm.handleSendResetPassword(db));

app.get("/profile/:user_id", user.handlerGetUser(db));
app.put("/profile/update/username", user.handlerUpdateUsername(db));
app.put("/profile/update/email", user.handlerUpdateUserEmail(db));
app.put("/profile/update/password", user.handlerChangeUserPassword(db, bcrypt));
app.put(
  "/profile/update/passwordbytoken",
  user.handlerChangeUserPasswordByToken(db, bcrypt)
);
app.get("/profile/search/:uservalue", user.handlerGetUserSearch(db));

app.get("/friends/:user_id", friends.handlerGetFriends(db));
app.post("/friends/invite", friends.handleInviteFriend(db, wss));
app.post("/friends/accept", friends.handleAcceptFriend(db, wss));
app.delete("/friends/cancle", friends.handleCancleFriend(db));
app.delete("/friends/delete", friends.handleDeleteFriend(db, wss));

app.get("/transition/:user_id", transition.handleTransitionGet(db));
app.post("/transition/add", transition.handleTransitionAdd(db, wss));
app.put("/transition/accept", transition.handleTransitionAccept(db));
app.delete("/transition/cancel", transition.handleTransitionCancel(db));

app.get("/topics/:user_id", topics.handleGetTopics(db));
app.get("/topics/group_count/:params", topics.handleGetTopicCount(db));
app.post("/topics/add", topics.handleAddTopic(db));
app.put("/topics/change", topics.handlerChangeTopic(db));
app.delete("/topics/delete", topics.handleDeleteTopic(db));

app.get("/groups/:params", groups.handleGetGroupsWithLinks(db));
app.post("/groups/add", groups.handleAddGroup(db));
app.put("/groups/change", groups.handleChangeGroup(db));
app.put("/groups/transaction", groups.handleChangeGroupTopicId(db));
app.delete("/groups/delete", groups.handleDeleteGroup(db));

app.get("/links/generic/:user_id", links.handleGetGenericLinks(db));
app.get("/links/groups/:params", links.handleGetGroupsLinks(db));

app.post("/links/add", links.handleAddLinks(db));
app.put("/links/change", links.handleChangeLinks(db));
app.put("/links/change/group", links.handleChangeLinksGroup(db));
app.put("/links/change/status", links.handleChangeStatus(db));
app.delete("/links/delete", links.handleDeleteLinks(db));

app.get("/archive/:user_id", archive.handleGetArchive(db));
app.put("/archive/restore", archive.handleRestoreArchive(db));
app.put("/archive/delete", archive.handleDeleteArchive(db));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App is runnig on port ${PORT}`);
});
