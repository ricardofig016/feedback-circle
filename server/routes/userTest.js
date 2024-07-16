import { Router } from "express";
import { listUsers, storeUser } from "../controllers/userTest.js";

export const routes = new Router();

routes.get("/", listUsers);

routes.get("/add/:name", storeUser);
