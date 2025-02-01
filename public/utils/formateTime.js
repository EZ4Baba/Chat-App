function getformatedTime(time) {
  if (!time) return "";
  let formated = moment(time).format("h mm a");
  let formated_array = formated.split(" ");
  let final_time =
    formated_array[0] + ":" + formated_array[1] + " " + formated_array[2];
  return final_time;
}

export { getformatedTime };
