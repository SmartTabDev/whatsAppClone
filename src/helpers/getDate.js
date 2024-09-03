import moment from "moment";

export const getDate = registered => {
  if (registered) {

    const today = new Date();
    const dateIso = new Date(registered);
    const date = (today - dateIso) / (1000 * 60 * 60 * 24);
    if (date < 2 && date > 1) {
      return 'Yesterday';
    } else if (date >= 2) {
      return registered.split(' ', 1);
    } else {
      if (dateIso.getDay() < today.getDay()) {
        return 'Yesterday';
      }
      if (dateIso.getHours() >= 5 && dateIso.getHours() < 12) {
        return (
          'Morning ' +
          dateIso.getHours() +
          ':' +
          dateIso.getMinutes().toString().padStart(2, '0')
        );
      } else if (dateIso.getHours() >= 12 && dateIso.getHours() < 17) {
        return (
          'Afternoon ' +
          dateIso.getHours() +
          ':' +
          dateIso.getMinutes().toString().padStart(2, '0')
        );
      } else if (dateIso.getHours() >= 17 && dateIso.getHours() < 21) {
        return (
          'Evening ' +
          dateIso.getHours() +
          ':' +
          dateIso.getMinutes().toString().padStart(2, '0')
        );
      } else {
        return (
          'Night ' +
          dateIso.getHours() +
          ':' +
          dateIso.getMinutes().toString().padStart(2, '0')
        );
      }
    }
  } else {
    return ""
  }
};

export const formatDate = timestamp => {
  const date = new Date(timestamp);
  const now = new Date();
  const utcDate1 = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const utcDate2 = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diffTime = Math.abs(utcDate2 - utcDate1);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return moment(date).format('h.mm a')
  } else if (diffDays === 1 && date.toDateString() === new Date(now - 86400000).toDateString()) {
    return `Yesterday ${moment(date).format('h.mm a')}`;
  } else if (diffDays <= 7 && date < now) {
    return ` ${moment(date).format('ddd h.mm a')}`;
  } else if (diffDays <= 365) {
    return `${moment(date).format('ddd MM/DD h.mm a')}`;
  } else {
    return `${moment(date).format('ddd YYYY/MM/DD h.mm a')}`;
  }
}

export const shortDate = timestamp => {
  const date = new Date(timestamp);
  const now = new Date();
  const utcDate1 = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const utcDate2 = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diffTime = Math.abs(utcDate2 - utcDate1);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return moment(date).format('h.mm a')
  } else if (diffDays === 1 && date.toDateString() === new Date(now - 86400000).toDateString()) {
    return `Yesterday ${moment(date).format('h.mm a')}`;
  } else if (diffDays <= 7 && date < now) {
    return ` ${moment(date).format('dddd')}`;
  } else if (diffDays <= 365) {
    return `${moment(date).format('MM/DD dddd')}`;
  } else {
    return `${moment(date).format('YYYY/MM/DD dddd')}`;
  }
}

