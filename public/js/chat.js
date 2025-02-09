const socket = io();
import { getformatedTime } from "../utils/formateTime.js";
import { getUsernameAndRoom } from "../utils/params.js";

const shareLocationButton = document.getElementById("shareLocation");
const form = document.querySelector("form");
const frombutton = document.getElementById("form-button");

const messages = document.querySelector("#messages");
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;

//get client location

shareLocationButton.addEventListener("click", async () => {
  shareLocationButton.disabled = true;
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    socket.emit(
      "locationMessage",
      { latitude, longitude },
      (ackerrorfeedaback) => {
        if (ackerrorfeedaback) {
          return console.log("Client error : ", ackerrorfeedaback);
        }
        shareLocationButton.disabled = false;
        console.log("location shared successfully");
      }
    );
  });
});

//on form submission, get the message from the form and send it
form.addEventListener("submit", (e) => {
  e.preventDefault();
  frombutton.disabled = true;
  const formdata = new FormData(e.target);
  const message = formdata.get("message");
  socket.emit("message", message, (ackfeedback) => {
    frombutton.disabled = false;
    //callback is registered and runs when server sends the acknowlegment packet
    if (ackfeedback) {
      console.log("server says : client error, ", ackfeedback);
      return;
    }
    console.log("message deliverd");
  });
  e.target.elements.message.value = "";
  e.target.elements.message.focus();
});

//on connection
socket.on("welcome", (message) => {
  console.log("got welcome ", message.text);
  const { text } = message;
  const html = Mustache.render(messageTemplate, {
    message: text,
    createdAt: getformatedTime(),
  });
  messages.insertAdjacentHTML("beforeend", html);
});

//check for message event
socket.on("message", (message) => {
  console.log("got message ", message.text);
  const { text } = message;
  const html = Mustache.render(messageTemplate, {
    message: text,
    createdAt: getformatedTime(message.createdAt),
  });
  messages.insertAdjacentHTML("beforeend", html);
});

// on location pings
socket.on("locationMessage", (message) => {
  console.log(message);
  const { text } = message;
  const html = Mustache.render(locationTemplate, {
    message: text,
    createdAt: getformatedTime(message.createdAt),
  });
  messages.insertAdjacentHTML("beforeend", html);
});

socket.emit("join", getUsernameAndRoom(), (error) => {
  // if any errors
  console.log("error in join", error);
});
