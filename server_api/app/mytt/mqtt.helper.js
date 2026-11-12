import mqtt from "mqtt";

const options = {
  clientId: "Icke",
  Username: process.env.MOSQUITTO_USER,
  Password: process.env.MOSQUITTO_PWD,
  clean: true,
};

export const mosquitto = process.env.MOSQUITTO_SERVER
  ? process.env.MOSQUITTO_SERVER
  : "localhost";

export const mqttClient = mqtt.connect(`mqtt://${mosquitto}:1883`, options);
