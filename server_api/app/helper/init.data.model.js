import db from "./../models/index.js";
import { hashSync, compareSync } from "bcryptjs";

export async function initial() {
  const Role = db.role;
  const User = db.user;
  const Room = db.room;
  const Strang = db.strang;
  const Thermostat = db.thermostat;
  await Role.create({
    id: 1,
    name: "user",
  });

  await Role.create({
    id: 2,
    name: "moderator",
  });

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  await Role.create({
    id: 3,
    name: "admin",
  });

  const bedRoom2 = await Room.create(
    {
      name: "Büro",
      size: 20,
      temperature: 23,
      targetTemperature: 20,
      strangs: [
        { name: "Strang 02", pin1: 19, pin2: 26, currentPos: 0, state: 1 },
      ],
      thermostats: [
        {
          name: "Büro",
          deviceID: "0xa4c138016a3bffff",
          temperature: 25,
          humidity: 55,
          battery: 65,
        },
      ],
    },
    {
      include: [
        { model: Strang, as: "strangs" },
        { model: Thermostat, as: "thermostats" },
      ], // Required for nested insert
    },
  );

  const bedRoom1 = await Room.create(
    {
      name: "Schlafzimmer",
      size: 20,
      temperature: 23,
      targetTemperature: 20,
      strangs: [
        { name: "Strang 01", pin1: 12, pin2: 16, currentPos: 0, state: 1 },
      ],
      thermostats: [
        {
          name: "Schlafzimmer",
          deviceID: "0xa4c1380186c2ffff",
          temperature: 24,
          humidity: 54,
          battery: 64,
        },
      ],
    },
    {
      include: [
        { model: Strang, as: "strangs" },
        { model: Thermostat, as: "thermostats" },
      ], // Required for nested insert
    },
  );
  const kitchen = await Room.create(
    {
      name: "Wohnzimmer",
      size: 20,
      targetTemperature: 20,
      temperature: 23,
      strangs: [
        { name: "Strang 03", pin1: 21, pin2: 20, currentPos: 0, state: 1 },
        { name: "Strang 04", pin1: 11, pin2: 25, currentPos: 0, state: 1 },
        { name: "Strang 05", pin1: 10, pin2: 22, currentPos: 0, state: 1 },
      ],
      thermostats: [
        {
          name: "thermo 06",
          deviceID: "0xa49e69fffe6daa28",
          temperature: 23,
          humidity: 53,
          battery: 63,
        },
      ],
    },
    {
      include: [
        { model: Strang, as: "strangs" },
        { model: Thermostat, as: "thermostats" },
      ], // Required for nested insert
    },
  );
  const bathRoom = await Room.create(
    {
      name: "Bad",
      size: 20,
      targetTemperature: 20,
      temperature: 23,
      strangs: [
        { name: "Strang 06", pin1: 23, pin2: 24, currentPos: 0, state: 1 },
      ],
      thermostats: [
        {
          name: "thermo 09",
          deviceID: "0xf4b3b1fffe4e807d",
          temperature: 31,
          humidity: 41,
          battery: 41,
        },
      ],
    },
    {
      include: [
        { model: Strang, as: "strangs" },
        { model: Thermostat, as: "thermostats" },
      ], // Required for nested insert
    },
  );

  const toilette = await Room.create(
    {
      name: "Toilette",
      size: 20,
      targetTemperature: 20,
      temperature: 23,
      strangs: [
        {
          name: "Strang 08",
          pin1: 27,
          pin2: 17,
          currentPos: 0,
          maxPos: 6000,
          state: 1,
        },
      ],
      thermostats: [
        {
          name: "Toilette",
          deviceID: "0xf4b3b1fffe52241d",
          temperature: 21,
          humidity: 51,
          battery: 61,
        },
      ], //
    },
    {
      include: [
        { model: Strang, as: "strangs" },
        { model: Thermostat, as: "thermostats" },
      ], // Required for nested insert
    },
  );

  const usr = await User.create({
    id: getRandomInt(3, 333),
    username: "admin",
    password: hashSync("4711"),
  });

  //usr.rooms
  console.log("update room ", bedRoom1.id, " usr.id ", usr.id);
  const saved1 = await bedRoom1.setUser(usr);
  const saved2 = await bedRoom2.setUser(usr);
  const saved3 = await kitchen.setUser(usr);
  const saved4 = await bathRoom.setUser(usr);
  const saved5 = await toilette.setUser(usr);

  /*
  try {
    const updated = await Room.update(
      { user_id: usr.id },
      { where: { id: aRoom.id } }
    );
    console.log("update room", updated);
  } catch (err) {
    console.error(err);
  }*/
}
