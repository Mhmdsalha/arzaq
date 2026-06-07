import { env } from "@/lib/env";

export function getAdminBasePath() {
  const secretPath = env.ADMIN_SECRET_PATH?.trim();

  return secretPath ? `/control-${secretPath}` : "/admin";
}

export function getAdminHref(path = "") {
  const basePath = getAdminBasePath();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (normalizedPath === "/") {
    return basePath;
  }

  return `${basePath}${normalizedPath}`;
}
