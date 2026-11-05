// Real live UI smoke (read-only) — never creates, updates or deletes records.
// Optional. Set CYPRESS_liveUi=YES and use your intended test account.
const enabled = Cypress.env('liveUi') === 'YES';

(enabled ? describe : describe.skip)('LIVE – Smoke on running website (read-only)', () => {
  beforeEach(() => {
    const username = Cypress.env('adminUsername');
    const password = Cypress.env('adminPassword');
    if (!username || !password) throw new Error('Thiếu CYPRESS_adminUsername hoặc CYPRESS_adminPassword');
    cy.visit('/', { onBeforeLoad: (win) => win.localStorage.clear() });
    cy.intercept('POST', '**/api/auth/login').as('loginLive');
    cy.get('#login-username').type(username);
    cy.get('#login-password').type(password, { log: false });
    cy.get('#login-btn').click();
    cy.wait('@loginLive').its('response.statusCode').should('eq', 200);
    cy.get('#app').should('have.class', 'visible');
  });

  it('LIVE-01: đăng nhập thực và tải Dashboard', () => {
    cy.get('#dash-stats .stat-card').should('have.length', 6);
  });

  it('LIVE-02: mở 10 phân hệ dưới tài khoản quản lý', () => {
    [
      'customers', 'vehicles', 'services', 'parts', 'repair-orders',
      'appointments', 'invoices', 'reports', 'staff', 'dashboard',
    ].forEach((page) => {
      cy.goTo(page);
      cy.get(`#page-${page}`).should('be.visible');
    });
  });
});
