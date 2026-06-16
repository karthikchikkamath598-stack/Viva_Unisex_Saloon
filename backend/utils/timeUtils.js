const convertTimeTo24h = (timeStr) => {
  if (!timeStr) return "00:00";
  const parts = timeStr.split(' ');
  if (parts.length < 2) return timeStr;
  const time = parts[0];
  const modifier = parts[1];
  let [hours, minutes] = time.split(':');
  if (modifier === 'PM' && hours !== '12') {
    hours = (parseInt(hours, 10) + 12).toString();
  }
  if (modifier === 'AM' && hours === '12') {
    hours = '00';
  }
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

module.exports = { convertTimeTo24h };
