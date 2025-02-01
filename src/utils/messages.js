function generateMessage(text) {
  return {
    text,
    createdAt: new Date().getTime(),
  };
}
function generateLocationMessage(position) {
  const { latitude, longitude } = position;
  const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
  return {
    text: url,
    createdAt: new Date().getTime(),
  };
}
module.exports = { generateMessage, generateLocationMessage };
