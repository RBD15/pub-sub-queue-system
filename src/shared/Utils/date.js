function isValidTimestamp(str) {
  const date = new Date(str);
  return !isNaN(date.getTime());
}

function getCurrentTimestamp(){
    const now = new Date();
    // Create a new date with the random offset
    const timestamp = new Date(now.getTime());
    return timestamp
}

function randomTimeStampDate(){
    const now = new Date();

    // Generate a random number of milliseconds between 1 and 2 hours
    const minOffset = 1 * 60 * 60 * 1000; // 1 hour in ms
    const maxOffset = 2 * 60 * 60 * 1000; // 2 hours in ms
    const randomOffset = Math.floor(Math.random() * (maxOffset - minOffset + 1)) + minOffset;

    // Create a new date with the random offset
    const timestamp = new Date(now.getTime() + randomOffset);
    return timestamp
}

module.exports = {randomTimeStampDate,isValidTimestamp,getCurrentTimestamp}