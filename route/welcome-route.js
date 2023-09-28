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

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.status(200).redirect("/");
});

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "welcome.html"));
});

module.exports = router;
