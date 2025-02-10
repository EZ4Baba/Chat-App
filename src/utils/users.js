const users = [];

function addUser({ id, username, room }) {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: "Username and room are required",
    };
  }

  //check for existing user in same room
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });
  if (existingUser) {
    return {
      error: "Username already exists",
    };
  }

  const user = { id, username, room };
  users.push(user);
  //return user
  return { user };
}

function removeUser(id) {
  if (!id) return { error: "User id is required" };
  const userindex = users.findIndex((user) => user.id === id);
  if (userindex === -1) {
    return {
      error: "User not found",
    };
  }
  //delete and return deleted user
  return users.splice(userindex, 1)[0];
}

function getUser(id) {
  return users.find((user) => user.id === id);
}

function getUsersInRoom(room) {
  if (!room) return { error: "Room is required" };
  room = room.trim().toLowerCase();
  let usersinroom = users.filter((user) => user.room === room);
  return usersinroom;
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
