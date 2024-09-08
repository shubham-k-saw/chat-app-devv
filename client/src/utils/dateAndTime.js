export const getTime = (timestamp) => {
  // Convert timestamp to a Date object if it isn't already one
  const date = new Date(timestamp);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.error("Invalid Date object:", date);
    return "Invalid Time";
  }

  // Return the formatted time string
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const getDate = (timestamp) => {
  // Check if timestamp is valid
  if (!timestamp) {
    console.error("Invalid timestamp:", timestamp);
    return "Invalid Date";
  }

  // Convert timestamp to a Date object if it isn't already one
  const date = new Date(timestamp);
  // console.log(date, timestamp)
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.error("Invalid Date object:", date);
    return "Invalid Date";
  }

  // Format the date
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getOneDayBackDate = (timestamp) => {
  if (!timestamp) {
    console.error("Invalid timestamp:", timestamp);
    return "Invalid Date";
  }

  // Convert timestamp to a Date object if it isn't already one
  const date = new Date(timestamp);

  date.setDate(date.getDate() - 1); // Subtract one day

  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};


export const getTheActualDate = (date) => {

  if(!date){
    return
  }

  const currentDate = getDate(Date.now());
  const oneDayBackDate = getOneDayBackDate(Date.now());
  date = getDate(date)
  if (currentDate === date) {
    return "Today";
  } else if (oneDayBackDate === date) {
    return "Yesterday";
  } else {
    return date;
  }
};