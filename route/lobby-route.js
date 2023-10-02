const jwt = require("jsonwebtoken");
const path = require("path");
const express = require("express");
const router = express.Router();

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.status(200).redirect("/");
});

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "lobby.html"));
});

module.exports = router;
