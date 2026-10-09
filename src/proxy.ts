import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/overview",
  "/live",
  "/complaints",
  "/incidents",
  "/settings",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Placeholder: replace this with a proper Supabase session check.
  const hasSessionCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes("auth-token"));

  if (!hasSessionCookie) {
    const loginUrl = new URL("/auth", request.url);

    loginUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/overview/:path*",
    "/live/:path*",
    "/complaints/:path*",
    "/incidents/:path*",
    "/settings/:path*",
  ],
};
