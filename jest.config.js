export const transform = {
  '^.+\\.ts?$': 'ts-jest',
  "^.+\\.(js|jsx)$": "babel-jest"
};
export const transformIgnorePatterns = [
  "/node_modules/(?!axios).+\\.js$"
];
export const moduleFileExtensions = ["js", "jsx"];
export const testEnvironment = "jsdom";
export const setTimeout = 10000;