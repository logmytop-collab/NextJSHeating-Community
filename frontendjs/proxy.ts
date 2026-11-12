import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "./app/api/lib/auth";
import { cookies } from "next/headers";

export async function proxy(request: NextRequest) {
  let token = request.cookies.get("accessToken")?.value;
  if (token === undefined) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    console.log("second cookies ", accessToken);
    token = accessToken;
  }

  // Protected routes
  const protectedPaths = ["/dashboard", "/room", "/changepwd", "/settings"];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  // Public routes that should redirect if authenticated
  const publicPaths = ["/privacy", "/info", "/index"];
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );
  if (isPublicPath) {
    console.log("Yeah public request");
    return NextResponse.next();
  }
  const authPaths = ["/login", "/register"];
  const isAuthPath = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (isProtectedPath) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const user = await verifyAccessToken(token);
    if (!user) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      return response;
    }
  }

  if (isAuthPath && token) {
    const user = await verifyAccessToken(token);
    if (user) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/changepwd/:path*",
    "/login",
    "/register",
  ],
};
