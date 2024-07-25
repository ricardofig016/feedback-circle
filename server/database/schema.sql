-- create the database
CREATE DATABASE IF NOT EXISTS performance_feedback_circle;
USE performance_feedback_circle;
--
--
-- create the tables
CREATE TABLE IF NOT EXISTS users(
    user_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    appraiser_id INT UNSIGNED DEFAULT NULL,
    email VARCHAR(255) NOT NULL,
    access ENUM('user', 'appraiser') NOT NULL,
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
    evaluation ENUM("positive", "negative") NOT NULL,
    visibility ENUM("public", "private") NOT NULL,
    body TEXT NOT NULL,
    PRIMARY KEY (feedback_id),
    FOREIGN KEY (sender_id) REFERENCES users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES users(user_id)
);
--
--
-- insert dummy data
INSERT INTO users (email, access)
VALUES (
        "RicardoCastro@criticalmanufacturing.com",
        "user"
    );
INSERT INTO feedbacks (
        sender_id,
        receiver_id,
        category,
        evaluation,
        visibility,
        body
    )
VALUES (
        1,
        1,
        "general",
        "positive",
        "public",
        "this is the body"
    );