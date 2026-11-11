import {
  isAdmin,
  isModerator,
  isModeratorOrAdmin,
  verifyToken,
} from "./../middleware/authJwt.js";
import db from "../models/index.js";
import {
  goToStrangPosPinMqtt,
  stopStrang,
  moveStrang,
  moveMax,
  moveZero,
  goToStrangPosPythonPinCtrl,
} from "../gpio/strang.gpio.js";
import bodyParser from "body-parser";
import { getAllRooms } from "./../middleware/handleRooms.js";

const strangs = db.strang;
const rooms = db.room;
const thermostats = db.thermostat;

import multer from "multer";
const upload = multer({
  limits: {
    fileSize: 500000, // 5MB per file
    fieldSize: 500000,
  }, // Set limit to 250MB
});

export var strangState = {
  disabled: 0,
  enabled: 1,
  movingUp: 2,
  movingDown: 4,
};

function getAll(req, res) {
  res.status(200).send("Public Content.");
}

async function openCloseStrang(req, res, close) {
  const strangID = req.body.strangID;
  strangs
    .findByPk(strangID)
    .then((strang) => {
      const stepSizeInt =
        (close ? strang.closePos : strang.openPos) - strang.currentPos;

      moveStrang(strang, stepSizeInt, res);
    })
    .catch((err) => {
      console.log("error on loading room", err);
      const OK = {
        success: false,
        message: "Error: " + err,
      };
      res.status(200).json(OK);
    });
}
async function openStrang(req, res) {
  openCloseStrang(req, res, false);
}

async function closeStrang(req, res) {
  openCloseStrang(req, res, true);
}

async function stopStrangRequest(req, res) {
  try {
    const strangID = Number(req.body.strangID);
    console.log("strangID ", strangID);
    const strang = await strangs.findByPk(strangID);
    const OK = {
      success: true,
    };
    if (
      strang.state === strangState.movingDown ||
      strang.state === strangState.movingUp
    ) {
      const newPos = await stopStrang(strang);
      OK.newPos = newPos;
    }
    res.status(200).json(OK);
  } catch (err) {
    const OK = {
      success: false,
      message: "Error: " + err,
    };
    res.status(200).json(OK);
  }
}

