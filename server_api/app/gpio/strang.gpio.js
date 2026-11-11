import mqtt from "mqtt";
import db from "../models/index.js";
import { exec, execFile } from "node:child_process";
import { strangState } from "../routes/strang.routes.js";
import docker from "dockerode";
import { existsSync } from "node:fs";
import { mqttClient } from "../mytt/mqtt.helper.js";
import { QueryTypes } from "sequelize";

const options = {
  clientId: "Icke",
  Username: "markus",
  Password: "markus",
  clean: true,
};

//let client = mqtt.connect("mqtt://127.0.0.1:1883", options);
//let client = mqtt.connect("mqtt://172.20.0.3:1883", options);
//export let mqttClient = mqtt.connect("mqtt://mosquitto:1883", options);
//let client = mqtt.connect("mqtt://mqtt:1883", options);

const strangs = db.strang;

async function safeImport(modulePath) {
  try {
    // Attempt to dynamically import the module
    const module = await import(modulePath);
    console.log(`✅ Successfully imported: ${modulePath}`);
    return module;
  } catch (err) {
    if (
      err.code === "ERR_MODULE_NOT_FOUND" ||
      err.message.includes("Cannot find module")
    ) {
      console.warn(`⚠️ Module not found: ${modulePath}`);
      return null; // Return null if module doesn't exist
    }
    // Re-throw unexpected errors
    throw err;
  }
}

export const maxTIME = 20000;

export async function moveStrang(strang, stepSize, res) {
  console.log("strang ", JSON.stringify(strang));
  if (stepSize === null) stepSize = maxTIME;
  if (strang.state !== strangState.enabled) {
    if (res) {
      const OK = {
        success: true,
        message: "Not enabled",
      };
      res.status(200).json(OK);
    }
    return;
  }

  await goToStrangPosPythonPinCtrl(strang, stepSize, res);
}

export async function stopStrang(strang) {
  setPythonAllPinsLow([strang.pin1, strang.pin2]);

  const result = Date.parse(strang.updatedAt);
  let sinceUpdate = Date.now() - result;
  console.log("break time ", sinceUpdate);

  if (strang.state === strangState.movingDown) {
    strang.currentPos += sinceUpdate;
  } else {
    if (strang.state === strangState.movingUp) {
      strang.currentPos -= sinceUpdate;
    } else return;
  }
  strang.state = strangState.enabled;

  await strang.save();
  return strang.currentPos;
}

export async function goToStrangPosPinCtrl(strang, down, stepTime) {
  console.log(
    "goToStrangPosPinCtrl strang id ",
    strang.id,
    " down ",
    down,
    " stepTime ",
    stepTime,
  );

  try {
    console.log("set pio hiw");
    /*
    if (down) strang.currentPos += stepTime;
    else {
      strang.currentPos -= stepTime;
      if (strang.currentPos < 0) strang.currentPos = 0;
    }*/
    strang.state =
      down === true ? strangState.movingDown : strangState.movingUp;
    console.log("setting strang.state  ", strang.state);
    await strang.save();

    if (down) {
      setPin(strang.pin1, true);
      setPin(strang.pin2, false);
    } else {
      setPin(strang.pin1, false);
      setPin(strang.pin2, true);
    }

    console.log("start timer ");
    setTimeout(
      (pin1 = strang.pin1, pin2 = strang.pin2, strangID = strang.id) => {
        const nowItIs = Date.now();
        set2PinLow(pin1, pin2);

        strangs
          .findOne({
            where: { id: strangID },
          })
          .then((foundStrang) => {
            const result = Date.parse(strang.updatedAt);
            let sinceUpdate = nowItIs - result;
            console.log("foundStrang.state  ", foundStrang.state);
            if (foundStrang.state === strangState.movingDown) {
              //console.log("was set to move down  ");
              foundStrang.currentPos = foundStrang.currentPos + sinceUpdate;
            } else {
              if (foundStrang.state === strangState.movingUp) {
                //console.log("was set to move up  ");
                foundStrang.currentPos = foundStrang.currentPos - sinceUpdate;
                if (foundStrang.currentPos < 0) foundStrang.currentPos = 0;
              } else return;
            }
            foundStrang.state = strangState.enabled;
            //console.log("foundStrang  ", JSON.stringify(foundStrang));
            foundStrang.save();
            console.log("strang updated... yeah msec ", sinceUpdate);
          });
      },
      stepTime,
    );
  } catch (err) {
    console.log("Using fallback behavior...", err);
    //strang.currentPos = valveState === ValveState.open ? 10000 : 0;
    //strang.save();
  }
}

