--@block
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
-- not used atm
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
    positive_message TEXT DEFAULT NULL,
    positive_message_appraiser_edit TEXT DEFAULT NULL,
    negative_message TEXT DEFAULT NULL,
    negative_message_appraiser_edit TEXT DEFAULT NULL,
    submission_date DATETIME NOT NULL,
    category ENUM(
        'general',
        'execution-and-delivery',
        'innovation',
        'agility',
        'commitment',
        'communication',
        'customer-orientation'
    ) NOT NULL,
    privacy ENUM('anonymous', 'private', 'public') NOT NULL,
    visibility ENUM('sender', 'appraiser', 'receiver') NOT NULL,
    rating INT UNSIGNED NOT NULL,
    is_read_receiver BOOLEAN DEFAULT false,
    is_read_appraiser BOOLEAN DEFAULT false,
    appraiser_notes TEXT DEFAULT NULL,
    PRIMARY KEY (feedback_id),
    FOREIGN KEY (sender_id) REFERENCES users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES users(user_id)
);
--@block
-- show tables
SELECT *
FROM users;
SELECT *
FROM user_circle;
SELECT *
FROM feedbacks;
--@block
-- insert dummy data
INSERT INTO users (name, email, role, encrypted_password, appraiser_id, appraiser_notes)
VALUES  ("Ricardo Castro", "ricardocastro@criticalmanufacturing.com", "admin", "-", null, ""),
        ("Sónia Araújo", "soniaaraujo@criticalmanufacturing.com", "appraiser", "-", null, ""),
        ("Duarte Pereira", "duartepereira@criticalmanufacturing.com", "user", "-", 2, "notes about duarte"),
        ("Vasco Cruz", "vascocruz@criticalmanufacturing.com", "user", "-", 2, "notes about vasco"),
        ("Another User", "anotheruser@criticalmanufacturing.com", "user", "-", null, "this guy has no feedbacks");
--
INSERT INTO feedbacks (sender_id, receiver_id, title, positive_message, positive_message_appraiser_edit, negative_message, negative_message_appraiser_edit, submission_date, category, privacy, visibility, rating, appraiser_notes)
VALUES  (1, 3, "Feedback 1", "This is the positive_message for feedback 1", "This is the positive_message for feedback 1", "This is the negative_message for feedback 1", "This is the negative_message for feedback 1", "2003-01-01 00:58:00", "general", "anonymous", "appraiser", 1, "Appraiser notes for feedback 1" ),
        (2, 3, "Feedback 2", "This is the positive_message for feedback 2", "This is the positive_message for feedback 2", "This is the negative_message for feedback 2", "This is the negative_message for feedback 2", "2006-03-10 05:50:03", "execution-and-delivery", "private", "appraiser", 2, "Appraiser notes for feedback 2" ),
        (1, 3, "Feedback 3", "This is the positive_message for feedback 3", "This is the positive_message for feedback 3", "This is the negative_message for feedback 3", "This is the negative_message for feedback 3", "2012-05-20 09:40:14", "innovation", "public", "appraiser", 3, "Appraiser notes for feedback 3" ),
        (2, 3, "Feedback 4", "This is the positive_message for feedback 4", "This is the positive_message for feedback 4", "This is the negative_message for feedback 4", "This is the negative_message for feedback 4", "2018-07-30 12:32:25", "agility", "anonymous", "appraiser", 4, "Appraiser notes for feedback 4" ),
        (1, 3, "Feedback 5", "This is the positive_message for feedback 5", "This is the positive_message for feedback 5", "This is the negative_message for feedback 5", "This is the negative_message for feedback 5", "2022-09-15 15:24:36", "commitment", "private", "appraiser", 1, "Appraiser notes for feedback 5" ),
        (2, 3, "Feedback 6", "This is the positive_message for feedback 6", "This is the positive_message for feedback 6", "This is the negative_message for feedback 6", "This is the negative_message for feedback 6", "2023-12-25 19:12:47", "communication", "public", "appraiser", 2, "Appraiser notes for feedback 6" ),
        (1, 3, "Feedback 7", "This is the positive_message for feedback 7", "This is the positive_message for feedback 7", "This is the negative_message for feedback 7", "This is the negative_message for feedback 7", "2024-03-31 23:01:59", "customer-orientation", "anonymous", "appraiser", 3, "Appraiser notes for feedback 7" );