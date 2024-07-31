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
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    encrypted_password TEXT NOT NULL,
    role ENUM('user', 'appraiser', 'admin') NOT NULL,
    appraiser_id INT UNSIGNED DEFAULT NULL,
    appraiser_notes TEXT DEFAULT NULL,
    UNIQUE(name),
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
    title TEXT NOT NULL,
    body TEXT NOT NULL,
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
    is_read BOOLEAN DEFAULT false,
    appraiser_notes TEXT DEFAULT NULL,
    PRIMARY KEY (feedback_id),
    FOREIGN KEY (sender_id) REFERENCES users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES users(user_id)
);
--
--
-- insert dummy data
INSERT INTO users (
        name,
        email,
        role,
        encrypted_password,
        appraiser_id,
        appraiser_notes
    )
VALUES (
        "Ricardo Castro",
        "ricardocastro@criticalmanufacturing.com",
        "admin",
        "-",
        null,
        ""
    ),
    (
        "Sónia Araújo",
        "soniaaraujo@criticalmanufacturing.com",
        "appraiser",
        "-",
        null,
        ""
    ),
    (
        "Duarte Pereira",
        "duartepereira@criticalmanufacturing.com",
        "user",
        "-",
        2,
        "notes about duarte"
    ),
    (
        "Vasco Cruz",
        "vascocruz@criticalmanufacturing.com",
        "user",
        "-",
        2,
        "notes about vasco"
    );
--
INSERT INTO feedbacks (
        sender_id,
        receiver_id,
        title,
        body,
        category,
        type,
        privacy,
        visibility,
        appraiser_notes
    )
VALUES (
        3,
        2,
        "duarte to sonia",
        "feedback from duarte to sonia",
        "general",
        "negative",
        "anonymous",
        "both",
        "this is a feedback sent from duarte to sonia"
    ),
    (
        1,
        1,
        "ricardo to ricardo",
        "feedback from ricardo to ricardo",
        "execution-and-delivery",
        "positive",
        "private",
        "both",
        "this is a feedback sent from ricardo to ricardo"
    ),
    (
        1,
        2,
        "ricardo to sonia",
        "feedback from ricardo to sonia",
        "innovation",
        "negative",
        "public",
        "appraiser",
        "this is a feedback sent from ricardo to sonia"
    ),
    (
        2,
        3,
        "sonia to duarte",
        "feedback from sonia to duarte",
        "communication",
        "positive",
        "anonymous",
        "appraiser",
        "this is a feedback sent from sonia to duarte"
    ),
    (
        4,
        3,
        "vasco to duarte",
        "feedback from vasco to duarte",
        "customer-orientation",
        "negative",
        "private",
        "both",
        "this is a feedback sent from vasco to duarte"
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