import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

export const secondsToMinutes = (seconds) => {
  if (seconds === null || seconds === undefined || seconds === "") return null;
  const num = Number(seconds);
  if (isNaN(num)) return null;

  return Math.round((num / 60) * 100) / 100;
};

export const minutesToSeconds = (minutes) => {
  if (typeof minutes !== "number" || minutes < 0) {
    throw new Error("minutes must be a non-negative number");
  }
  return minutes * 60;
};

export const formatElapsedTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export const formatFirebaseTimestamp = (timestamp, format = "DD MMM YYYY") => {
  if (!timestamp) return "-";
  return dayjs(timestamp.toDate()).format(format);
};
