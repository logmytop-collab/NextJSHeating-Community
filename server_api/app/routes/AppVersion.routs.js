import { verifyToken } from "./../middleware/authJwt.js";

import db from "../models/index.js";
import { Sequelize, Op, literal } from "sequelize";

async function handelGetAction(req, res) {
  const myIOS = req.query.myIOS;
  const myAndroid = req.query.myAndroid;
  const minIOS = req.query.minIOS;
  const Android = req.query.Android;
  const minAndroid = req.query.minAndroid;
  res.set("Content-Type", "application/json");
  const Parameter = db.parameter;
  const IOS = req.query.IOS;
  if (IOS) {
    Parameter.create(
      {
        name: "Version",
        subgroup: "IOS",
        value: myIOS,
      },
      {
        updateOnDuplicate: ["value"], // Columns to update if duplicate
      },
    );
  } else {
    if (Android) {
      Parameter.create(
        {
          name: "Version",
          subgroup: "Android",
          value: Android,
        },
        {
          updateOnDuplicate: ["value"], // Columns to update if duplicate
        },
      );
    } else {
      if (minIOS) {
        Parameter.create(
          {
            name: "Version",
            subgroup: "minIOS",
            value: minIOS,
          },
          {
            updateOnDuplicate: ["value"], // Columns to update if duplicate
          },
        );
      } else {
        if (minAndroid) {
          Parameter.create(
            {
              name: "Version",
              subgroup: "minAndroid",
              value: minAndroid,
            },
            {
              updateOnDuplicate: ["value"], // Columns to update if duplicate
            },
          );
        }
      }
    }
  }
  if ((myIOS && myIOS.length > 0) || (myAndroid && myAndroid.length > 0)) {
    const hisVersion =
      myIOS && myIOS.length > 0
        ? Number(myIOS).valueOf()
        : Number(myAndroid).valueOf();
    const subGroup = myIOS && myIOS.length > 0 ? "IOS" : "Android";
    const param = await Parameter.findOne({
      where: { name: "Version", subgroup: subGroup },
      attributes: ["value"],
    });

    if (param) {
      const versiom = Number(param.value).valueOf();
      if (versiom < hisVersion) {
        Parameter.create(
          {
            name: "Version",
            subgroup: subGroup,
            value: String(hisVersion),
          },
          {
            updateOnDuplicate: ["value"], // Columns to update if duplicate
          },
        );
      }
    }
  }
  const params = await Parameter.findAll({ where: { name: "Version" } });
  const OK = { OK: "OK" };
  for (const param of params) {
    if (param.subgroup === "IOS") {
      OK.IOS = param.value;
    } else if (param.subgroup === "Android") {
      OK.Android = param.value;
    } else if (param.subgroup === "minIOS") {
      OK.minIOS = param.value;
    } else if (param.subgroup === "minAndroid") {
      OK.minAndroid = param.value;
    }
  }
  var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  OK.myIP = ip;
  res.status(200).json(OK);
}

export default function versionRoutes(app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept",
    );
    next();
  });

  //  app.get("/gipfelbuch/getAppVersion", [verifyToken], handelGetAction);
  app.get("/gipfelbuch/getAppVersion", handelGetAction);

  // app.get("/gipfelbuch/GipfelStuermer", [verifyToken], handelCheck);
}
