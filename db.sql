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

CREATE TABLE IF NOT EXISTS account_details (
    user_id INT UNSIGNED NOT NULL,
    user_picture VARCHAR(10) DEFAULT '1.png',
    user_coins INT UNSIGNED DEFAULT 100,
    user_wins INT UNSIGNED DEFAULT 0,
    user_losses INT UNSIGNED DEFAULT 0,
    PRIMARY KEY(user_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cards (
    id INT UNSIGNED AUTO_INCREMENT,
    card_name VARCHAR(40) UNIQUE NOT NULL,
    card_class ENUM('tankman', 'healer', 'dps') NOT NULL,
    card_attack INT UNSIGNED NOT NULL,
    card_defence INT UNSIGNED NOT NULL,
    card_usage_price INT UNSIGNED NOT NULL,
    card_price INT UNSIGNED NOT NULL,
    card_picture VARCHAR(30) UNIQUE NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS user_cards (
    user_id INT UNSIGNED NOT NULL,
    card_id INT UNSIGNED NOT NULL,
    PRIMARY KEY(user_id, card_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);