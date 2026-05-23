import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.accountType = user.accountType;
        token.isVerified = user.isVerified;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role === "ADMIN" ? "ADMIN" : "USER";
        session.user.accountType = token.accountType === "PROVIDER" ? "PROVIDER" : "CLIENT";
        session.user.isVerified = token.isVerified === true;
      }

      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
