const nodemailer = require("nodemailer");
const path = require("path");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const User = require("../models/user");
const props = require("../properties");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: props.EMAIL,
    pass: props.EMAIL_PASS,
  },
});

function genCode() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

function createMailOptions(to, confirmCode) {
  return {
    from: {
      name: "Password reminder",
      address: "nodejsemailtest4545@gmail.com",
    },
    to: to,
    subject: "Your password",
    html: `<h1>Hi</h1>
            <p>You received this letter because you want to reset your password.</p>
            <p>Here is the confirmation code: <b>${confirmCode}</b></p>
            <p>Do not show it to anyone and complete the password reset operation as soon as possible..</p>
    `,
  };
}

router.post("/", async (req, res) => {
  const rows = await new User().findByEmail(req.body.email);
  if (rows.length == 0) {
    res.status(404).json({
      message: "Email does not exist in database",
    });
  } else {
    try {
      const confirmCode = genCode();
      const user = new User({
        id: rows[0].id,
        userLogin: rows[0].user_login,
        userPassword: rows[0].user_password,
        userFullName: rows[0].user_full_name,
        userEmail: rows[0].user_email,
        userConfirmCode: confirmCode,
      });
      user.save();

      await transporter.sendMail(
        createMailOptions(req.body.email, confirmCode)
      );
      res.status(200).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "An error occurred while trying to send email",
      });
    }
  }
});

router.post("/reset-password", async (req, res) => {
  const rows = await new User().findByConfirmCode(req.body.confirmation);
  const newPass = req.body.newPass;
  const confirmPass = req.body.confirmPass;

  if (rows.length == 0) {
    res.status(404).json({
      message: "Verification code is incorrect",
    });
  } else if (newPass !== confirmPass) {
    res.status(404).json({
      message: "Passwords don't match",
    });
  } else if (newPass.length < props.MIN_PASSWORD_LEN) {
    res.status(404).json({
      message: `Password should have at least ${props.MIN_PASSWORD_LEN} characters!`,
    });
  } 
  else {
    try {

      const user = new User({
        id: rows[0].id,
        userLogin: rows[0].user_login,
        userPassword: await bcrypt.hash(newPass, 10),
        userFullName: rows[0].user_full_name,
        userEmail: rows[0].user_email,
        userConfirmCode: null,
      });
      user.save();

      res.status(200).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Reset password error",
      });
    }
  }
});

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "remind-password.html"));
});

module.exports = router;
