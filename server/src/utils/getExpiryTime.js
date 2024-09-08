const millisecondsInUnit = {
  s: 1000,
  m: 60000,
  h: 3600000,
  d: 86400000,
};

const getExpiryTime = (expiryTime) => {
  const time = parseInt(expiryTime.match(/\d+/g)[0]);
  const unit = expiryTime.match(/[a-zA-Z]+/g)[0].trim();

  var futureExpiryTime;

  if (unit === "s") {
    futureExpiryTime = millisecondsInUnit.s * time;
  } else if (unit === "m") {
    futureExpiryTime = millisecondsInUnit.m * time;
  } else if (unit === "h") {
    futureExpiryTime = millisecondsInUnit.h * time;
  } else if (unit === "d") {
    futureExpiryTime = millisecondsInUnit.d * time;
  }

  return Date.now() + futureExpiryTime;
};

export { getExpiryTime };
