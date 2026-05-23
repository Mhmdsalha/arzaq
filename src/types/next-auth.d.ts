import type { AccountType, UserRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: UserRole;
    accountType: AccountType;
    isVerified: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      accountType: AccountType;
      isVerified: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    accountType?: AccountType;
    isVerified?: boolean;
  }
}
