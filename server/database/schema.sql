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
    appraiser_id INT UNSIGNED DEFAULT NULL,
    appraiser_notes TEXT DEFAULT NULL,
    UNIQUE(name),
    UNIQUE(email),
    PRIMARY KEY (user_id),
    FOREIGN KEY (appraiser_id) REFERENCES users(user_id) ON DELETE SET NULL
);
--
CREATE TABLE IF NOT EXISTS feedbacks(
    feedback_id BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
    sender_id INT UNSIGNED DEFAULT NULL,
    receiver_id INT UNSIGNED NOT NULL,
    title TEXT NOT NULL,
    positive_message TEXT DEFAULT NULL,
    positive_message_appraiser_edit TEXT DEFAULT NULL,
    negative_message TEXT DEFAULT NULL,
    negative_message_appraiser_edit TEXT DEFAULT NULL,
    submission_date DATETIME NOT NULL,
    competency ENUM('general', 'execution-and-delivery', 'innovation', 'agility', 'commitment', 'communication', 'customer-orientation') NOT NULL,
    privacy ENUM('anonymous', 'private', 'public') NOT NULL,
    rating INT UNSIGNED NOT NULL,
    is_read_receiver BOOLEAN DEFAULT false,
    is_read_appraiser BOOLEAN DEFAULT false,
    appraiser_notes TEXT DEFAULT NULL,
    type ENUM('performance','continuous') NOT NULL,
    context ENUM('feedback','council','squad','quality','other','team care','1:1','PRP','TL/PM feedback','radar') NOT NULL,
    actions TEXT DEFAULT NULL,
    responsible_id INT UNSIGNED DEFAULT NULL,
    status ENUM('new','active','closed') DEFAULT NULL,
    deadline DATETIME DEFAULT NULL,
    PRIMARY KEY (feedback_id),
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (responsible_id) REFERENCES users(user_id) ON DELETE SET NULL
);
--
CREATE TABLE IF NOT EXISTS feedback_visibility (
    feedback_id BIGINT UNSIGNED NOT NULL,
    sender BOOLEAN DEFAULT false,
    appraiser BOOLEAN DEFAULT false,
    receiver BOOLEAN DEFAULT false,
    team_manager BOOLEAN DEFAULT false,
    PRIMARY KEY (feedback_id),
    FOREIGN KEY (feedback_id) REFERENCES feedbacks(feedback_id) ON DELETE CASCADE
);
--
CREATE TABLE IF NOT EXISTS pinned_users (
    user_id INT UNSIGNED NOT NULL,
    pinned_user_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (user_id, pinned_user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (pinned_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
--
CREATE TABLE IF NOT EXISTS user_access (
    user_id INT UNSIGNED NOT NULL,
    user BOOLEAN DEFAULT false,
    appraiser BOOLEAN DEFAULT false,
    team_manager BOOLEAN DEFAULT false,
    admin BOOLEAN DEFAULT false,
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
--@block
-- insert dummy data
INSERT INTO users (name, email, encrypted_password, appraiser_id, appraiser_notes)
VALUES  ("Ricardo Castro", "ricardocastro@criticalmanufacturing.com", "-", null, ""),
        ("Sónia Araújo", "soniaaraujo@criticalmanufacturing.com", "-", null, ""),
        ("Bernardete Carecho", "BernardeteCarecho@criticalmanufacturing.com", "-", null, ""),
        ("Duarte Pereira", "duartepereira@criticalmanufacturing.com", "-", 2, "notes about duarte"),
        ("Vasco Cruz", "vascocruz@criticalmanufacturing.com", "-", 2, "notes about vasco");
--
INSERT INTO feedbacks (sender_id, receiver_id, title, positive_message, positive_message_appraiser_edit, negative_message, negative_message_appraiser_edit, submission_date, competency, privacy, rating, appraiser_notes, type, context, actions, responsible_id, status, deadline)
VALUES  (1, 4, "Feedback 1 - sender", "This is the positive_message for feedback 1", "This is the positive_message for feedback 1", "This is the negative_message for feedback 1", "This is the negative_message for feedback 1", "2003-01-01 00:58:00", "general", "anonymous", 1, "Appraiser notes for feedback 1", "performance", "council", null, null, null, null),
        (1, 4, "Feedback 2 - sender appraiser", "This is the positive_message for feedback 2", "This is the positive_message for feedback 2", "This is the negative_message for feedback 2", "This is the negative_message for feedback 2", "2006-03-10 05:50:03", "execution-and-delivery", "private", 2, "Appraiser notes for feedback 2", "continuous", "1:1", "actions for feedback 2", 2, "active", "2024-12-31 23:59:59"),
        (1, 4, "Feedback 3 - sender appraiser receiver", "This is the positive_message for feedback 3", "This is the positive_message for feedback 3", "This is the negative_message for feedback 3", "This is the negative_message for feedback 3", "2012-05-20 09:40:14", "innovation", "public", 3, "Appraiser notes for feedback 3", "continuous", "TL/PM feedback", "actions for feedback 3", 2, "new", "2024-12-31 23:59:59"),
        (1, 4, "Feedback 4 - sender appraiser team_manager", "This is the positive_message for feedback 4", "This is the positive_message for feedback 4", "This is the negative_message for feedback 4", "This is the negative_message for feedback 4", "2017-12-25 23:42:04", "agility", "anonymous", 4, "Appraiser notes for feedback 4", "continuous", "TL/PM feedback", "actions for feedback 4", 2, "closed", "2025-12-31 23:59:59");
--
INSERT INTO feedback_visibility (feedback_id, sender, appraiser, receiver, team_manager)
VALUES  (1, true, false, false, false),
        (2, true, true, false, false),
        (3, true, true, true, false),
        (4, true, true, false, true);
--
INSERT INTO pinned_users (user_id, pinned_user_id)
VALUES  (1, 2), 
        (1, 3);
--
INSERT INTO user_access (user_id, user, appraiser, team_manager, admin)
VALUES  (1, true, false, false, true),
        (2, true, true, false, false),
        (3, true, false, true, false),
        (4, true, false, false, false),
        (5, true, false, false, false);
--@block
-- show tables
SELECT *
FROM users;
SELECT *
FROM feedbacks;
SELECT *
FROM feedback_visibility;
SELECT *
FROM pinned_users;
SELECT *
FROM user_access;