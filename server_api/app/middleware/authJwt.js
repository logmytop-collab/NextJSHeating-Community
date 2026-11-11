import jwt from "jsonwebtoken";
import { SignJWT, jwtVerify } from "jose";
import mysecret from "../config/auth.config.js";
import db from "../models/index.js";
//import cookies from "cookies";

import { loadEnvFile } from "node:process";
loadEnvFile("./.env");

const secretKey = process.env.JWT_SECRET;
const refreshSecretKey = process.env.JWT_REFRESH_SECRET;
const key = new TextEncoder().encode(secretKey);
const refreshKey = new TextEncoder().encode(refreshSecretKey);

// Verify Access Token
export async function verifyAccessToken(token) {
  try {
    const verified = await jwtVerify(token, key);
    return verified.payload;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.error("Error on verifying key secretKey ", secretKey);
    console.error("Error on verifying key token ", token);
    console.error("Error on verifying key key ", key);
    console.error("Error on verifying key ", error);
    return null;
  }
}

export async function getCurrentUser(req) {
  //console.log("waiting for cookieStore ");
  //const signedCookieStore = await req.cookie("accessToken");
  //console.log("cookieStore ", signedCookieStore);
  //const cookieStore = await req.cookies;
  const rawCookieHeader = req.headers.cookie; // e.g., "name=John; age=30"

  // Basic manual parsing example
  const cookies = {};
  if (rawCookieHeader) {
    rawCookieHeader.split(";").forEach((cookie) => {
      const [key, val] = cookie.trim().split("=");
      cookies[key] = val;
    });
  }

  console.log("cookie Token ", cookies);
  const token = cookies["accessToken"];
  const refreshToken = cookies["refreshToken"];

  return await verifyAccessToken(token);
}

export async function verifyToken(req, res, next) {
  //let token = req.headers["x-access-token"];
  const login = req.query.login;
  const check = req.query.check;
  const insert = req.query.insert;
  const register = req.query.register;
  const logout = req.query.logout;
  if (logout !== undefined) {
  }
  const id = req.query.id;
  console.log(
    "Verify token imsert ? ",
    insert,
    " check ? ",
    check,
    " login ? ",
    login,
  );
  const CheckOrInsert =
    check != null || insert != null || register != null || login != null;
  const authorization = req.headers.authorization;
  //const user = getCurrentUser(req);
  try {
    console.log("try to get user ...");
    const user = await getCurrentUser(req);
    if (user) {
      req.userId = user.userId;
      next();
      return;
    }
  } catch (error) {}
  console.log("authorization CheckOrInsert", authorization, " ", CheckOrInsert);
  if (!authorization) {
    if (
      login !== undefined ||
      insert !== undefined ||
      register !== undefined ||
      logout !== undefined
    ) {
      next();
      return;
    }
    return res.status(403).send({
      message: "No token provided!",
    });
    return;
  }
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }

  jwt.verify(token, mysecret.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }
    req.userId = decoded.id;
    next();
  });
}

export function isAdmin(req, res, next) {
  User.findByPk(req.userId).then((user) => {
    user.getRoles().then((roles) => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "admin") {
          next();
          return;
        }
      }

      res.status(403).send({
        message: "Require Admin Role!",
      });
      return;
    });
  });
}

export function isModerator(req, res, next) {
  User.findByPk(req.userId).then((user) => {
    user.getRoles().then((roles) => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "moderator") {
          next();
          return;
        }
      }

      res.status(403).send({
        message: "Require Moderator Role!",
      });
    });
  });
}

export function isModeratorOrAdmin(req, res, next) {
  User.findByPk(req.userId).then((user) => {
    user.getRoles().then((roles) => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "moderator") {
          next();
          return;
        }

        if (roles[i].name === "admin") {
          next();
          return;
        }
      }

      res.status(403).send({
        message: "Require Moderator or Admin Role!",
      });
    });
  });
}
