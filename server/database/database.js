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
  const [rows] = await pool.query("SELECT * FROM users");
  return rows;
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
        WHERE f.receiver_id = u.user_id AND f.is_read_appraiser = false
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
    SELECT f.feedback_id, f.title, f.submission_date, f.category, f.appraiser_notes, f.privacy, f.visibility, u.name AS sender_name
    FROM feedbacks AS f
    JOIN users AS u ON f.sender_id = u.user_id
    WHERE f.receiver_id = ?
    ORDER BY f.submission_date DESC
    `,
    [id]
  );
  return rows;
}

export async function getFeedbackById(id) {
  const [rows] = await pool.query(
    `
    SELECT f.title, f.positive_message, f.positive_message_appraiser_edit, f.negative_message, f.negative_message_appraiser_edit,  f.submission_date, f.category, f.rating, f.visibility, f.privacy, f.is_read_receiver, f.is_read_appraiser, f.appraiser_notes, f.sender_id, f.receiver_id, sender.name AS sender_name, receiver.name AS receiver_name, receiver.appraiser_id
    FROM feedbacks AS f
    JOIN users AS sender ON f.sender_id = sender.user_id
    JOIN users AS receiver ON f.receiver_id = receiver.user_id
    WHERE feedback_id = ?
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

/**
 * @returns the feedback_id of the created feedback
 */
export async function createFeedback(senderId, receiverId, title, positiveMessage, positiveMessageAppraiserEdit, negativeMessage, negativeMessageAppraiserEdit, submissionDate, category, privacy, rating) {
  const [data] = await pool.query(
    `
    INSERT INTO feedbacks (sender_id, receiver_id, title, positive_message, positive_message_appraiser_edit, negative_message, negative_message_appraiser_edit, submission_date, category, privacy, rating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    [senderId, receiverId, title, positiveMessage, positiveMessageAppraiserEdit, negativeMessage, negativeMessageAppraiserEdit, submissionDate, category, privacy, rating]
  );
  // return the created object
  return data.insertId;
}
