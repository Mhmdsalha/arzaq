import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/schemas/auth.schema";
import { findUserByIdentifier, validatePassword } from "@/services/auth.service";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "البريد أو الجوال", type: "text" },
        password: { label: "كلمة المرور", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await findUserByIdentifier(parsed.data.identifier);

        if (!user || user.isBanned) {
          return null;
        }

        const isValidPassword = await validatePassword(parsed.data.password, user.passwordHash);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          accountType: user.accountType,
          isVerified: user.isVerified,
        };
      },
    }),
  ],
});
