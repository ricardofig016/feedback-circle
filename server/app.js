import express from "express";
import cors from "cors";

import { getFeedbacks, getUsers, getUserById, createFeedback, getUserByEmail, getFeedbackById, getUsersByAppraiserId, getFeedbacksOfUser, updateFeedback, getSavedAndSharedFeedbacks, getPinnedUsers, createUserPin, deleteUserPin, updateFeedbackVisibility, deleteFeedback, getUserAccess, getUsersByTeamManagerId } from "./database/database.js";
import { securityPortalAuth } from "./auth.js";

const app = express();

app.use(cors());
app.use(express.json());

const router = express.Router();
app.use("/api", router);

// Routes
/*
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const accessToken = await securityPortalAuth(username, password);
    res.status(200).send({ accessToken });
  } catch (error) {
    console.log(error);
    res.status(401).send({ message: error.message });
  }
});
*/

router.get("/users/withpins/userid/:id", async (req, res) => {
  const userId = req.params.id;
  const users = await getUsers();
  if (!users) return res.status(404).send({ error: "No users found" });
  const pinnedUsers = await getPinnedUsers(userId);
  const pinnedUsersIds = pinnedUsers.map((pinned_user) => pinned_user.pinned_user_id);
  users.forEach((user) => (user.is_pinned = pinnedUsersIds.includes(user.user_id)));
  res.send(users);
});

