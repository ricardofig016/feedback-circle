INSERT INTO feedbacks (sender_id, target_id, title, positive_message, positive_message_appraiser_edit, negative_message, negative_message_appraiser_edit, submission_date, competency, privacy, rating, appraiser_notes, team_manager_notes, type, context, actions, responsible_id, status, deadline)
VALUES  (10594, 10639, "Feedback 1", "This is the positive_message for feedback 1", "This is the positive_message for feedback 1", "This is the negative_message for feedback 1", "This is the negative_message for feedback 1", "2003-01-01 00:58:00", "general", "public", 1, "Appraiser notes for feedback 1", "", "performance", "council", null, null, null, null),
        (10228, 10639, "Feedback 2", "This is the positive_message for feedback 2", "This is the positive_message for feedback 2", "This is the negative_message for feedback 2", "This is the negative_message for feedback 2", "2006-03-10 05:50:03", "execution-and-delivery", "private", 2, "Appraiser notes for feedback 2", "TM notes for feedback 2", "continuous", "1:1", "actions for feedback 2", 10228, "active", "2024-12-31 23:59:59"),
        (10228, 10639, "Feedback 3", "This is the positive_message for feedback 3", "This is the positive_message for feedback 3", "This is the negative_message for feedback 3", "This is the negative_message for feedback 3", "2012-05-20 09:40:14", "innovation", "public", 3, "Appraiser notes for feedback 3", "TM notes for feedback 3", "continuous", "TL/PM feedback", "actions for feedback 3", 10228, "new", "2024-12-31 23:59:59"),
        (10228, 10639, "Feedback 4", "This is the positive_message for feedback 4", "This is the positive_message for feedback 4", "This is the negative_message for feedback 4", "This is the negative_message for feedback 4", "2017-12-25 23:42:04", "agility", "anonymous", 4, "Appraiser notes for feedback 4", "TM notes for feedback 4", "continuous", "TL/PM feedback", "actions for feedback 4", 10228, "closed", "2025-12-31 23:59:59");
INSERT INTO feedback_visibility (feedback_id, sender, appraiser, target, team_manager)
VALUES  (1, true, false, false, true),
        (2, true, true, false, true),
        (3, true, true, true, true),
        (4, true, true, false, true);
INSERT INTO pinned_users (user_id, pinned_user_id)
VALUES  (10228, 10122), 
        (10228, 10639);