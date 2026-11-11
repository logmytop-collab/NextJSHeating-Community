// server.js (MariaDB + Express.js API)

// **********************************************
// 1. MODULE IMPORTIEREN
// **********************************************
import express, { json } from "express";
import { createPool } from "mariadb";
import cors from "cors"; // important for the frontend
import { encrypt, decrypt } from "./app/middleware/crypto_helper.js";
import userRoutes from "./app/routes/user.routes.js"; // important for the frontend
import authRoutes from "./app/routes/auth.routes.js";
import roomRoutes from "./app/routes/room.routes.js";
import versionRoutes from "./app/routes/AppVersion.routs.js";
import strangRoutes from "./app/routes/strang.routes.js";
import db from "./app/models/index.js";
import { HOST, PORT, DB } from "./app/config/db.config.js";
import fs from "fs";
import path from "path";
import { dirname } from "node:path";
import { initial } from "./app/helper/init.data.model.js";
import cookieParser from "cookie-parser";
import setUpMqtt, { updateRoom } from "./app/models/themperature.helper.js";
import { QueryTypes } from "sequelize";
import { setAllPinsLow } from "./app/gpio/strang.gpio.js";
import thernostatsRoutes from "./app/routes/thermostats.routes.js";
import deployRoutes from "./app/routes/deploy.routes.js";

// **********************************************
// 2. KONFIGURATION
// **********************************************
const app = express();

// MariaDB Verbindungspool

// **********************************************
// 3. MIDDLEWARE & DATENBANK-SETUP
// **********************************************

var whitelist = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://server_api:5000",

  "http://172.20.0.5",
  "http://192.168.178.85",
]; //white list consumers

var corsOptions = {
  origin: function (origin, callback) {
    console.log("white list origin ?? ", origin);
    if (!origin) {
      callback(null, true);
      return;
    }
    for (let i = 0; i < whitelist.length; i++) {
      if (origin.indexOf(whitelist[i]) >= 0) {
        console.log("yeah ", origin);

        callback(null, true);
        return;
      }
    }
    console.log("ups no  ", origin);
    callback(null, false);
  },
  methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true, //Credentials are cookies, authorization headers or TLS client certificates.
  allowedHeaders: [
    "x-access-token",
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "device-remember-token",
    "Access-Control-Allow-Origin",
    "x-www-form-urlencoded",
    "Origin",
    "Accept",
  ],
};

app.use(cors(corsOptions)); // permits the access to the index.html
app.use(json()); // Erlaubt das Verarbeiten von JSON-Daten im Request Body

app.use(express.urlencoded({ extended: true })); // <-- For form data

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
console.log("sleep 500 ");
await delay(500);
console.log("sync Db Host ", HOST);
console.log("sync Db port ", PORT);

let initialize = true;

const ret = await db.sequelize.query(
  "show tables from " + DB + " like 'users'",
  {
    type: QueryTypes.SELECT,
  },
);

initialize = ret.length === 0; // If no tables found, set initialize to true
if (!initialize) {
  const users = await db.sequelize.query("select id from " + DB + ".users", {
    type: QueryTypes.SELECT,
  });
  initialize = users.length === 0; // If no users found, set initialize to true
}
const alter = true;

await db.sequelize.sync({ alter: alter, force: initialize }).then(async () => {
  if (initialize) {
    console.log("Drop and Resync Db");
    await initial();
  }
});

console.log("sync Db done ");

// Path to the error log file
const errorLogPath = path.join("./logs/express", "errors.log");

// Create a writable stream for appending errors
const errorStream = fs.createWriteStream(errorLogPath, { flags: "a" });

// Override console.error to also write to file
const originalConsoleError = console.error;
console.error = function (...args) {
  const message = args
    .map((arg) => {
      if (arg instanceof Error) {
        return `${arg.stack}\n`;
      }
      return String(arg);
    })
    .join(" ");

  // Write to stderr (original behavior)
  originalConsoleError.apply(console, args);

  // Append to log file with timestamp
  const timestamp = new Date().toISOString();
  errorStream.write(`[${timestamp}] ${message}\n`);
};

console.error("test008");
//db.sequelize.sync();

