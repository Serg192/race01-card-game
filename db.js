const mysql = require("mysql2");
const config_file = require("./config.json");

const pool = mysql.createPool(config_file);

pool.on("error", (err) => {
  console.error("Database error: " + err.message);
});

module.exports = pool.promise();