export async function goToStrangPosPythonPinCtrl(strang, stepTime, res) {
  console.log(
    "goToStrangPosPinCtrl strang id ",
    strang.id,
    " stepTime ",
    stepTime,
  );

  try {
    console.log("set pio hiw");
    /*
    if (down) strang.currentPos += stepTime;
    else {
      strang.currentPos -= stepTime;
      if (strang.currentPos < 0) strang.currentPos = 0;
    }*/
    strang.state = stepTime > 0 ? strangState.movingDown : strangState.movingUp;
    console.log("setting strang.state  ", strang.state);
    await strang.save();

    if (stepTime < 0) {
      setPythonPinHigh(strang.pin1, -stepTime);
    } else {
      setPythonPinHigh(strang.pin2, stepTime);
    }

    console.log("start timer ");
    setTimeout(async (strangID = strang.id) => {
      const nowItIs = Date.now();
      const foundStrang = await strangs.findOne({
        where: { id: strangID },
      });
      if (foundStrang) {
        const result = Date.parse(strang.updatedAt);
        let sinceUpdate = nowItIs - result;
        console.log("foundStrang.state  ", foundStrang.state);
        if (foundStrang.state === strangState.movingDown) {
          //console.log("was set to move down  ");
          foundStrang.currentPos = foundStrang.currentPos + stepTime;
        } else {
          if (foundStrang.state === strangState.movingUp) {
            //console.log("was set to move up  ");
            foundStrang.currentPos = foundStrang.currentPos + stepTime;
            if (foundStrang.currentPos < 0) foundStrang.currentPos = 0;
          } else return;
        }
        foundStrang.state = strangState.enabled;
        //console.log("foundStrang  ", JSON.stringify(foundStrang));
        await foundStrang.save();
        console.log("strang updated... yeah msec ", sinceUpdate);
      }
    }, Math.abs(stepTime));

    const OK = {
      success: true,
    };
    if (res) res.status(200).json(OK);
    return;
  } catch (err) {
    console.log("Using fallback behavior...", err);
    //strang.currentPos = valveState === ValveState.open ? 10000 : 0;
    //strang.save();
  }
}

const set2PinLow = (pin1, pin2) => {
  setPythonPinLow(pin1);
  setPythonPinLow(pin2);
  //set2PinLowDocker(pin1, pin2);
};

