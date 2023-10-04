const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();

const loginRoute = require("./route/login-route");
const regRoute = require("./route/registration-route");
const remindPassword = require("./route/password-rem-route");
const gameApiRoute = require("./route/game-api-route");
const lobbyRoute = require("./route/lobby-route");

const jwtAuthMid = require("./middle/jwt-auth-middle");

const { initSocket } = require("./socket");

const http = require("http");
const server = http.createServer(app);

initSocket(server);

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
app.use("/login", loginRoute);
app.use("/signup", regRoute);
app.use("/pass-remind", remindPassword);

app.use("/game-api", jwtAuthMid);
app.use("/game-api", gameApiRoute);
app.use("/lobby", jwtAuthMid);
app.use("/lobby", lobbyRoute);

app.use(express.static(__dirname + "/public"));

const port = 4545;

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/game-map", jwtAuthMid, (req, res) => {
  res.sendFile(__dirname + "/views/game-map.html");
});

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/views/not-found.html");
});

server.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});
