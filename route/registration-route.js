const bcrypt = require("bcrypt");
const path = require("path");
const express = require("express");
const router = express.Router();

const { validateRegistrationData } = require("../validation");
const User = require("../models/user");

router.post("/", async (req, res) => {
  const validationResult = await validateRegistrationData(req.body);
  if (validationResult.valid) {
    const newUser = new User({
      userLogin: req.body.login,
      userPassword: await bcrypt.hash(req.body.password, 10),
      userFullName: req.body.fullName,
      userEmail: req.body.email,
    });
    if (!newUser.save()) {
      res.status(500).json({
        message: "Cannot create new user",
      });
    } else {
      res.status(200).json({});
    }
  } else {
    res.status(422).json({
      message: validationResult.message,
    });
  }
});

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "registration.html"));
});

module.exports = router;
