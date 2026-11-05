const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // UI tests use a locally served copy of frontend/index.html.
    baseUrl: process.env.CYPRESS_baseUrl || 'http://127.0.0.1:5500',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    testIsolation: true,
    defaultCommandTimeout: 8000,
    requestTimeout: 10000,
    responseTimeout: 20000,
  },
  viewportWidth: 1440,
  viewportHeight: 900,
  video: false,
  screenshotOnRunFailure: true,
  retries: { runMode: 0, openMode: 0 },
  env: {
    // API integration is opted-in deliberately to avoid modifying production data.
    apiUrl: process.env.CYPRESS_apiUrl || 'http://127.0.0.1:3000',
    allowApiWrites: process.env.CYPRESS_allowApiWrites || '',
    testDbConfirmed: process.env.CYPRESS_testDbConfirmed || '',
    adminUsername: process.env.CYPRESS_adminUsername || '',
    adminPassword: process.env.CYPRESS_adminPassword || '',
  },
});
