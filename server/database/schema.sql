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
    type ENUM('positive', 'negative') NOT NULL,
    privacy ENUM('anonymous', 'private', 'public') NOT NULL,
    visibility ENUM('appraiser', 'both') NOT NULL DEFAULT "appraiser",
    is_read BOOLEAN DEFAULT false,
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
    ),
    (
        "Another User",
        "anotheruser@criticalmanufacturing.com",
        "user",
        "-",
        null,
        "this guy has no feedbacks"
    );
--
INSERT INTO feedbacks (
        sender_id,
        receiver_id,
        title,
        body,
        submission_date,
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
        "2003-05-07 11:58:28",
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
        "2003-05-07 11:58:28",
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
        "2023-05-31 12:08:00",
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
        "2012-01-01 00:00:00",
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
        "2020-03-13 20:32:47",
        "customer-orientation",
        "negative",
        "private",
        "both",
        "this is a feedback sent from vasco to duarte"
    ),
    (
        1,
        1,
        "ricardo to ricardo",
        "feedback from ricardo to ricardo",
        "2001-01-01 00:00:00",
        "general",
        "negative",
        "anonymous",
        "appraiser",
        "this is a feedback sent from ricardo to ricardo"
    ),
    (
        2,
        2,
        "sonia to sonia",
        "feedback from sonia to sonia aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla",
        "2002-02-02 00:00:00",
        "execution-and-delivery",
        "positive",
        "private",
        "both",
        "this is a feedback sent from sonia to sonia aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla"
    ),
    (
        3,
        3,
        "duarte to duarte",
        "feedback from duarte to duarte",
        "2003-03-03 00:00:00",
        "innovation",
        "negative",
        "public",
        "appraiser",
        "this is a feedback sent from duarte to duarte"
    ),
    (
        4,
        4,
        "vasco to vasco",
        "feedback from vasco to vasco",
        "2004-04-04 00:00:00",
        "agility",
        "positive",
        "anonymous",
        "both",
        "this is a feedback sent from vasco to vasco"
    ),
    (
        1,
        3,
        "ricardo to duarte",
        "feedback from ricardo to duarte",
        "2005-05-05 00:00:00",
        "commitment",
        "negative",
        "private",
        "appraiser",
        "this is a feedback sent from ricardo to duarte"
    ),
    (
        2,
        3,
        "sonia to duarte",
        "feedback from sonia to duarte",
        "2006-06-06 00:00:00",
        "communication",
        "positive",
        "public",
        "both",
        "this is a feedback sent from sonia to duarte"
    ),
    (
        3,
        3,
        "duarte to duarte",
        "feedback from duarte to duarte aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla",
        "2007-07-20 00:00:00",
        "customer-orientation",
        "negative",
        "anonymous",
        "appraiser",
        "this is a feedback sent from duarte to duarte aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla"
    ),
    (
        4,
        3,
        "vasco to duarte",
        "feedback from vasco to duarte aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla",
        "2008-08-21 00:00:00",
        "general",
        "positive",
        "private",
        "both",
        "this is a feedback sent from vasco to duarte aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla"
    ),
    (
        1,
        4,
        "ricardo to vasco",
        "feedback from ricardo to vasco",
        "2009-09-22 00:00:00",
        "execution-and-delivery",
        "negative",
        "public",
        "appraiser",
        "this is a feedback sent from ricardo to vasco"
    ),
    (
        4,
        1,
        "vasco to ricardo",
        "feedback from vasco to ricardo aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla",
        "2010-10-29 00:00:00",
        "innovation",
        "positive",
        "anonymous",
        "both",
        "this is a feedback sent from vasco to ricardo aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla aslkdjhfla"
    ),
    (
        2,
        1,
        "sonia to ricardo",
        "feedback from sonia to ricardo",
        "2011-11-30 00:00:00",
        "agility",
        "negative",
        "private",
        "appraiser",
        "this is a feedback sent from sonia to ricardo"
    );