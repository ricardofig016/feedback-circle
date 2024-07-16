import { getAll, store } from "../models/UserTest.js";

export async function listUsers(req, res) {
  const users = await getAll();
  res.send(users);
}

export async function storeUser(req, res) {
  const name = req.params.name;
  if (name) {
    await store(name);
  }
  res.redirect("/users");
}