// **********************************************
// 4. EXPRESS ROUTING (API-ENDPUNKTE)
// **********************************************

app.set("trust proxy", true); // Enable trust for the X-Forwarded-For header

// --- 4a. Basis Test-Endpunkt ---
app.get("/", (req, res) => {
  const forwardedIpsStr = req.header("x-forwarded-for");
  let clientIP = req.ip;
  console.log("req.ip ", req.ip, " forwardedIpsStr ", forwardedIpsStr);
  if (forwardedIpsStr) {
    clientIP = forwardedIpsStr.split(",")[0];
  } else {
    clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    console.log(
      "req.headers[x-forwarded-for] ",
      req.headers["x-forwarded-for"],
      " req.socket.remoteAddress ",
      req.socket.remoteAddress,
    );
  }
  res.send(
    `<h1>Express API läuft!</h1> Verbunden mit MariaDB an Port. <br> your IP is ` +
      clientIP,
  );
});

//const test = 83;
//const id_str = parseInt(test, 10).toString();
//console.log("id_str ", id_str);
//const str = encrypt(id_str);
//console.log("str ", str);
//const test_out = decrypt(str).toString("utf8");
//console.log("test_out  ", test_out);

authRoutes(app);
userRoutes(app);
roomRoutes(app);
versionRoutes(app);
strangRoutes(app);
thernostatsRoutes(app);
//deployRoutes(app);
// **********************************************
// 5. SERVER STARTEN
// **********************************************

const port = 5000;

app.set("trust proxy", true); // Enable trust for the X-Forwarded-For header

app.get("/", (req, res) => {
  const forwardedIpsStr = req.header("x-forwarded-for");
  let clientIP = req.ip;
  console.log("req.ip ", req.ip, " forwardedIpsStr ", forwardedIpsStr);
  if (forwardedIpsStr) {
    clientIP = forwardedIpsStr.split(",")[0];
  } else {
    clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    console.log(
      "req.headers[x-forwarded-for] ",
      req.headers["x-forwarded-for"],
      " req.socket.remoteAddress ",
      req.socket.remoteAddress,
    );
  }
  res.send(
    `<h1>Express API läuft!</h1> Verbunden mit MariaDB an Port. <br> your IP is ` +
      clientIP,
  );
});

const intervalMs = 60 * 1000 * 10;

const runThempCheckTimer = () => {
  setTimeout(periodicTempCheck, intervalMs);
};

async function periodicTempCheck() {
  const now = new Date();
  console.log(`[${now.toISOString()}] Running temp check ...`);
  const strangs = db.strang;
  const thermostats = db.thermostat;
  const roomsWithStrangs = await db.room.findAll({
    include: [
      {
        model: thermostats,
        as: "thermostats",
        attributes: ["id", "name", "temperature", "humidity"], // Only select needed fields
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
          "maxPos",
          "closePos",
          "openPos",
        ], // Only select needed fields
      },
    ],
  });

  console.log("rooms ...", JSON.stringify(roomsWithStrangs));
  await roomsWithStrangs.forEach(async (room) => {
    await updateRoom(room, undefined);
  });
  runThempCheckTimer();
  // Your logic here (e.g., cleanup, database update, API call)
}

await setAllPinsLow();

await db.sequelize.query("update Strangs set state = 1 ;", {
  type: QueryTypes.UPDATE,
});

const with_mqtt = process.env.MOSQUITTO_SERVER;

if (with_mqtt) await setUpMqtt();

runThempCheckTimer();

app.use(cookieParser());
/*
app.use((req, res, next) => {
  console.log("wrong endpoint ", req.originalUrl);
  res.status(404).send("Sorry, can't find that!");
});
*/
app.all(".", (req, res) => {
  res.status(404).send("<h1>404! Page not found</h1>");
});

// Catch unhandled PUT requests
app.use((req, res, next) => {
  if (req.method === "POST") {
    return res.status(404).json({
      error: "PUT endpoint not found",
      path: req.originalUrl,
    });
  }
  next();
});

app.listen(port, () => {
  console.log(`🚀 Server gestartet auf http://localhost:${port}`);
});
