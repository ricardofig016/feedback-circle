import express from "express";
import cors from "cors";

import { getUserId, getFeedbacks, getUsers, getUser, createFeedback } from "./database/database.js";

const app = express();

app.use(cors());
app.use(express.json());

const router = express.Router();
app.use("/api", router);

// Routes
router.get("/users", async (req, res) => {
  const users = await getUsers();
  res.send(users);
});

router.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  const user = await getUser(id);
  res.send(user);
});

router.get("/feedbacks", async (req, res) => {
  const feedbacks = await getFeedbacks();
  res.send(feedbacks);
});

router.post("/feedbacks", async (req, res) => {
  const { senderId, receiverId, category, evaluation, visibility, body } = req.body;
  const feedback = await createFeedback(senderId, receiverId, category, evaluation, visibility, body);
  res.status(201).send(feedback);
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
