import express from "express";
import cors from "cors";

import { getFeedbacks, getUsers, getUserById, createFeedback, getUserByEmail, getFeedbackById, getUsersByAppraiserId } from "./database/database.js";

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
  if (!users) return res.status(404).send({ error: "No users found with appraiser_id " + id });
  res.send(users);
});

router.get("/feedbacks", async (req, res) => {
  const feedbacks = await getFeedbacks();
  if (!feedbacks) return res.status(404).send({ error: "No feedbacks found" });
  res.send(feedbacks);
});

router.post("/feedbacks", async (req, res) => {
  const { senderId, receiverId, category, type, privacy, body } = req.body;
  const feedbackId = await createFeedback(senderId, receiverId, category, type, privacy, body);

  if (!feedbackId) return res.status(400).send({ error: "Feedback creation failed" });

  const feedback = await getFeedbackById(feedbackId);
  if (!feedback) return res.status(404).send({ error: "Feedback not found after creation" });

  res.status(201).send(feedback);
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
