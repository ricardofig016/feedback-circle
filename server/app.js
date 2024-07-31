import express from "express";
import cors from "cors";

import { getFeedbacks, getUsers, getUserById, createFeedback, getUserByEmail, getFeedbackById, getUsersByAppraiserId, getFeedbacksOfUser } from "./database/database.js";

const app = express();

app.use(cors());
app.use(express.json());

const router = express.Router();
app.use("/api", router);

// Routes
router.get("/users", async (req, res) => {
  const users = await getUsers();
  if (!users) return res.status(404).send({ error: "No users found" });
  res.send(users);
});

router.get("/users/id/:id", async (req, res) => {
  const id = req.params.id;
  const user = await getUserById(id);
  if (!user) return res.status(404).send({ error: "No user found with id " + id });
  res.send(user);
});

router.get("/users/email/:email", async (req, res) => {
  const email = req.params.email;
  const user = await getUserByEmail(email);
  if (!user) return res.status(404).send({ error: "No user found with email " + email });
  res.send(user);
});

router.get("/users/appraiserid/:appraiserid", async (req, res) => {
  const appraiserId = req.params.appraiserid;
  const users = await getUsersByAppraiserId(appraiserId);
  if (!users) return res.status(404).send({ error: "No users found with appraiser_id " + appraiserId });
  res.send(users);
});

router.get("/feedbacks", async (req, res) => {
  const feedbacks = await getFeedbacks();
  if (!feedbacks) return res.status(404).send({ error: "No feedbacks found" });
  res.send(feedbacks);
});

router.post("/feedbacks", async (req, res) => {
  const { senderId, receiverId, title, body, category, type, privacy } = req.body;
  const submissionDate = formatDate(new Date());
  const feedbackId = await createFeedback(senderId, receiverId, title, body, submissionDate, category, type, privacy);

  if (!feedbackId) return res.status(400).send({ error: "Feedback creation failed" });

  const feedback = await getFeedbackById(feedbackId);
  if (!feedback) return res.status(404).send({ error: "Feedback not found after creation" });

  res.status(201).send(feedback);
});

router.get("/feedbacks/mostrecent/receiverid/:id", async (req, res) => {
  const user_id = req.params.id;
  const feedbacks = await getFeedbacksOfUser(user_id, "submit_date");
  if (!feedbacks) return res.status(404).send({ error: "No feedbacks found for user with id " + user_id });
  res.send(feedbacks.reverse());
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
