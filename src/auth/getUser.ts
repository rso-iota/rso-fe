import { ENV } from "@/shared/projectEnvVariables";
import { User } from "oidc-client-ts";

export function getUser() {
  const oidcStorage = sessionStorage.getItem(
    `oidc.user:${ENV.VITE_KC_AUTHORITY}:${ENV.VITE_KC_CLIENT_ID}`
  );
  if (!oidcStorage) return null;

  return User.fromStorageString(oidcStorage);
}