router.put("/users/updatepin/:userid/:pinneduserid", async (req, res) => {
  const userId = req.params.userid;
  const pinnedUserId = req.params.pinneduserid;
  const { newIsPinned } = req.body;
  try {
    if (newIsPinned) {
      res.status(200).send(await createUserPin(userId, pinnedUserId));
    } else {
      res.status(200).send(await deleteUserPin(userId, pinnedUserId));
    }
  } catch (error) {
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
});

router.get("/users/id/:id", async (req, res) => {
  const id = req.params.id;
  const user = await getUserById(id);
  if (!user) return res.status(404).send({ error: "No user found with id " + id });
  const user_access = await getUserAccess(id);
  const keys = Object.keys(user_access);
  keys.shift(); //remove the first key (user_id)
  user.access = keys.filter((key) => user_access[key]);
  res.send(user);
});

router.get("/users/email/:email", async (req, res) => {
  const email = req.params.email;
  const user = await getUserByEmail(email);
  if (!user) return res.status(404).send({ error: "No user found with email " + email });
  const user_access = await getUserAccess(user.user_id);
  const keys = Object.keys(user_access);
  keys.shift(); //remove the first key (user_id)
  user.access = keys.filter((key) => user_access[key]);
  res.send(user);
});

// get all users with appraiser_id = id
router.get("/users/appraiserid/:id", async (req, res) => {
  const id = req.params.id;
  const users = await getUsersByAppraiserId(id);
  if (!users) return res.status(404).send({ error: "No users found with appraiser_id " + id });
  res.send(users);
});

// get all users with team_manager_id = id
router.get("/users/teammanagerid/:id", async (req, res) => {
  const id = req.params.id;
  const users = await getUsersByTeamManagerId(id);
  if (!users) return res.status(404).send({ error: "No users found with team_manager_id " + id });
  res.send(users);
});

// get all feedbacks
router.get("/feedbacks", async (req, res) => {
  const feedbacks = await getFeedbacks();
  if (!feedbacks) return res.status(404).send({ error: "No feedbacks found" });
  res.send(feedbacks);
});

// create new feedback
router.post("/feedbacks", async (req, res) => {
  let { senderId, targetId, title, positiveMessage, positiveMessageAppraiserEdit, negativeMessage, negativeMessageAppraiserEdit, competency, privacy, rating, type, context, actions, responsibleId, status, deadline, senderVis, appraiserVis, targetVis, teamManagerVis } = req.body;

  const submissionDate = formatDate(new Date());
  if (type !== "continuous") actions = responsibleId = status = deadline = null;

  const feedbackId = await createFeedback(senderId, targetId, title, positiveMessage, positiveMessageAppraiserEdit, negativeMessage, negativeMessageAppraiserEdit, submissionDate, competency, privacy, rating, type, context, actions, responsibleId, status, deadline, senderVis, appraiserVis, targetVis, teamManagerVis);

  if (!feedbackId) return res.status(400).send({ error: "Feedback creation failed" });

  res.status(204).send({});
});

// get feedback id, filtered to be shown to user with userid
router.get("/feedbacks/:id/user/:userid", async (req, res) => {
  const id = req.params.id;
  const userId = req.params.userid;
  const feedback = await getFeedbackById(id);

  if (!feedback) return res.status(404).send({ error: "No feedback found with id " + id });

  // find all user roles in relation to the feedback
  feedback.user_roles = [];
  if (userId == feedback.sender_id) feedback.user_roles.push("sender");
  if (userId == feedback.appraiser_id) feedback.user_roles.push("appraiser");
  if (userId == feedback.team_manager_id) feedback.user_roles.push("team_manager");
  if (userId == feedback.target_id) feedback.user_roles.push("target");

  // by default, the feedback cannot be deleted
  feedback.can_delete = false;

  // filtering for appraiser
  if (feedback.user_roles.includes("appraiser")) {
    if (feedback.privacy == "anonymous") feedback.sender_name = "anonymous";
    feedback.can_delete = feedback.user_roles.includes("sender") && !feedback.target_visibility && !feedback.team_manager_visibility;
    delete feedback.is_read_target;
    delete feedback.is_read_team_manager;
    delete feedback.team_manager_notes;
  }
  // filtering for team manager
  else if (feedback.user_roles.includes("team_manager")) {
    if (feedback.privacy == "anonymous") feedback.sender_name = "anonymous";
    feedback.can_delete = feedback.user_roles.includes("sender") && !feedback.appraiser_visibility && !feedback.target_visibility;
    delete feedback.positive_message_appraiser_edit;
    delete feedback.negative_message_appraiser_edit;
    delete feedback.is_read_target;
    delete feedback.is_read_appraiser;
    delete feedback.appraiser_notes;
    delete feedback.target_visibility;
  }
  // filtering for sender
  else if (feedback.user_roles.includes("sender")) {
    feedback.can_delete = !feedback.appraiser_visibility && !feedback.target_visibility && !feedback.team_manager_visibility;
    delete feedback.positive_message_appraiser_edit;
    delete feedback.negative_message_appraiser_edit;
    delete feedback.is_read_target;
    delete feedback.is_read_appraiser;
    delete feedback.is_read_team_manager;
    delete feedback.appraiser_notes;
    delete feedback.team_manager_notes;
    delete feedback.appraiser_visibility;
    delete feedback.target_visibility;
    delete feedback.team_manager_visibility;
  }
  // filtering for target
  else if (feedback.user_roles.includes("target")) {
    if (["anonymous", "private"].includes(feedback.privacy)) feedback.sender_name = "anonymous";
    delete feedback.positive_message;
    delete feedback.negative_message;
    delete feedback.is_read_appraiser;
    delete feedback.is_read_team_manager;
    delete feedback.appraiser_notes;
    delete feedback.team_manager_notes;
    delete feedback.appraiser_visibility;
    delete feedback.team_manager_visibility;
  }
  // the user has no role in relation to this feedback
  else {
    return res.status(403).send({ error: `The user with id ${userId} has no access to the feedback with id ${id}` });
  }

  delete feedback.feedback_id;
  delete feedback.appraiser_id;
  delete feedback.team_manager_id;
  delete feedback.sender_id;
  delete feedback.target_id;
  delete feedback.privacy;
  delete feedback.sender_visibility;

  res.send(feedback);
});

// update is_read (target, appraiser and team manager) on feedbacks table
router.put("/feedbacks/:id/isread/:role", async (req, res) => {
  const id = req.params.id;
  const role = req.params.role;
  const { isRead } = req.body;
  let columnName;
  if (role === "target") columnName = "is_read_target";
  else if (role === "appraiser") columnName = "is_read_appraiser";
  else if (role === "team_manager") columnName = "is_read_team_manager";
  else return res.status(400).send({ error: 'Invalid role, should be "target", "appraiser" or "team_manager"' });
  await updateFeedback(columnName, isRead, id);
  res.status(204).send({});
});

// update visibility on feedbacks table
router.put("/feedbacks/:id/visibility/:role", async (req, res) => {
  const id = req.params.id;
  const role = req.params.role;
  if (!["sender", "appraiser", "target", "team_manager"].includes(role)) {
    return res.status(400).send({ error: 'Invalid role, should be "sender", "appraiser", "target" or "team_manager"' });
  }
  const { value } = req.body;
  await updateFeedbackVisibility(role, value, id);
  res.status(204).send({});
});

// update appraiser_notes on feedbacks table
router.put("/feedbacks/:id/appraisernotes", async (req, res) => {
  const { notes } = req.body;
  const id = req.params.id;
  await updateFeedback("appraiser_notes", notes, id);
  res.status(204).send({});
});

router.put("/feedbacks/:id/appraisermessage/:type", async (req, res) => {
  const id = req.params.id;
  const type = req.params.type;
  const { message } = req.body;
  if (!["positive", "negative"].includes(type)) {
    return res.status(400).send({ error: 'Invalid type, should be "positive" or "negative"' });
  }
  await updateFeedback(type + "_message_appraiser_edit", message, id);
  res.status(204).send({});
});

// get feedbacks given to the user with user_id = _id_, joined with the name of the sender, ordered from most recent to oldest
router.get("/feedbacks/targetid/:id/role/:role", async (req, res) => {
  const user_id = req.params.id;
  const role = req.params.role;
  const feedbacks = await getFeedbacksOfUser(user_id);
  if (!feedbacks) return res.status(404).send({ error: "No feedbacks found for user with id " + user_id });
  // filtering for sender role
  if (role === "sender") {
    feedbacks.forEach((feedback) => {
      delete feedback.appraiser_notes;
      delete feedback.team_manager_notes;
      delete feedback.privacy;
      delete feedback.sender_visibility;
      delete feedback.target_visibility;
      delete feedback.appraiser_visibility;
      delete feedback.team_manager_visibility;
      delete feedback.is_read_target;
      delete feedback.is_read_appraiser;
      delete feedback.is_read_team_manager;
    });
    return res.send(feedbacks);
  }
  // filtering for target role
  else if (role === "target") {
    const sharedWithTarget = feedbacks.filter((feedback) => feedback.target_visibility);
    sharedWithTarget.forEach((feedback) => {
      if (["anonymous", "private"].includes(feedback.privacy)) feedback.sender_name = "anonymous";
      delete feedback.appraiser_notes;
      delete feedback.team_manager_notes;
      delete feedback.privacy;
      delete feedback.sender_visibility;
      delete feedback.target_visibility;
      delete feedback.appraiser_visibility;
      delete feedback.team_manager_visibility;
      delete feedback.is_read_appraiser;
      delete feedback.is_read_team_manager;
    });
    return res.send(sharedWithTarget);
  }
  // filtering for appraiser role
  else if (role === "appraiser") {
    const sharedWithAppraiser = feedbacks.filter((feedback) => feedback.appraiser_visibility);
    sharedWithAppraiser.forEach((feedback) => {
      if (feedback.privacy === "anonymous") feedback.sender_name = "anonymous";
      delete feedback.team_manager_notes;
      delete feedback.privacy;
      delete feedback.sender_visibility;
      delete feedback.target_visibility;
      delete feedback.appraiser_visibility;
      delete feedback.team_manager_visibility;
      delete feedback.is_read_target;
      delete feedback.is_read_team_manager;
    });
    return res.send(sharedWithAppraiser);
  } // filtering for team manager role
  else if (role === "team_manager") {
    const teamManagerHasAccess = feedbacks.filter((feedback) => feedback.team_manager_visibility);
    teamManagerHasAccess.forEach((feedback) => {
      if (feedback.privacy === "anonymous") feedback.sender_name = "anonymous";
      delete feedback.appraiser_notes;
      delete feedback.privacy;
      delete feedback.sender_visibility;
      delete feedback.target_visibility;
      delete feedback.appraiser_visibility;
      delete feedback.team_manager_visibility;
      delete feedback.is_read_target;
      delete feedback.is_read_appraiser;
    });
    return res.send(teamManagerHasAccess);
  } else return res.status(400).send({ error: 'Invalid role, should be  "sender", "target", "appraiser" or "team_manager"' });
});

// get feedbacks with sender_id = _id_, with scope "saved" or "shared", ordered from most recent to oldest
router.get("/feedbacks/senderid/:id/scope/:scope", async (req, res) => {
  const user_id = req.params.id;
  const scope = req.params.scope;
  const feedbacks = await getSavedAndSharedFeedbacks(user_id);
  if (!feedbacks) return res.status(404).send({ error: "No feedbacks found for user with id " + user_id });
  // visibility
  if (scope === "saved") {
    const SavedFeedbacks = feedbacks.filter((feedback) => {
      // only the sender has visibility
      return feedback.sender_visibility && !feedback.appraiser_visibility && !feedback.target_visibility && !feedback.team_manager_visibility;
    });
    SavedFeedbacks.forEach((feedback) => {
      delete feedback.sender_visibility;
      delete feedback.appraiser_visibility;
      delete feedback.target_visibility;
      delete feedback.team_manager_visibility;
    });
    res.status(200).send(SavedFeedbacks);
  } else if (scope === "shared") {
    const SharedFeedbacks = feedbacks.filter((feedback) => {
      // at least one role besides the sender has visibility
      return feedback.appraiser_visibility || feedback.target_visibility || feedback.team_manager_visibility;
    });
    SharedFeedbacks.forEach((feedback) => {
      delete feedback.sender_visibility;
      delete feedback.appraiser_visibility;
      delete feedback.target_visibility;
      delete feedback.team_manager_visibility;
    });
    res.status(200).send(SharedFeedbacks);
  } else res.status(400).send({ error: 'Invalid scope, should be  "saved" or "shared"' });
});

// Delete feedback by ID
router.delete("/feedbacks/:id", async (req, res) => {
  const feedbackId = req.params.id;
  try {
    const result = await deleteFeedback(feedbackId);

    if (result.affectedRows === 0) {
      return res.status(404).send({ error: "Feedback not found" });
    }

    res.status(204).send({});
  } catch (error) {
    res.status(500).send({ error: "An error occurred while deleting the feedback: " + error.message });
  }
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
