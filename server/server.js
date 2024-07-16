import express from "express";
import { routes as userTestRoutes } from "./routes/userTest.js";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.static("../client/public/"));
app.use(express.urlencoded({ extended: false }));

app.use("/users", userTestRoutes);

app.get("/", (req, res) => {
  res.send("Home Page");
});

app.listen(PORT, () => {
  console.log("Server listening at http://localhost:" + PORT);
});
