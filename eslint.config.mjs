import nextPlugin from "eslint-config-next";

const eslintConfig = [
  {
    ignores: [".next/*", "node_modules/*", "out/*", ".next/**/*"],
  },
  ...nextPlugin,
];

export default eslintConfig;
