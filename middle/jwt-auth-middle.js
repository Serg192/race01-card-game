const jwt = require("jsonwebtoken");
const props = require("../properties");

module.exports = (req, res, next) => {
  try {
    const token = req.cookies.token;
    const user = jwt.verify(token, props.SECRET);
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.redirect("/");
  }
};
