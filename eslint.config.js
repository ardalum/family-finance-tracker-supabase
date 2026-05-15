const browserGlobals = {
  console: "readonly",
  crypto: "readonly",
  document: "readonly",
  FileReader: "readonly",
  localStorage: "readonly",
  navigator: "readonly",
  window: "readonly",
};

const nodeGlobals = {
  Buffer: "readonly",
  process: "readonly",
};

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "*.config.js",
      "postcss.config.js",
      "tailwind.config.js",
    ],
  },
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...browserGlobals,
        ...nodeGlobals,
      },
    },
    rules: {},
  },
];
