/*
 * DONT CHANGE THE FILE NAME, IT MUST STAY NAMED "projectEnvVariables.ts"
 * This file is used to replace the environment variables at runtime,
 * enabling to build the project once and deploy it to multiple environments.
 *
 * This is also the only file where you can use the import.meta.env object.
 */

type WithoutIndexSignature<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
    ? never
    : K]: T[K];
};

type CustomEnv = Omit<
  WithoutIndexSignature<ImportMetaEnv>,
  `DEV` | `PROD` | `BASE_URL` | `MODE` | `SSR`
>;

// Environment Variable Template to Be Replaced at Runtime
// These must be in the format of ENV_VARIABLE_NAME: "${VITE_ENV_VARIABLE_NAME}"!!!
const projectEnvVariables: CustomEnv = {
  VITE_KC_AUTHORITY: "${VITE_KC_AUTHORITY}",
  VITE_KC_CLIENT_ID: "${VITE_KC_CLIENT_ID}",
  VITE_BACKEND_API: "${VITE_BACKEND_API}",
};

const getProjectEnvVariables = (): CustomEnv => {
  const envKeys = Object.keys(projectEnvVariables) as Array<keyof CustomEnv>;
  const env: Partial<{
    -readonly [K in keyof CustomEnv]: CustomEnv[K];
  }> = {};

  envKeys.forEach((key) => {
    const value = projectEnvVariables[key];
    env[key] = value.includes("VITE_") ? import.meta.env[key] : value;
  });

  return env as CustomEnv;
};

export const ENV = getProjectEnvVariables();
