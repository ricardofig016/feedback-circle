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

export async function getUser(id) {
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

export async function getUserId(email) {
  const [rows] = await pool.query(
    `
    SELECT user_id 
    FROM users
    WHERE email = ?
    `,
    [email]
  );
  return rows[0]["user_id"];
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

export async function getFeedbacks() {
  const [rows] = await pool.query("SELECT * FROM feedbacks");
  return rows;
}

export async function getFeedback(id) {
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

/**
 * @returns the feedback_id of the created feedback
 */
export async function createFeedback(senderId, receiverId, category, type, privacy, body) {
  const [rows] = await pool.query(
    `
    INSERT INTO feedbacks (sender_id, receiver_id, category, type, privacy, body)
    VALUES (?, ?, ?, ?, ?, ?);
    `,
    [senderId, receiverId, category, type, privacy, body]
  );
  // return the created object
  return rows.insertId;
}
