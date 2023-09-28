const nodemailer = require("nodemailer");
const path = require("path");
const express = require("express");
const router = express.Router();

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

function createMailOptions(to, password) {
  return {
    from: {
      name: "Password reminder",
      address: "nodejsemailtest4545@gmail.com",
    },
    to: to,
    subject: "Your password",
    html: `<h1>Hi</h1>
            <p>I store encrypted with bcrypt passwords in my database for safety reasons,</p>
            <p>and there is no straightforward way to send you the raw password.</p>
            <p>However, here is its hash: <b>${password}</b>.</p>
            <p>This is the only information I can provide.</p>
            <p>In real life, I could offer you the option to reset it, but the task dictates that I must send password to you.</p>
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
      await transporter.sendMail(
        createMailOptions(req.body.email, rows[0].user_password)
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

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "remind-password.html"));
});

module.exports = router;
