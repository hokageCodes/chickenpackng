import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config (no bcrypt / Prisma here).
 * Used by middleware for route protection and shared by the full config in auth.ts.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/farm/login" },
  providers: [], // real providers added in auth.ts (Node runtime)
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const onFarm = nextUrl.pathname.startsWith("/farm");
      const onLogin = nextUrl.pathname === "/farm/login";
      if (onFarm && !onLogin) return !!auth?.user;
      return true;
    },
    jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.sub) session.user.id = token.sub;
        if (token.role) {
          (session.user as { role?: string }).role = token.role as string;
        }
      }
      return session;
    },
  },
};
