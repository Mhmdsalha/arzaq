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
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.accountType = user.accountType;
        token.isVerified = user.isVerified;
      }

      if (trigger === "update" && session) {
        const updatedSession = session as {
          accountType?: "CLIENT" | "PROVIDER";
          role?: "USER" | "ADMIN";
          isVerified?: boolean;
          user?: {
            accountType?: "CLIENT" | "PROVIDER";
            role?: "USER" | "ADMIN";
            isVerified?: boolean;
          };
        };

        if (updatedSession.user?.accountType ?? updatedSession.accountType) {
          token.accountType = updatedSession.user?.accountType ?? updatedSession.accountType;
        }

        if (updatedSession.user?.role ?? updatedSession.role) {
          token.role = updatedSession.user?.role ?? updatedSession.role;
        }

        if (
          typeof updatedSession.user?.isVerified === "boolean" ||
          typeof updatedSession.isVerified === "boolean"
        ) {
          token.isVerified = updatedSession.user?.isVerified ?? updatedSession.isVerified;
        }
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
