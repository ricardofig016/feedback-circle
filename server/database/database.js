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

export function getUserId(email) {
  const [rows] = pool.query(
    `
      SELECT user_id 
      FROM users
      WHERE email = ?
      `,
    [email]
  );
  return rows ? rows[0] : null;
}

console.log(getUserId("RicardoCastro@criticalmanufacturing.com"));

module.exports = { getUserId };

/** 
export function getFeedbacks() {
  const [rows] = pool.query("SELECT * FROM feedbacks");
  return rows;
}

export function getFeedback(id) {
  const [rows] = pool.query(
    `
    SELECT * 
    FROM feedbacks
    WHERE feedback_id = ?
    `,
    [id]
  );
  return rows[0];
}

export function createFeedback(senderId, receiverId, category, evaluation, visibility, body) {
  const [resultInfo] = pool.query(
    `
    INSERT INTO feedbacks (sender_id, receiver_id, category, evaluation, visibility, body)
    VALUES (?, ?, ?, ?, ?, ?);
    `,
    [senderId, receiverId, category, evaluation, visibility, body]
  );
  // return the created object
  return getFeedback(resultInfo.insertId);
}
*/
