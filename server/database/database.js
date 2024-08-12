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
    SELECT *
    FROM users
    WHERE appraiser_id = ?
    `,
    [appraiserId]
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
    SELECT f.*, u.name AS sender_name
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
    SELECT * 
    FROM feedbacks
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
