export default {
    transform: {
      "^.+\\.[jt]sx?$": "babel-jest", // Ensures Babel is used for transformations
    },
    moduleNameMapper: {
      "^axios$": "<rootDir>/__mocks__/axios.js", // Mock axios properly
      "^react-router-dom$": "<rootDir>/node_modules/react-router-dom",
    },
    transformIgnorePatterns: [
      "/node_modules/(?!axios)", // Transforms axios from ESM to CommonJS
    ],
  };
  