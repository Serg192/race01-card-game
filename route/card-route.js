const jwt = require("jsonwebtoken");
const path = require("path");
const express = require("express");
const router = express.Router();

router.get("/role", (req, res) => {
    const decoded = jwt.decode(req.cookies.token);
    res.json({
      role: decoded.role,
    });
});

router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../views", "card.html"));
});

router.get("/lobby", (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "lobby.html"));
});

module.exports = router;