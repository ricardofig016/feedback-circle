let id = 1;

const getId = () => id++;

export const users = [
  { id: getId(), name: "user1" },
  { id: getId(), name: "user2" },
  { id: getId(), name: "user3" },
  { id: getId(), name: "user4" },
];

export function getAll() {
  return Promise.resolve(users);
}

export function store(name) {
  const user = {
    id: getId(),
    name,
  };
  users.push(user);
  return Promise.resolve(user);
}
