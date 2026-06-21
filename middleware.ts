import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Protect the farm admin; skip Next internals and static assets.
  matcher: ["/farm/:path*"],
};
