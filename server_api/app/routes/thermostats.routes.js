import { verifyToken } from "../middleware/authJwt.js";
import bodyParser from "body-parser";
import db from "../models/index.js";
import multer from "multer";
import { QueryTypes } from "sequelize";
const upload = multer({
  limits: {
    fileSize: 500000, // 5MB per file
    fieldSize: 500000,
  }, // Set limit to 250MB
});

async function deleteThermostate(req, res) {
  const userID = req.userId;
  const thermoID = req.body.ID;
  const sql = "delete Thermostats where id = " + thermoID;
  await db.sequelize.query(sql, {
    type: QueryTypes.DELETE,
  });

  await getAllThermostats(req, res);
  return;
  const OK = {
    success: true,
  };
  res.status(200).json(OK);
}

async function setThermostatName(req, res) {
  const userID = req.userId;
  const thermoID = req.body.ID;
  const name = req.body.Name;
  const sql =
    "update Thermostats set name = '" + name + "' where id = " + thermoID;
  await db.sequelize.query(sql, {
    type: QueryTypes.UPDATE,
  });

  await getAllThermostats(req, res);
  return;
  const OK = {
    success: true,
  };
  res.status(200).json(OK);
}

async function setThermostatDeviceID(req, res) {
  const userID = req.userId;
  const thermoID = req.body.ID;
  const ID = req.body.deviceID;
  const sql =
    "update Thermostats set deviceID = '" + ID + "' where id = " + thermoID;
  await db.sequelize.query(sql, {
    type: QueryTypes.UPDATE,
  });
  await getAllThermostats(req, res);
  return;

  const OK = {
    success: true,
  };
  res.status(200).json(OK);
}

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

/*
export async function getAllThermostats(req, res) {
  const rooms = db.room;

  const thermostats = await db.thermostat.findAll({
    include: [
      {
        model: rooms,
        as: "room",
        attributes: ["id", "name"], // Only select needed fields
      },
    ],
  });

  //console.log("JSON.stringify(roomsWithStrangs):", JSON.stringify(roomsWithStrangs));
  const OK = {
    success: true,
    thermostats: thermostats,
  };
  res.status(200).json(OK);
}
*/

export async function connectRoom(req, res) {
  const thermostat = await db.thermostat.findByPk(req.body.thermostatID);

  if (!thermostat) {
    const OK = {
      success: false,
      message: "did not find thermostate",
    };
    res.status(200).json(OK);
  }

  const roomID = Number(req.body.roomID);
  if (thermostat.room_Id === roomID) {
    thermostat.room_Id = null;
  } else {
    if (thermostat.room_Id !== roomID) {
      thermostat.room_Id = roomID;
    }
  }
  await thermostat.save();
  //console.log("JSON.stringify(roomsWithStrangs):", JSON.stringify(roomsWithStrangs));

  await getAllThermostats(req, res);
}

export default function thernostatsRoutes(app) {
  app.use(bodyParser.json({ limit: "1gb", sizeLimit: "1gb" }));
  app.use(
    bodyParser.urlencoded({
      limit: "1gb",
      sizeLimit: "1gb",
      extended: true,
    }),
  );

  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept",
    );
    next();
  });

  app.post("/heating/thermostats", [verifyToken], getAllThermostats);
  app.post("/heating/connectRoom", [verifyToken], upload.any(), connectRoom);
  app.post(
    "/heating/thermostatName",
    [verifyToken],
    upload.any(),
    setThermostatName,
  );
  app.post(
    "/heating/thermostatID",
    [verifyToken],
    upload.any(),
    setThermostatDeviceID,
  );
  app.post(
    "/heating/deleteThermostate",
    [verifyToken],
    upload.any(),
    deleteThermostate,
  );

  //app.get("/api/test/rooms", [verifyToken], getAll);

  //app.get("/api/test/room", [verifyToken], getSingleRoom);

  //app.get("/api/test/updateRoomName", [verifyToken], updateRoomName);
}
