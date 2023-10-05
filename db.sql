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
    user_confirmation_code VARCHAR(35),
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
    card_health INT UNSIGNED NOT NULL,
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

INSERT INTO cards (card_name, card_class, card_attack, card_defence, card_health, card_usage_price, card_price, card_picture)
VALUES
('Black Panther', 'dps', 45, 30, 85, 7, 100, 'black-panther.jpg'),
('Black Widow', 'tankman', 32, 40, 80, 6, 100, 'black-widow.jpg'),
('Captain America', 'dps', 47, 32, 95, 8, 125, 'captain-america.jpg'),
('Corvus Glaive', 'dps', 35, 22, 65, 4, 20, 'corvus-glaive.jpg'),
('Doctor Strange', 'healer', 18, 25, 70, 4, 25, 'doctor-strange.jpg'),
('Drax', 'dps', 42, 20, 75, 6, 50, 'drax.jpg'),
('Ebony Maw', 'tankman', 38, 50, 80, 7, 125, 'ebony-maw.jpg'),
('Gamora', 'dps', 50, 45, 90, 8, 150, 'gamora.jpg'),
('Groot', 'tankman', 27, 30, 60, 3, 20, 'groot.jpg'),
('Heimdall', 'healer', 20, 24, 65, 4, 20, 'heimdall.jpg'),
('Hulk', 'tankman', 28, 41, 75, 5, 75, 'hulk.jpg'),
('Iron Man', 'dps', 37, 25, 70, 5, 50, 'iron-man.jpg'),
('Loki', 'healer', 16, 20, 75, 5, 25, 'loki.jpg'),
('Mantis', 'healer', 21, 35, 80, 6, 50, 'mantis.jpg'),
('Nebula', 'dps', 48, 44, 95, 9, 150, 'nebula.jpg'),
('Okoye', 'healer', 28, 32, 90, 7, 75, 'okoye.jpg'),
('Proxima Midnight', 'dps', 40, 20, 50, 3, 20, 'proxima-midnight.jpg'),
('Roket', 'dps', 36, 30, 70, 4, 50, 'roket.jpg'),
('Sam Wilson', 'dps', 38, 26, 75, 5, 50, 'sam-wilson.jpg'),
('Shuri', 'tankman', 28, 35, 50, 3, 20, 'shuri.jpg'),
('Spider Man', 'dps', 50, 36, 100, 10, 150, 'spider-man.jpg'),
('Star Lord', 'dps', 36, 18, 70, 4, 25, 'star-lord.jpg'),
('Thanos', 'tankman', 26, 38, 75, 5, 50, 'thanos.jpg'),
('The Collector', 'healer', 18, 23, 50, 3, 20, 'the-collector.jpg'),
('Thor', 'tankman', 30, 35, 55, 3, 20, 'thor.jpg'),
('Vision', 'healer', 25, 30, 50, 3, 20, 'vision.jpg'),
('Wanda Maximoff', 'healer', 22, 44, 65, 4, 50, 'wanda-maximoff.jpg'),
('War Machine', 'tankman', 35, 48, 95, 8, 125, 'war-machine.jpg'),
('Winter Soldier', 'dps', 42, 27, 55, 3, 75, 'winter-soldier.jpg'),
('Wong', 'healer', 20, 50, 100, 9, 150, 'wong.jpg');