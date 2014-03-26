function hourFormatter(hour) {
  if (hour < 12) {
    return hour + "AM";
  } else if (hour === 12) {
    return "12PM";
  } else if (hour < 24) {
    return (hour - 12) + "PM";
  } else if (hour == 24) {
    return "12AM";
  } else {
    return (hour - 24) + "AM";
  }
}


// Define the accessors - this is the logic for how data is rendered
function hourAccessor(d) {
  var date = d.date;
  var hour =  date.getHours() + date.getMinutes() / 60;
  hour = hour < 5 ? hour + 24 : hour;
  return hour;
}
