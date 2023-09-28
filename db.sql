CREATE DATABASE IF NOT EXISTS ucode_web;
CREATE USER IF NOT EXISTS 'sstohnij'@'localhost' IDENTIFIED BY 'securepass';
GRANT ALL PRIVILEGES ON ucode_web.* TO 'sstohnij'@'localhost';

USE ucode_web;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT,
    user_login VARCHAR(40) UNIQUE NOT NULL,
    user_password TEXT NOT NULL,
    user_full_name VARCHAR(50) NOT NULL,
    user_email VARCHAR(35) UNIQUE NOT NULL,
    user_role ENUM('admin', 'user') DEFAULT 'user',
    PRIMARY KEY(id)
);