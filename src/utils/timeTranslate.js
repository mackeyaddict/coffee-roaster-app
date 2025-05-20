import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

export const secondsToMinutes = (seconds) => {
  if (typeof seconds !== 'number' || seconds < 0) {
    throw new Error('seconds must be a non-negative number');
  }
  return seconds / 60;
}

export const minutesToSeconds = (minutes) => {
  if (typeof minutes !== 'number' || minutes < 0) {
    throw new Error('minutes must be a non-negative number');
  }
  return minutes * 60;
}

export const formatElapsedTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const formatFirebaseTimestamp = (timestamp, format = "DD MMM YYYY") => {
  if (!timestamp) return "-";
  return dayjs(timestamp.toDate()).format(format);
};