import { verifyToken } from "./../middleware/authJwt.js";
import { getAllRooms } from "./../middleware/handleRooms.js";
import { updateRoom } from "./../models/themperature.helper.js";
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

async function getSingleRoom(req, res) {
  res.status(200).send(JSON.stringify(room));
}

async function setRoomTemperature(req, res) {
  const userID = req.userId;
  const roomID = req.body.roomID;
  const target = req.body.target;
  const room = await db.room.findByPk(roomID, {
    include: [
      {
        model: db.thermostat,
        as: "thermostats",
        attributes: ["id", "name", "temperature", "humidity"], // Only select needed fields
      },
      {
        model: db.strang,
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
  });
  room.targetTemperature = target;
  await room.save(); // Save the updated room object to the database
  await updateRoom(room, res);
}

async function updateRoomName(req, res) {
  const userID = req.userId;
  const roomID = req.body.roomID;
  const name = req.body.name;
  const sql = "update Rooms set name = '" + name + "' where id = " + roomID;
  try {
    await db.sequelize.query(sql, {
      type: QueryTypes.UPDATE,
    });

    const OK = {
      success: true,
    };
    res.status(200).json(OK);
  } catch (err) {
    const OK = {
      success: false,
      message: "Error: " + err,
    };
    res.status(200).json(OK);
  }
}

async function addRoom(req, res) {
  const userID = req.userId;
  const name = req.body.name;
  try {
    const room = await db.room.create({
      name: name,
      temperature: 22,
      size: 20,
      targetTemperature: 20,
    });

    const usr = await db.user.findByPk(req.userId);
    const savedRoom = await room.setUser(usr);

    getAllRooms(req, res);
  } catch (err) {
    const OK = {
      success: false,
      message: "Error: " + err,
    };
    res.status(200).json(OK);
  }
}

async function getLog(req, res) {
  try {
    const userID = req.userId;
    const roomID = req.body.roomID;
    if (roomID) {
      const room = await db.room.findByPk(roomID, {
        include: [
          {
            model: db.thermostat,
            as: "thermostats",
            attributes: ["id", "name"], // Only select needed fields
          },
        ],
      });

      const window = req.body.window;
      const therostat_logs = [];
      for (const item of room.thermostats) {
        const sql = `select temperature, 
    humidity, 
    updated_at 
    from Logdata 
    where updated_at >= NOW() - INTERVAL ${window === "day" ? " 1 DAY " : window === "week" ? " 1 WEEK " : " 1 MONTH "}
    and thermostat_Id = ${item.id}`;
        const ret = await db.sequelize.query(sql, {
          type: QueryTypes.SELECT,
        });
        therostat_logs.push({ name: name, lods: ret });
      }
      const OK = {
        success: true,
        logdata: therostat_logs,
      };
      res.status(200).json(OK);
      return;
    }
    const thermostatID = req.body.thermostatID;
    const window = req.body.window;
    const therostat_logs = [];
    const sql = `select temperature, 
    humidity, 
    updated_at 
    from Logdata 
    where updated_at >= NOW() - INTERVAL 1 ${window}
    and thermostat_Id = ${thermostatID}`;
    const ret = await db.sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });
    console.log("found logs ", ret.length);
    const OK = {
      success: true,
      logdata: ret,
    };
    res.status(200).json(OK);
    return;
  } catch (err) {
    const OK = {
      success: false,
      message: "Error: " + err,
    };
    res.status(200).json(OK);
  }
}

export default function roomRoutes(app) {
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

  app.post("/heating/rooms", [verifyToken], getAllRooms);
  app.post(
    "/heating/updateRoomName",
    [verifyToken],
    upload.any(),
    updateRoomName,
  );

  //app.get("/api/test/rooms", [verifyToken], getAll);

  //app.get("/api/test/room", [verifyToken], getSingleRoom);

  app.post(
    "/heating/setRoomTemp",
    [verifyToken],
    upload.any(),
    setRoomTemperature,
  );

  app.post("/heating/addRoom", [verifyToken], upload.any(), addRoom);
  app.post("/heating/getLog", [verifyToken], upload.any(), getLog);

  //app.get("/api/test/updateRoomName", [verifyToken], updateRoomName);
}
