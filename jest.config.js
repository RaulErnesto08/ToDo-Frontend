module.exports = {
    transform: {
        '^.+\\.ts?$': 'ts-jest',
        "^.+\\.(js|jsx)$": "babel-jest"
      },
    transformIgnorePatterns: [
      "/node_modules/(?!axios).+\\.js$"
    ],
    moduleFileExtensions: ["js", "jsx"],
    testEnvironment: "jsdom"
  };