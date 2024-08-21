"use strict";

import dotenv from "dotenv";
import mysql from "mysql2";

dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

export async function getUsers() {
  const [rows] = await pool.query(
    `
    SELECT u.user_id, u.name
    FROM users AS u
    `
  );
  return rows;
}

export async function getPinnedUsers(id) {
  const [rows] = await pool.query(
    `
    SELECT pu.pinned_user_id
    FROM pinned_users AS pu
    WHERE pu.user_id = ?
    `,
    [id]
  );
  return rows;
}

export async function createUserPin(userId, pinnedUserId) {
  const [data] = await pool.query(
    `
    INSERT INTO pinned_users (user_id, pinned_user_id)
    VALUES (?, ?)
    `,
    [userId, pinnedUserId]
  );
  return data;
}

export async function deleteUserPin(userId, pinnedUserId) {
  const [data] = await pool.query(
    `
    DELETE FROM pinned_users
    WHERE user_id = ? AND pinned_user_id = ?
    `,
    [userId, pinnedUserId]
  );
  return data;
}

export async function getUserById(id) {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM users
    WHERE user_id = ?
    `,
    [id]
  );
  return rows[0];
}

export async function getUserByEmail(email) {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM users
    WHERE email = ?
    `,
    [email]
  );
  return rows[0] ? rows[0] : null;
}

export async function getUsersByAppraiserId(appraiserId) {
  const [rows] = await pool.query(
    `
    SELECT u.user_id, u.name, u.appraiser_notes, f.title AS feedback_title, unread_count.count AS unread_count
    FROM users AS u
    LEFT JOIN feedbacks as f 
      ON f.receiver_id = u.user_id
      AND f.submission_date = (
        SELECT MAX(f.submission_date)
        FROM feedbacks AS f
        WHERE f.receiver_id = u.user_id
      )
    LEFT JOIN
      (
        SELECT f.receiver_id, COUNT(*) AS count
        FROM feedbacks AS f
        JOIN users AS u ON u.appraiser_id = ?
        JOIN feedback_visibility AS fv ON f.feedback_id = fv.feedback_id
        WHERE f.receiver_id = u.user_id AND f.is_read_appraiser = false AND fv.appraiser = true 
        GROUP BY f.receiver_id
      ) AS unread_count ON unread_count.receiver_id = u.user_id
    WHERE u.appraiser_id = ?
    `,
    [appraiserId, appraiserId]
  );
  return rows;
}

export async function getFeedbacks() {
  const [rows] = await pool.query("SELECT * FROM feedbacks");
  return rows;
}

export async function getFeedbacksOfUser(id) {
  const [rows] = await pool.query(
    `
    SELECT f.feedback_id, f.title, f.submission_date, f.competency, f.appraiser_notes, f.privacy, fv.sender AS sender_visibility, fv.appraiser AS appraiser_visibility, fv.receiver AS receiver_visibility, fv.team_manager AS team_manager_visibility, u.name AS sender_name
    FROM feedbacks AS f
    JOIN users AS u ON f.sender_id = u.user_id
    JOIN feedback_visibility AS fv ON f.feedback_id = fv.feedback_id
    WHERE f.receiver_id = ?
    ORDER BY f.submission_date DESC
    `,
    [id]
  );
  return rows;
}

export async function getSavedAndSharedFeedbacks(id) {
  const [rows] = await pool.query(
    `
    SELECT f.feedback_id, f.title, f.submission_date, f.competency, fv.sender AS sender_visibility, fv.appraiser AS appraiser_visibility, fv.receiver AS receiver_visibility, fv.team_manager AS team_manager_visibility, u.name AS receiver_name
    FROM feedbacks AS f
    JOIN users AS u ON f.receiver_id = u.user_id
    JOIN feedback_visibility AS fv ON f.feedback_id = fv.feedback_id
    WHERE f.sender_id = ?
    ORDER BY f.submission_date DESC
    `,
    [id]
  );
  return rows;
}

export async function getFeedbackById(id) {
  const [rows] = await pool.query(
    `
    SELECT f.title, f.positive_message, f.positive_message_appraiser_edit, f.negative_message, f.negative_message_appraiser_edit,  f.submission_date, f.competency, f.rating, fv.sender AS sender_visibility, fv.appraiser AS appraiser_visibility, fv.receiver AS receiver_visibility, fv.team_manager AS team_manager_visibility, f.privacy, f.is_read_receiver, f.is_read_appraiser, f.appraiser_notes, f.sender_id, f.receiver_id, sender.name AS sender_name, receiver.name AS receiver_name, receiver.appraiser_id
    FROM feedbacks AS f
    JOIN users AS sender ON f.sender_id = sender.user_id
    JOIN users AS receiver ON f.receiver_id = receiver.user_id
    JOIN feedback_visibility AS fv ON f.feedback_id = fv.feedback_id
    WHERE f.feedback_id = ?
    `,
    [id]
  );
  return rows[0];
}

// caution: columnName parameter can never be sent by the user, to prevent sql injection
export async function updateFeedback(columnName, value, id) {
  const [data] = await pool.query(
    `
    UPDATE feedbacks 
    SET ${columnName} = ?
    WHERE feedback_id = ?
    `,
    [value, id]
  );
  return data;
}

// caution: role parameter can never be sent by the user, to prevent sql injection
export async function updateFeedbackVisibility(role, value, id) {
  const [data] = await pool.query(
    `
    UPDATE feedback_visibility
    SET ${role} = ?
    WHERE feedback_id = ?
    `,
    [value, id]
  );
  return data;
}

/**
 * @returns the feedback_id of the created feedback
 */
export async function createFeedback(senderId, receiverId, title, positiveMessage, positiveMessageAppraiserEdit, negativeMessage, negativeMessageAppraiserEdit, submissionDate, competency, privacy, rating, type, context, actions, responsibleId, status, deadline, senderVis, appraiserVis, receiverVis, teamManagerVis) {
  const [data] = await pool.query(
    `
    INSERT INTO feedbacks (sender_id, receiver_id, title, positive_message, positive_message_appraiser_edit, negative_message, negative_message_appraiser_edit, submission_date, competency, privacy, rating, type, context, actions, responsible_id, status, deadline)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    [senderId, receiverId, title, positiveMessage, positiveMessageAppraiserEdit, negativeMessage, negativeMessageAppraiserEdit, submissionDate, competency, privacy, rating, type, context, actions, responsibleId, status, deadline]
  );
  await pool.query(
    `
    INSERT INTO feedback_visibility (feedback_id, sender, appraiser, receiver, team_manager)
    VALUES (?, ?, ?, ?, ?);
    `,
    [data.insertId, senderVis, appraiserVis, receiverVis, teamManagerVis]
  );
  // return the id of the created object
  return data.insertId;
}