const setPythonPinHigh = (pin, delay) => {
  const cmd = "./app/pinctrl/runpinctrl.set.high.py";

  if (existsSync(cmd)) {
    const pythonCmd = "python3" + cmd + " " + pin + " " + delay;
    console.log("exec cmd ", pythonCmd);
    execFile("python3", [cmd, pin, delay], (error, stdout, stderr) => {
      if (error) {
        console.log(`stdout: ${stdout}`);
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      if (stderr) console.error(`stderr: ${stderr}`);
    });
  } else {
    console.log(`can't find : ${cmd}`);
  }
};

const setPythonPinLow = (pin) => {
  const cmd = "./app/pinctrl/runpinctrl.set.low.py";

  if (existsSync(cmd)) {
    const pythonCmd = "python3" + cmd + " " + pin;
    console.log("exec cmd ", pythonCmd);
    execFile("python3", [cmd, pin], (error, stdout, stderr) => {
      if (error) {
        console.log(`stdout: ${stdout}`);
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      if (stderr) console.error(`stderr: ${stderr}`);
    });
  } else {
    console.log(`can't find : ${cmd}`);
  }
};

const setPythonAllPinsLow = (pin) => {
  const cmd = "./app/pinctrl/runpinctrl.all.low.py";

  if (existsSync(cmd)) {
    const arg = [cmd, ...pin];
    execFile("python3", arg, (error, stdout, stderr) => {
      if (error) {
        console.log(`stdout: ${stdout}`);
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      if (stderr) console.error(`stderr: ${stderr}`);
    });
  } else {
    console.log(`can't find : ${cmd}`);
  }
};

export async function moveZero(strang, res) {
  const timeStep = strang.currentPos;
  if (timeStep === 0) return;

  await goToStrangPosPythonPinCtrl(strang, -timeStep, res);

  //goToStrangPosPinMqtt(strang, timeStep < 0, Math.abs(timeStep));
}

export async function moveMax(strang, res) {
  const timeStep = strang.currentPos - strang.maxPos;
  if (timeStep === 0) return;
  console.log(
    "move Max strang.currentPos =",
    strang.currentPos,
    "  strang.maxPos =",
    strang.maxPos,
    " timeStep ",
    timeStep,
  );
  await goToStrangPosPythonPinCtrl(
    req,
    res,
    strang,
    timeStep < 0,
    Math.abs(timeStep),
  );
  //goToStrangPosPinMqtt(strang, timeStep < 0, Math.abs(timeStep));
}

export async function goToStrangPosPinMqtt(strang, down, stepTime) {
  console.log(
    "goToStrangPosPinMqtt strang id ",
    strang.id,
    " down ",
    down,
    " stepTime ",
    stepTime,
  );

  try {
    strang.state =
      down === true ? strangState.movingDown : strangState.movingUp;
    console.log("setting strang.state  ", strang.state);
    await strang.save();

    if (down) {
      setPinMqtt(strang.pin1, stepTime);
    } else {
      setPinMqtt(strang.pin2, stepTime);
    }

    setTimeout((strangID = strang.id, time = stepTime) => {
      const nowItIs = Date.now();
      strangs
        .findOne({
          where: { id: strangID },
        })
        .then((foundStrang) => {
          const result = Date.parse(strang.updatedAt);
          let sinceUpdate = nowItIs - result;
          console.log(
            "foundStrang.state  ",
            foundStrang.state,
            " sinceUpdate ",
            sinceUpdate,
          );
          if (foundStrang.state === strangState.movingDown) {
            //console.log("was set to move down  ");
            foundStrang.currentPos =
              Number(foundStrang.currentPos) + Number(time);
          } else {
            if (foundStrang.state === strangState.movingUp) {
              //console.log("was set to move up  ");
              foundStrang.currentPos =
                Number(foundStrang.currentPos) - Number(time);
              if (foundStrang.currentPos < 0) foundStrang.currentPos = 0;
            } else return;
          }
          foundStrang.state = strangState.enabled;
          //console.log("foundStrang  ", JSON.stringify(foundStrang));
          foundStrang.save();
          console.log("strang updated... yeah msec ", sinceUpdate);
        });
    }, stepTime);
  } catch (err) {
    console.log("Using fallback behavior...", err);
    //strang.currentPos = valveState === ValveState.open ? 10000 : 0;
    //strang.save();
  }
}

const setPinMqtt = (pin, time) => {
  mqttClient.publish("pinctrl", pin + " h " + time);
};

export const setAllPinsLow = async () => {
  await db.sequelize
    .query("select distinct pin1, pin2 from Strangs", {
      type: QueryTypes.SELECT,
    })
    .then(async (foundPins) => {
      console.log("found pins: ", JSON.stringify(foundPins));
      const pinGIOs = [];
      for (let i = 0; i < foundPins.length; i++) {
        console.log("found pin: ", JSON.stringify(foundPins[i]));
        pinGIOs.push(String(foundPins[i].pin1));
        pinGIOs.push(String(foundPins[i].pin2));
      }
      setPythonAllPinsLow(pinGIOs);
    });
};
