const jwt = require("jsonwebtoken");
const path = require("path");
const express = require("express");
const router = express.Router();

const { validateLoginData } = require("../validation");
const User = require("../models/user");
const props = require("../properties");

function generateUserJWT(login, id) {
  const payload = {
    login,
    id,
  };

  return jwt.sign(payload, props.SECRET, { expiresIn: "1h" });
}

router.post("/", async (req, res) => {
  const validationResult = await validateLoginData(req.body);
  if (validationResult.valid) {
    const userId = (await new User().findByLogin(req.body.login))[0].id;
    const jwtToken = generateUserJWT(req.body.login, userId);
    res.cookie("token", jwtToken, { httpOnly: true });
    res.redirect("/lobby"); //previously "/welcome"
  } else {
    res.status(401).json({
      message: validationResult.message,
    });
  }
});

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "login.html"));
});

module.exports = router;
