import { Room } from "@/app/api/lib/types";

export const getTempAverage = (room: Room) => {
  if (room.thermostats.length === 0) return undefined;

  const average =
    room.thermostats.reduce((sum, item) => sum + item.temperature, 0) /
    room.thermostats.length;
  return average;
};

export const getHumidityAverage = (room: Room) => {
  if (room.thermostats.length === 0) return undefined;

  const average =
    room.thermostats.reduce((sum, item) => sum + item.humidity, 0) /
    room.thermostats.length;
  return average;
};

export const getBatteryMin = (room: Room) => {
  if (room.thermostats.length === 0) return undefined;

  return Math.min(...room.thermostats.map((r) => r.battery));
};

const getDate = (dateStr: string) => {
  if (!dateStr) throw Error("wrong date");
  const date = new Date(dateStr);

  if (!isNaN(date.getTime())) {
    return date;
  }
  throw Error("wrong date");
  return new Date();
};

export const getUpdateMax = (room: Room) => {
  try {
    if (room.thermostats.length === 0) return undefined;

    let ret = getDate(room.thermostats[0].updatedAt.toString()).getTime();
    room.thermostats.forEach((t) => {
      const sampleDate = getDate(t.updatedAt.toString());
      if (!sampleDate) return undefined;
      if (ret < sampleDate.getTime()) ret = sampleDate.getTime();
    });
    return new Date(ret);
  } catch (err) {
    return undefined;
  }
};

export const getValvePos = (room: Room) => {
  if (room.strangs.length === 0) return undefined;

  let averageRelativePos = 0;
  for (let i = 0; i < room.strangs.length; i++) {
    const pos = room.strangs[i].currentPos - room.strangs[i].closePos;
    averageRelativePos +=
      pos / (room.strangs[i].openPos - room.strangs[i].closePos);
  }
  return averageRelativePos / room.strangs.length;
};
