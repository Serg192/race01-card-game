const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();

const loginRoute = require("./route/login-route");
const regRoute = require("./route/registration-route");
// const welcomeRoute = require("./route/welcome-route");
const remindPassword = require("./route/password-rem-route");
const lobbyRoute = require("./route/lobby-route");

const jwtAuthMid = require("./middle/jwt-auth-middle");

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
// app.use("/welcome", jwtAuthMid);
// app.use("/welcome", welcomeRoute);
app.use("/lobby", jwtAuthMid);
app.use("/lobby", lobbyRoute);

app.use(express.static(__dirname + "/public"));

const port = 4545;

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/style.css", (req, res) => {
  res.sendFile(__dirname + "/public/style.css");
});

app.get("/lobby-style.css", (req, res) => {
  res.sendFile(__dirname + "/public/lobby-style.css");
});

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/views/not-found.html");
});

app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});
