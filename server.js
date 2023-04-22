const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cors = require("cors");
const knex = require("knex");

const register = require("./controllers/register");
const signin = require("./controllers/signin");
const topics = require("./controllers/topics");
const groups = require("./controllers/groups");
const links = require("./controllers/links");

// connection: process.env.POSTGRES_URI,
const db = knex({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get("/", (request, response) => {
  response.send("It is working right now");
});

app.post("/signin", signin.signinAuthentication(db, bcrypt));
app.post("/register", register.registerAuthentication(db, bcrypt));

app.get("/topics/:user_id", topics.handleGetTopics(db));
app.post("/topics/add", topics.handleAddTopic(db));
app.put("/topics/change", topics.handlerChangeTopic(db));
app.delete("/topics/delete", topics.handleDeleteTopic(db));

app.get("/groups/:params", groups.handleGetGroupsWithLinks(db));
app.post("/groups/add", groups.handleAddGroup(db));
app.put("/groups/change", groups.handleChangeGroup(db));
app.delete("/groups/delete", groups.handleDeleteGroup(db));

app.get("/links/generic/:user_id", links.handleGetGenericLinks(db));
app.get("/links/groups/:params", links.handleGetGroupsLinks(db));

app.post("/links/add", links.handleAddLinks(db));
app.put("/links/change", links.handleChangeLinks(db));
app.put("/links/change/group", links.handleChangeLinksGroup(db));
app.put("/links/change/status", links.handleChangeStatus(db));
app.delete("/links/delete", links.handleDeleteLinks(db));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App is runnig on port ${PORT}`);
});
