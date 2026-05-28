import type { Profile, User } from "@prisma/client";

export function safeUser<TUser extends User>(user: TUser) {
  const { passwordHash, ...safe } = user;
  void passwordHash;

  return safe;
}

export function safeUserPublic(
  user: Pick<User, "id" | "name" | "accountType" | "isVerified" | "createdAt"> & {
    profile: Pick<
      Profile,
      "bio" | "region" | "avatarUrl" | "avgRating" | "totalReviews" | "isTrusted"
    > | null;
  },
) {
  return {
    id: user.id,
    name: user.name,
    accountType: user.accountType,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    profile: user.profile
      ? {
          bio: user.profile.bio,
          region: user.profile.region,
          avatarUrl: user.profile.avatarUrl,
          avgRating: user.profile.avgRating,
          totalReviews: user.profile.totalReviews,
          isTrusted: user.profile.isTrusted,
        }
      : null,
  };
}
