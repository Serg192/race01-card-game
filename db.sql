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
    card_health INT UNSIGNED DEFAULT 50,
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

INSERT INTO cards (card_name, card_class, card_attack, card_defence, card_usage_price, card_price, card_picture)
VALUES
('Black Panther', 'dps', 9, 7, 10, 45, 'black-panther.jpg'),
('Black Widow', 'tankman', 6, 10, 10, 45, 'black-widow.jpg'),
('Captain America', 'dps', 8, 6, 5, 40, 'captain-america.jpg'),
('Corvus Glaive', 'dps', 8, 2, 0, 25, 'corvus-glaive.jpg'),
('Doctor Strange', 'healer', 4, 7, 0, 20, 'doctor-strange.jpg'),
('Drax', 'dps', 10, 6, 5, 40, 'drax.jpg'),
('Ebony Maw', 'tankman', 9, 9, 15, 50, 'ebony-maw.jpg'),
('Gamora', 'dps', 10, 7, 10, 50, 'gamora.jpg'),
('Groot', 'tankman', 5, 10, 5, 45, 'groot.jpg'),
('Heimdall', 'healer', 4, 7, 0, 25, 'heimdall.jpg'),
('Hulk', 'tankman', 7, 9, 15, 45, 'hulk.jpg'),
('Iron Man', 'dps', 9, 5, 5, 40, 'iron-man.jpg'),
('Loki', 'healer', 3, 4, 0, 10, 'loki.jpg'),
('Mantis', 'healer', 2, 5, 0, 10, 'mantis.jpg'),
('Nebula', 'dps', 9, 5, 10, 45, 'nebula.jpg'),
('Okoye', 'healer', 4, 6, 0, 20, 'okoye.jpg'),
('Proxima Midnight', 'dps', 7, 4, 0, 35, 'proxima-midnight.jpg'),
('Roket', 'dps', 6, 3, 0, 15, 'roket.jpg'),
('Sam Wilson', 'dps', 7, 6, 0, 35, 'sam-wilson.jpg'),
('Shuri', 'tankman', 7, 8, 5, 40, 'shuri.jpg'),
('Spider Man', 'dps', 10, 8, 10, 50, 'spider-man.jpg'),
('Star Lord', 'dps', 8, 10, 15, 50, 'star-lord.jpg'),
('Thanos', 'tankman', 6, 9, 5, 40, 'thanos.jpg'),
('The Collector', 'healer', 4, 7, 0, 25, 'the-collector.jpg'),
('Thor', 'tankman', 7, 7, 10, 40, 'thor.jpg'),
('Vision', 'healer', 3, 5, 0, 10, 'vision.jpg'),
('Wanda Maximoff', 'healer', 5, 6, 0, 30, 'wanda-maximoff.jpg'),
('War Machine', 'tankman', 7, 6, 5, 35, 'war-machine.jpg'),
('Winter Soldier', 'dps', 9, 7, 15, 45, 'winter-soldier.jpg'),
('Wong', 'healer', 5, 5, 0, 15, 'wong.jpg');