// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   console.log("Middleware Checking Cookies:", request.cookies.get("authState")?.value);

//   const authCookie = request.cookies.get("authState")?.value;
//   if (!authCookie) {
//     console.error("Middleware: No authentication cookie found, redirecting to login.");
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   try {
//     const authState = JSON.parse(authCookie);
//     if (!authState?.userType) {
//       console.error("Middleware: Invalid userType detected!", authState);
//       return NextResponse.redirect(new URL("/login", request.url));
//     }

//     const response = NextResponse.next();
//     response.headers.set("show-sidebar", "true"); // ✅ Ensure sidebar visibility is controlled
//     return response;
//   } catch (error) {
//     console.error("Middleware: Error parsing authentication state", error);
//     return NextResponse.redirect(new URL("/login", request.url));
//   }
// }

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   const authCookie = request.cookies.get("authState")?.value;

//   if (!authCookie) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   try {
//     const authState = JSON.parse(authCookie);
//     if (!authState?.userType) {
//       return NextResponse.redirect(new URL("/login", request.url));
//     }

//     const response = NextResponse.next();
//     response.headers.set("show-sidebar", "true");
//     return response;
//   } catch (error) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }
// }

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Public routes that don't require auth
  const publicPaths = ["/login", "/api/auth", "/_next", "/favicon.ico"];
  if (publicPaths.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  // Check auth cookie
  const authCookie = request.cookies.get("authState")?.value;

  if (!authCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const authState = JSON.parse(authCookie);
    if (!authState?.userType) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Valid auth - add headers if needed
    const response = NextResponse.next();
    response.headers.set("show-sidebar", "true");
    return response;
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};