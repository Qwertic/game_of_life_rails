module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/app/javascript/"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleFileExtensions: ["js", "jsx"],
  setupFilesAfterEnv: [],
};
