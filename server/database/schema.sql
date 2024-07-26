-- remove database
DROP DATABASE IF EXISTS performance_feedback_circle;
--
--
-- create the database
CREATE DATABASE IF NOT EXISTS performance_feedback_circle;
USE performance_feedback_circle;
--
--
-- create the tables
CREATE TABLE IF NOT EXISTS users(
    user_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    email VARCHAR(255) NOT NULL,
    role ENUM('user', 'appraiser', 'admin') NOT NULL,
    appraiser_id INT UNSIGNED DEFAULT NULL,
    UNIQUE(email),
    PRIMARY KEY (user_id),
    FOREIGN KEY (appraiser_id) REFERENCES users(user_id)
);
--
CREATE TABLE IF NOT EXISTS user_circle (
    user_id INT UNSIGNED NOT NULL,
    related_user_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (user_id, related_user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (related_user_id) REFERENCES users(user_id)
);
--
CREATE TABLE IF NOT EXISTS feedbacks(
    feedback_id BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
    sender_id INT UNSIGNED NOT NULL,
    receiver_id INT UNSIGNED NOT NULL,
    category ENUM(
        'general',
        'execution-and-delivery',
        'innovation',
        'agility',
        'commitment',
        'communication',
        'customer-orientation'
    ) NOT NULL,
    type ENUM('positive', 'negative') NOT NULL,
    privacy ENUM('anonymous', 'private', 'public') NOT NULL,
    visibility ENUM('appraiser', 'both') NOT NULL DEFAULT "appraiser",
    body TEXT NOT NULL,
    PRIMARY KEY (feedback_id),
    FOREIGN KEY (sender_id) REFERENCES users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES users(user_id)
);
--
--
-- insert dummy data
INSERT INTO users (email, role, appraiser_id)
VALUES (
        "ricardocastro@criticalmanufacturing.com",
        "admin",
        null
    ),
    (
        "soniaaraujo@criticalmanufacturing.com",
        "appraiser",
        null
    ),
    (
        "duartepereira@criticalmanufacturing.com",
        "user",
        2
    ),
    (
        "vascocruz@criticalmanufacturing.com",
        "user",
        2
    );
--
INSERT INTO feedbacks (
        sender_id,
        receiver_id,
        category,
        type,
        privacy,
        body
    )
VALUES (
        3,
        2,
        "general",
        "negative",
        "anonymous",
        "feedback from duarte to sonia"
    ),
    (
        1,
        1,
        "execution-and-delivery",
        "positive",
        "private",
        "feedback from ricardo to ricardo"
    ),
    (
        1,
        2,
        "innovation",
        "negative",
        "public",
        "feedback from ricardo to sonia"
    ),
    (
        2,
        3,
        "communication",
        "positive",
        "anonymous",
        "feedback from sonia to duarte"
    ),
    (
        4,
        3,
        "customer-orientation",
        "negative",
        "private",
        "feedback from vasco to duarte"
    );
--
--
--@block
-- show tables
SELECT *
FROM users;
SELECT *
FROM user_circle;
SELECT *
FROM feedbacks;