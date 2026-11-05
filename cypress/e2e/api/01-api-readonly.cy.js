// Explicit opt-in even for GET requests; never targets the known production host.
const enabled = Cypress.env('runApiReads') === 'YES_TEST_BACKEND';

(enabled ? describe : describe.skip)('API – Authentication, danh sách 11 module (test backend)', () => {
  it('API-AUTH-01: login thiếu dữ liệu trả về 400', () => {
    cy.apiTestRequest('POST', '/api/auth/login', {}, false)
      .its('status').should('eq', 400);
  });

  it('API-AUTH-02: API yêu cầu JWT', () => {
    Cypress.env('garageApiToken', null);
    cy.apiTestRequest('GET', '/api/customers', undefined, false)
      .its('status').should('eq', 401);
  });

  context('Đăng nhập admin vào backend test', () => {
    before(() => cy.apiTestLogin());
    const endpoints = [
      ['M02 Dashboard', '/api/reports/dashboard', 'object'],
      ['M03 Customers', '/api/customers', 'array'],
      ['M04 Vehicles', '/api/vehicles', 'array'],
      ['M05 Services', '/api/services', 'array'],
      ['M06 Parts', '/api/parts', 'array'],
      ['M07 Repair orders', '/api/repair-orders', 'array'],
      ['M08 Appointments', '/api/appointments', 'array'],
      ['M09 Invoices qua repair orders đã thanh toán', '/api/repair-orders?status=da_thanh_toan', 'array'],
      ['M10 Reports revenue by month', '/api/reports/revenue?period=month&year=2026', 'array'],
      ['M10 Top services', '/api/reports/services', 'array'],
      ['M11 Staff', '/api/users', 'array'],
    ];
    endpoints.forEach(([title, path, kind]) => {
      it(`API-READ: ${title}`, () => {
        cy.apiTestRequest('GET', path).then(({ status, body }) => {
          expect(status).to.equal(200);
          if (kind === 'array') expect(body).to.be.an('array');
          else expect(body).to.be.an('object');
        });
      });
    });
  });
});
