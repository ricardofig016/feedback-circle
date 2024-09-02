DROP TABLE IF EXISTS user_access;
DROP TABLE IF EXISTS pinned_users;
DROP TABLE IF EXISTS feedback_visibility;
DROP TABLE IF EXISTS feedbacks;
DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users(
    user_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    encrypted_password TEXT NOT NULL,
    appraiser_id INT UNSIGNED DEFAULT NULL,
    appraiser_notes TEXT DEFAULT NULL,
    manager_id INT UNSIGNED DEFAULT NULL,
    manager_notes TEXT DEFAULT NULL,
    UNIQUE(name),
    UNIQUE(email),
    PRIMARY KEY (user_id),
    FOREIGN KEY (appraiser_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (manager_id) REFERENCES users(user_id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS feedbacks(
    feedback_id BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
    sender_id INT UNSIGNED DEFAULT NULL,
    target_id INT UNSIGNED NOT NULL,
    title TEXT NOT NULL,
    positive_message TEXT DEFAULT NULL,
    positive_message_appraiser_edit TEXT DEFAULT NULL,
    negative_message TEXT DEFAULT NULL,
    negative_message_appraiser_edit TEXT DEFAULT NULL,
    submission_date DATETIME NOT NULL,
    competency ENUM('general', 'execution-and-delivery', 'innovation', 'agility', 'commitment', 'communication', 'customer-orientation') NOT NULL,
    privacy ENUM('private', 'public') NOT NULL,
    rating INT UNSIGNED DEFAULT NULL,
    is_read_target BOOLEAN DEFAULT false,
    is_read_appraiser BOOLEAN DEFAULT false,
    is_read_manager BOOLEAN DEFAULT false,
    appraiser_notes TEXT DEFAULT NULL,
    manager_notes TEXT DEFAULT NULL,
    type ENUM('performance','continuous') NOT NULL,
    context ENUM('feedback','council','squad','quality','other','team care','1:1','PRP','TL/PM feedback','radar') NOT NULL,
    actions TEXT DEFAULT NULL,
    responsible_id INT UNSIGNED DEFAULT NULL,
    status ENUM('new','active','closed') DEFAULT NULL,
    deadline DATETIME DEFAULT NULL,
    PRIMARY KEY (feedback_id),
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (target_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (responsible_id) REFERENCES users(user_id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS feedback_visibility (
    feedback_id BIGINT UNSIGNED NOT NULL,
    sender BOOLEAN DEFAULT false,
    appraiser BOOLEAN DEFAULT false,
    target BOOLEAN DEFAULT false,
    manager BOOLEAN DEFAULT false,
    PRIMARY KEY (feedback_id),
    FOREIGN KEY (feedback_id) REFERENCES feedbacks(feedback_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS pinned_users (
    user_id INT UNSIGNED NOT NULL,
    pinned_user_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (user_id, pinned_user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (pinned_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS user_access (
    user_id INT UNSIGNED NOT NULL,
    user BOOLEAN DEFAULT false,
    appraiser BOOLEAN DEFAULT false,
    manager BOOLEAN DEFAULT false,
    admin BOOLEAN DEFAULT false,
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
)