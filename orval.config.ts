import { defineConfig } from "orval";

export default defineConfig({
  onAdmin: {
    input: {
      // target: "https://dev-on-backend.true-bar.si/v3/api-docs",
      target: "http://localhost:8080/v3/api-docs",
      validation: false,
    },
    output: {
      target: "./src/api/def/index.ts",
      schemas: "src/api/def/model",
      mode: "tags-split",
      client: "react-query",
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
