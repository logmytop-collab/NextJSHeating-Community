import { Router } from "express";

import { OAuth2Client } from "google-auth-library";

import crypto from "crypto";

let router = Router();

function makeState() {
  const payload = {
    nonce: crypto.randomBytes(16).toString("hex"),
    iat: Date.now(),
  };

  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");

  const sig = crypto
    .createHmac("sha256", STATE_SECRET)
    .update(encoded)
    .digest("base64url");

  return `${encoded}.${sig}`;
}

function validateState(state) {
  const [encoded, sig] = state.split(".");

  const expectedSig = crypto
    .createHmac("sha256", STATE_SECRET)
    .update(encoded)
    .digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
    return false;
  }

  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString());

  const FIVE_MINUTES = 5 * 60 * 1000;
  if (Date.now() - payload.iat > FIVE_MINUTES) {
    return false;
  }

  return true;
}
