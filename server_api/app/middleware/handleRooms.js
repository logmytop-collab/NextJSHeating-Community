import db from "../models/index.js";
import { QueryTypes } from "sequelize";

export async function getAllRooms(req, res) {
  const strangs = db.strang;
  const rooms = db.room;
  const thermostats = db.thermostat;

  const user = await db.user.findByPk(req.userId, {
    include: [
      {
        model: rooms,
        as: "rooms",
        attributes: ["id", "name", "targetTemperature"], // Only select needed fields
        include: [
          {
            model: thermostats,
            as: "thermostats",
            attributes: [
              "id",
              "name",
              "temperature",
              "battery",
              "humidity",
              "deviceID",
              "updatedAt",
            ], // Only select needed fields
          },
          {
            model: strangs,
            as: "strangs",
            attributes: [
              "id",
              "name",
              "pin1",
              "pin2",
              "currentPos",
              "closePos",
              "openPos",
              "maxPos",
              "state",
            ], // Only select needed fields
          },
        ],
      },
    ],
  });

  //console.log("JSON.stringify(roomsWithStrangs):", JSON.stringify(roomsWithStrangs));
  const OK = {
    success: true,
    OK: "OK",
    rooms: user.rooms,
    userName: user.username,
  };
  res.status(200).json(OK);
}

/*
export async function getAllThermostats(req, res) {
  const sql = `SELECT 
  t.id AS id,
    t.name AS name,
    t.temperature as temperature,
  t.humidity as humidity,
  t.battery as battery,
  t.deviceID as deviceID,
  t.room_id AS room_id,
  r.name AS room
FROM Thermostats t
LEFT OUTER JOIN Rooms r
    ON r.id = t.room_id
GROUP BY t.id, t.name
ORDER BY t.name`;
  const ret = await db.sequelize.query(sql, {
    type: QueryTypes.SELECT,
  });
  //console.log("JSON.stringify(roomsWithStrangs):", JSON.stringify(roomsWithStrangs));
  const OK = {
    success: true,
    OK: "OK",
    thermostats: ret,
  };
  res.status(200).json(OK);
}

*/
