/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  reporters: [
    ["jest-html-reporter", {
      "pageTitle": "Colman Assignments Coverage Report",
      "expand": true,
      "outputPath": "./coverage.html",
    }]
  ]
};
