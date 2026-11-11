import db from "../models/index.js";
import { moveStrang } from "../gpio/strang.gpio.js";

const strangs = db.strang;
const rooms = db.room;

/*
export const checkStrangs = async (room) => {
  let temp = undefined;
  if (room.thermostats.length === 0) return;

  room.thermostats.forEach((therm) => {
    if (therm.temperature !== undefined) {
      if (temp === undefined) temp = 0;
      temp += therm.temperature;
    }
  });
  temp /= room.thermostats.length;

  console.log(
    "temperature room ",
    room.name,
    " is ",
    temp,
    " target temp = ",
    room.targetTemperature,
  );

  if (temp === undefined) return;

  if (temp != room.temperature);
  {
    room.temperature = temp;
    await room.save();
    if (temp < room.targetTemperature) {
      // heating
      await room.strangs.forEach(async (strang) => {
        await moveStrang(strang, true);
      });
    } else {
      await room.strangs.forEach(async (strang) => {
        await moveStrang(strang, false);
      });
    }
  }
};
*/
