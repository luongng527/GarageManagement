// Separate optional regression suite: these assertions can FAIL on current server.js
// until the defects are fixed. Not part of the default test:api run command.
const enabled = Cypress.env('runKnownDefects') === 'YES_TEST_BACKEND';

(enabled ? describe : describe.skip)('API – Known regressions / expected business rules', () => {
  before(() => cy.apiTestLogin());
  it('REG-01: báo cáo tháng 2 phải trả về HTTP 200', () => {
    cy.apiTestRequest('GET', '/api/reports/revenue?period=day&month=2024-02', undefined, false)
      .its('status').should('eq', 200);
  });
});
