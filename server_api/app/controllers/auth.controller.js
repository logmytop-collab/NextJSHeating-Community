import db from "../models/index.js";
import mysecret from "../config/auth.config.js";
import { SignJWT, jwtVerify } from "jose";

const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

import jwt from "jsonwebtoken";
//const jwt = require("jsonwebtoken");
//import { createRequire } from "module";
//const require = createRequire(import.meta.url);
//const sign = require("jsonwebtoken");

import { hashSync, compareSync } from "bcryptjs";

const secretKey = process.env.JWT_SECRET
  ? process.env.JWT_SECRET
  : "your-super-secret-jwt-key-change-this-in-production";
const refreshSecretKey = process.env.JWT_REFRESH_SECRET
  ? process.env.JWT_REFRESH_SECRET
  : "your-super-secret-refresh-key-change-this";
const key = new TextEncoder().encode(secretKey);
const refreshKey = new TextEncoder().encode(refreshSecretKey);

export function signup(req, res) {
  // Save User to Database
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: hashSync(req.body.password, 8),
  })
    .then((user) => {
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles,
            },
          },
        }).then((roles) => {
          user.setRoles(roles).then(() => {
            res.send({ message: "User was registered successfully!" });
          });
        });
      } else {
        // user role = 1
        user.setRoles([1]).then(() => {
          res.send({ message: "User was registered successfully!" });
        });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
}

function makeState() {
  const now = Date.now();
  const payload = {
    nonce: crypto.randomBytes(16).toString("hex"),
    iat: now,
  };

  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");

  const sig = crypto
    .createHmac("sha256", GOOGLE_STATE_SECRET)
    .update(encoded)
    .digest("base64url");

  const ret = `${encoded}.${sig}`;
  return ret;
}

function validateState(state) {
  const [encoded, sig] = state.split(".");

  const expectedSig = crypto
    .createHmac("sha256", GOOGLE_STATE_SECRET)
    .update(encoded)
    .digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
    return false;
  }

  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString());

  const FIVE_MINUTES = 5 * 60 * 1000;
  const now = Date.now();
  if (now - payload.iat > FIVE_MINUTES) {
    return false;
  }

  return true;
}

export async function generateAccessToken(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload,
) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(key);
}

// Generate Refresh Token

export async function generateRefreshToken(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload,
) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(refreshKey);
}
export async function setExpressAuthCookies(
  accessToken,
  refreshToken,
  req,
  res,
) {
  //  const cookieStore = await req.cookies;

  console.log("accessToken ", accessToken);
  console.log("process.env.NODE_ENV ", process.env.NODE_ENV);
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Allow specific HTTP methods
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");

  // Allow specific headers to be sent in the request
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Allow credentials (e.g., cookies, authentication) to be included in requests
  res.setHeader("Access-Control-Allow-Credentials", true);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    //secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15 * 100000, // 15 minutes
    path: "/",
    //domain: "localhost"
    domain: process.env.NODE_ENV === "production" ? req.hostname : "localhost",
  }); // Cookie expires in 1 hour (3600000 milliseconds)

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    //secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15 * 100000, // 15 minutes
    path: "/",
    domain: process.env.NODE_ENV === "production" ? req.hostname : "localhost",
    //domain: "localhost"
  });
}

export async function signin(req, res) {
  console.log("sign in req body = ", JSON.stringify(req.body));

  try {
    const user = await User.findOne({
      where: {
        username: req.body.username,
      },
    });

    if (!user) {
      return res.status(404).send({ message: "Access denied " });
    }

    var passwordIsValid = compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Access denied",
      });
    }

    const payload = {
      userId: user.id,
      username: user.username,
    };
    const accessToken = await generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(payload);

    await setExpressAuthCookies(accessToken, refreshToken, req, res);

    console.log("token attached = ");

    var authorities = [];
    user.getRoles().then((roles) => {
      for (let i = 0; i < roles.length; i++) {
        authorities.push("ROLE_" + roles[i].name.toUpperCase());
      }
      const OK = {
        success: true,
        message: "Login successful",
        OK: "OK",
        roles: authorities,
      };
      res.status(200).json(OK);
    });
  } catch (err) {
    var fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
    console.error("Exception on " + fullUrl + " happen error: ", err);
    res.status(500).send({ message: err.message });
  }
}
