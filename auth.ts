import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        if (!bcrypt.compareSync(password, user.passwordHash)) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // Refresh the session from the DB so name/email/role always reflect the
    // current record (and a deleted user loses access) — not whatever was in
    // the token at sign-in. Runs only in Node (server), never in middleware.
    async session({ session, token }) {
      if (!token.sub) return session;
      const dbUser = await prisma.user.findUnique({ where: { id: token.sub } });
      if (!dbUser) {
        // Token points at a user that no longer exists — drop the identity.
        return { expires: session.expires } as typeof session;
      }
      if (session.user) {
        session.user.id = dbUser.id;
        session.user.name = dbUser.name;
        session.user.email = dbUser.email;
        session.user.role = dbUser.role;
      }
      return session;
    },
  },
});
