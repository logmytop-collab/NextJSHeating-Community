import mqtt from "mqtt";
import db from "../models/index.js";
import { Op } from "sequelize";
import {
  goToStrangPosPinCtrl,
  moveStrang,
  maxTIME,
  moveMax,
  moveZero,
} from "../gpio/strang.gpio.js";

import { mqttClient } from "../mytt/mqtt.helper.js";
import Logdata from "./logdata.model.js";

const room = db.room;
const strangs = db.strang;

//let mqttClient = mqtt.connect("mqtt://127.0.0.1:1883", options);
//let mqttClient = mqtt.connect("mqtt://172.20.0.3:1883", options);
//let mqttClient = mqtt.connect("mqtt://mosquitto:1883", options);
//let mqttClient = mqtt.connect("mqtt://mqtt:1883", options);

const getDevIDs = async () => {
  const ret = [];
  const allThemos = await db.thermostat.findAll();
  allThemos.forEach((thermo) => {
    if (thermo.name) {
      ret.push(thermo.name);
    }
    if (thermo.deviceID) ret.push(thermo.deviceID);
  });
  console.log("device names  ", ret.join(","));
  return ret;
};

const updateRoomStrangsByID = async (roomID, res) => {
  try {
    const foundRoom = await db.room.findOne({
      where: { id: roomID },
      include: [
        {
          model: db.thermostat,
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
            "closePos",
            "openPos",
            "maxPos",
            "state",
          ], // Only select needed fields
        },
      ],
    });
    if (foundRoom) {
      console.log("found room yeah ");
      await updateRoom(foundRoom, undefined);
    }
  } catch (err) {
    console.log("error on loading room", err);
  }
};

export const updateRoom = async (room, res) => {
  if (room.thermostats.length === 0) {
    console.log("no thermostat found");
    return;
  }
  var currentTemperature = 0;
  for (var i = 0; i < room.thermostats.length; i++) {
    currentTemperature += room.thermostats[i].temperature;
  }
  currentTemperature /= room.thermostats.length;
  console.log(
    "currentTemperature ",
    currentTemperature,
    " foundRoom.targetTemperature ",
    room.targetTemperature,
  );
  const close = currentTemperature < room.targetTemperature;
  for (var i = 0; i < room.strangs.length; i++) {
    const stepSizeInt =
      (close ? room.strangs[i].closePos : room.strangs[i].openPos) -
      room.strangs[i].currentPos;

    if (stepSizeInt !== 0) await moveStrang(room.strangs[i], stepSizeInt, null);

    //await moveMax(room.strangs[i]);
  }
  if (res && !res.headersSent) {
    const OK = {
      success: true,
    };
    res.status(200).json(OK);
  }
};

const setUpMqtt = async () => {
  console.log("setting up mosquitto in setUpMqtt() ");

  mqttClient.on("connect", () => {
    console.log("connected ... ");

    mqttClient.subscribe("presence", (err) => {
      if (!err) {
        mqttClient.publish("presence", "Hello mqtt");
      }
    });

    console.log("mqttClient.subscribe('sensor/temperature')");
  });

  const topic = "/sensors/temperature";

  mqttClient.subscribe("zigbee2mqtt/Toilette");
  console.log('twice mqttClient.subscribe("zigbee2mqtt/Toilette")');

  await getDevIDs().then(async (names) => {
    console.log("got names ", names.join("-"));
    names.forEach((name) => {
      const subText = "zigbee2mqtt/" + name;
      mqttClient.subscribe(subText);
      console.log("subsribe text ", subText);
    });
  });

  mqttClient.publish(topic, "payload", { qos: 1 }, (err) => {
    if (err) {
      console.error(err);
    }
    console.log("published");
  });

  mqttClient.on("message", async (topic, message) => {
    // message is Buffer
    //const thermostats = db.thermostat;
    console.log("mqtt message topic ", topic);
    console.log("mqtt message");
    console.log(message.toString());
    if (topic.startsWith("zigbee2mqtt")) {
      const topicSplit = topic.split("/");
      console.log("update temperature", topicSplit.join("."));
      if (topicSplit.length != 2) return;
      const dataJson = JSON.parse(message.toString());
      //console.log("dataJson ", dataJson);
      //console.log("dataJson ", JSON.parse(dataJson));

      if (dataJson.temperature)
        console.log("json Temperature ", dataJson.temperature);
      if (dataJson.humidity) console.log("json humidity ", dataJson.humidity);
      if (dataJson.battery) console.log("json battery ", dataJson.battery);
      const deviceNameID = topicSplit[1];
      console.log("update temperature ", deviceNameID);

      const foundTherma = await db.thermostat.findOne({
        where: {
          [Op.or]: [{ name: deviceNameID }, { deviceID: deviceNameID }],
        },
        include: [
          {
            model: room,
            as: "room",
            attributes: ["id"], // Only select needed fields
          },
        ],
      });
      if (foundTherma) {
        console.log("found Thermostate ", JSON.stringify(foundTherma));
        try {
          foundTherma.temperature = dataJson.temperature;
          foundTherma.humidity = dataJson.humidity;
          foundTherma.battery = dataJson.battery;
          await foundTherma.save();

          console.log("saved temperature ");

          await updateRoomStrangsByID(foundTherma.room.id, undefined);
          console.log("saved temperature ");
          const Logdata = db.logdata;
          const log = await Logdata.create({
            temperature: dataJson.temperature,
            humidity: dataJson.humidity,
            thermostat_Id: foundTherma.id,
          });

          console.log("saved logdata ");
        } catch (exc) {
          console.log("no error on update temperature");
        }
      }
    }
  });

  // error handling
  mqttClient.on("error", (error) => {
    console.error(error);
    //process.exit(1);
  });
};

export default setUpMqtt;
