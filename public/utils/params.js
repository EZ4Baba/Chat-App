function getUsernameAndRoom() {
  const searchParams = new URLSearchParams(window.location.search);
  const username = searchParams.get("username");
  const room = searchParams.get("room");
  return { username, room };
}

export { getUsernameAndRoom };
