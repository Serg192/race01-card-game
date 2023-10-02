const jwt = require("jsonwebtoken");
const path = require("path");
const express = require("express");
const router = express.Router();

const AccountDetails = require("../models/account-details");
const User = require("../models/user");

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "lobby.html"));
});

router.get("/login", (req, res) => {
  const decoded = jwt.decode(req.cookies.token);
  res.json({
    login: decoded.login,
  });
});

router.get("/profile_picture", async (req, res) => {
  const userID = jwt.decode(req.cookies.token).id;

  const userStats = await new AccountDetails().findBy("user_id", userID);

  if (userStats && userStats.length > 0) {
    const userPicture = userStats[0].user_picture;
    
    res.json({
      profile_picture: userPicture,
    });
  }
});

router.get("/user_details", async (req, res) => {
  const userID = jwt.decode(req.cookies.token).id;

  const user = new User();
  const userData = await user.findBy("id", userID);

  if (userData && userData.length > 0) {
    const fullName = userData[0].user_full_name;
    const email = userData[0].user_email;

    res.json({
      full_name: fullName,
      email: email,
    });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.status(200).redirect("/");
});

module.exports = router;