async function setZero(req, res) {
  console.log("strangID ", JSON.stringify(req.body.strangID));
  try {
    const strangID = req.body.strangID;
    const strang = await strangs.findByPk(strangID);
    strang.currentPos = 0;
    await strang.save();
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

async function moveZeroRoute(req, res) {
  console.log("Move zero ", JSON.stringify(req.query.strangID));
  try {
    const strangID = req.query.strangID;
    const strang = await strangs.findByPk(strangID);

    await moveZero(req, res, strang);
  } catch (err) {
    const OK = {
      success: false,
      message: "Error: " + err,
    };
    res.status(200).json(OK);
  }
}

async function moveMaxRoute(req, res) {
  console.log("move Max ", JSON.stringify(req.query.strangID));
  try {
    const strangID = req.query.strangID;
    const strang = await strangs.findByPk(strangID);

    await moveMax(req, res, strang);
  } catch (err) {
    const OK = {
      success: false,
      message: "Error: " + err,
    };
    res.status(200).json(OK);
  }
}

async function setMax(req, res) {
  console.log("strangID ", JSON.stringify(req.body.strangID));
  try {
    const strangID = req.body.strangID;
    const strang = await strangs.findByPk(strangID);
    strang.maxPos = strang.currentPos;
    await strang.save();
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

export async function getAllStrangs(req, res) {
  const ret = await db.strang.findAll();

  //console.log("JSON.stringify(roomsWithStrangs):", JSON.stringify(roomsWithStrangs));
  const OK = {
    success: true,
    OK: "OK",
    strangs: ret,
  };
  res.status(200).json(OK);
}

async function setClosPos(req, res) {
  console.log("strangID ", JSON.stringify(req.body.strangID));
  try {
    const strangID = req.body.strangID;
    const strang = await strangs.findByPk(strangID);
    strang.closePos = strang.currentPos;
    await strang.save();
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

async function setOpenPos(req, res) {
  console.log("strangID ", JSON.stringify(req.body.strangID));
  try {
    const strangID = req.body.strangID;
    const strang = await strangs.findByPk(strangID);
    strang.openPos = strang.currentPos;
    await strang.save();
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

async function getPos(req, res) {
  console.log("strangID ", JSON.stringify(req.body.strangID));
  await getAllRooms(req, res);
}

async function enableStrang(req, res) {
  console.log("enable strang", req.query);
  try {
    const userID = req.userId;
    const roomID = req.body.roomID;
    const strangID = req.body.strangID;
    const state = req.body.enable ? strangState.enabled : strangState.disabled;
    console.log(" strang id", strangID, " state ", state);
    const strang = await strangs.findOne({
      where: { id: strangID },
    });
    strang.state = state;
    await strang.save();

    await getAllRooms(req, res);
  } catch (err) {
    const OK = {
      success: false,
      message: "Error: " + err,
    };
    res.status(200).json(OK);
  }

  //openStrang(strang, enabled === 1 ? ValveState.open : ValveState.close);
}

async function setStrangPos(req, res) {
  console.log("set strang pos", req.query);
  try {
    const strangID = req.body.strangID;
    const newPos = req.body.pos;
    console.log(" strang id", strangID, " new Pos ", newPos);
    const strang = await strangs.findOne({
      where: { id: strangID },
    });
    strang.state = 2;
    await strang.save();

    goToStrangPosPinMqtt(strang);

    await getAllRooms(req, res);
  } catch (err) {
    const OK = {
      success: false,
      message: "Error: " + err,
    };
    res.status(200).json(OK);
  }
  //openStrang(strang, enabled === 1 ? ValveState.open : ValveState.close);
}

async function moveStep(req, res) {
  console.log("set strang pos", req.query);
  try {
    const strangID = req.body.strangID;
    const stepSize = req.body.stepSize;
    const up = req.body.up === "true";
    console.log(" strang id", strangID, " new Pos ", stepSize, " up ", up);
    const strang = await strangs.findOne({
      where: { id: strangID },
    });
    goToStrangPosPythonPinCtrl(
      strang,
      Number(up === false ? -stepSize : stepSize),
      res,
    );
    //await getAllRooms(req, res);
  } catch (err) {
    const OK = {
      success: false,
      message: "Error: " + err,
    };
    res.status(200).json(OK);
  }
  //openStrang(strang, enabled === 1 ? ValveState.open : ValveState.close);
}

export default function strangRoutes(app) {
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

  app.get("/api/test//strang", [verifyToken], upload.any(), getAll);

  app.post("/heating/openStrang", [verifyToken], upload.any(), openStrang);
  app.post("/heating/strangs", [verifyToken], upload.any(), getAllStrangs);
  app.post("/heating/closeStrang", [verifyToken], upload.any(), closeStrang);
  app.post(
    "/heating/stopStrang",
    [verifyToken],
    upload.any(),
    stopStrangRequest,
  );
  app.post("/heating/setStrangZero", [verifyToken], upload.any(), setZero);
  app.post("/heating/setStrangPos", [verifyToken], upload.any(), setStrangPos);
  app.post("/heating/setStrangOpen", [verifyToken], upload.any(), setOpenPos);
  app.post("/heating/setStrangClose", [verifyToken], upload.any(), setClosPos);
  app.post("/heating/setStrangMax", [verifyToken], upload.any(), setMax);
  app.post("/heating/getPos", [verifyToken], upload.any(), getPos);
  app.post("/heating/moveZero", [verifyToken], upload.any(), closeStrang);
  app.post("/heating/moveStep", [verifyToken], upload.any(), moveStep);

  app.get("/api/test/moveMax", [verifyToken], moveMaxRoute);

  app.post("/heating/enableStrang", [verifyToken], upload.any(), enableStrang);
}
