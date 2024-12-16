import { defineConfig } from "orval";

export default defineConfig({
  lobby: {
    input: "https://rso-2.janvasiljevic.com/api/lobby/public/v3/api-docs",
    output: {
      target: "./src/api/lobby/index.ts",
      schemas: "src/api/lobby/models",
      mode: "tags-split",
      client: "react-query",
      baseUrl: "/api/lobby",
      override: {
        mutator: {
          path: "./src/api/mutator/custom-instance.ts",
          name: "customInstance",
        },
      },
    },
    hooks: {
      afterAllFilesWrite: "prettier --write",
    },
  },
  users: {
    input: "https://rso-2.janvasiljevic.com/api/auth/public/v3/api-docs",
    output: {
      target: "./src/api/users/index.ts",
      schemas: "src/api/users/models",
      mode: "tags-split",
      client: "react-query",
      baseUrl: "/api/auth",
      override: {
        mutator: {
          path: "./src/api/mutator/custom-instance.ts",
          name: "customInstance",
        },
      },
    },
    hooks: {
      afterAllFilesWrite: "prettier --write",
    },
  },
});
