import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { JWTPayload } from "./types";
const secretKey = process.env.JWT_SECRET!;
const refreshSecretKey = process.env.JWT_REFRESH_SECRET!;
const key = new TextEncoder().encode(secretKey);
const refreshKey = new TextEncoder().encode(refreshSecretKey);

// Generate Access Token
export async function generateAccessToken(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any,
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(key);
}

// Generate Refresh Token
export async function generateRefreshToken(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any,
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(refreshKey);
}

// Verify Access Token
export async function verifyAccessToken(
  token: string,
): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, key);
    return verified.payload as unknown as JWTPayload;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null;
  }
}

// Verify Refresh Token
export async function verifyRefreshToken(
  token: string,
): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, refreshKey);
    return verified.payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Get token from cookies
export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken");
  return token?.value || null;
}

// Get token from request headers
export function getTokenFromHeaders(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}

// Get current user from token
export async function getCurrentUser(
  request: NextRequest,
): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  //console.log("cookieStore ", cookieStore);
  const cookieToken = cookieStore.get("accessToken")?.value;
  console.log("cookie Token ", cookieToken);
  const token = cookieToken || getTokenFromHeaders(request);

  if (!token) return null;

  return await verifyAccessToken(token);
}

// Set auth cookies
export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
) {
  const cookieStore = await cookies();

  console.log("accessToken ", accessToken);
  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    domain:
      process.env.NODE_ENV === "production" ? "markus-server.eu" : "localhost",
    maxAge: 60 * 15, // 15 minutes
    path: "/",
  });

  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    domain:
      process.env.NODE_ENV === "production" ? "markus-server.eu" : "localhost",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

// Clear auth cookies
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
}
