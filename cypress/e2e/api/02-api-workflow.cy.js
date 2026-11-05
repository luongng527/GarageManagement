// Writes REAL records. Enabled only after explicit two-key confirmation.
const enabled = Cypress.env('allowApiWrites') === 'YES_TEST_DB' &&
  Cypress.env('testDbConfirmed') === 'YES';

(enabled ? describe : describe.skip)('API – Full workflow + validation (isolated TEST database)', () => {
  before(() => cy.apiTestLogin());

  it('FLOW-01: customer → vehicle → service/parts → order → invoice → reports', () => {
    // Uses unique values, but it intentionally leaves data in TEST DB:
    // repair orders and invoices have no DELETE endpoint.
    const unique = `${Date.now()}_${Cypress._.random(1000, 9999)}`;
    const t = {};
    const post = (p, b, fail = true) => cy.apiTestRequest('POST', p, b, fail);
    const put = (p, b) => cy.apiTestRequest('PUT', p, b);
    const get = (p) => cy.apiTestRequest('GET', p);

    // M03 – customer create/search/update
    post('/api/customers', { name: `Cypress ${unique}`, phone: '0909000000', address: 'Test only' })
      .then(({ body }) => { t.customerId = body.id; expect(t.customerId).to.be.a('number'); });
    cy.then(() => get(`/api/customers?search=${encodeURIComponent(unique)}`))
      .its('body').should('be.an', 'array').and('have.length.greaterThan', 0);
    cy.then(() => put(`/api/customers/${t.customerId}`, { name: `Cypress edited ${unique}`, phone: '0909000000', address: 'Test only' }))
      .its('status').should('eq', 200);

    // M04 – vehicle creation + unique plate validation
    cy.then(() => post('/api/vehicles', { customer_id: t.customerId, plate: `CY${unique}`, brand: 'Toyota', model: 'Vios', year: 2022 }))
      .then(({ body }) => { t.vehicleId = body.id; expect(t.vehicleId).to.be.a('number'); });
    cy.then(() => post('/api/vehicles', { customer_id: t.customerId, plate: `CY${unique}`, brand: 'Toyota', model: 'Vios' }, false))
      .its('status').should('eq', 400);

    // M05 & M06 – service + part + stock increase
    post('/api/services', { name: `Service ${unique}`, price: 150000, duration_min: 30 })
      .then(({ body }) => { t.serviceId = body.id; });
    post('/api/parts', { name: `Part ${unique}`, price: 80000, stock_qty: 10, min_stock: 2, unit: 'cái' })
      .then(({ body }) => { t.partId = body.id; });
    cy.then(() => post(`/api/parts/${t.partId}/restock`, { qty: 5 }))
      .its('status').should('eq', 200);
    cy.then(() => post(`/api/parts/${t.partId}/restock`, { qty: 0 }, false))
      .its('status').should('eq', 400);
    cy.then(() => get('/api/parts')).then(({ body }) => {
      expect(Number(body.find((p) => p.id === t.partId).stock_qty)).to.eq(15);
    });

    // M07 – order + details + parts/service accounting
    cy.then(() => post('/api/repair-orders', { customer_id: t.customerId, vehicle_id: t.vehicleId, initial_condition: 'Cypress test' }))
      .then(({ body }) => { t.orderId = body.id; });
    cy.then(() => post(`/api/repair-orders/${t.orderId}/services`, { service_id: t.serviceId, qty: 2 }))
      .its('status').should('eq', 200);
    cy.then(() => post(`/api/repair-orders/${t.orderId}/parts`, { part_id: t.partId, qty: 3 }))
      .its('status').should('eq', 200);
    cy.then(() => get(`/api/repair-orders/${t.orderId}`)).then(({ body }) => {
      expect(Number(body.total_amount)).to.eq(540000); // 2*150000 + 3*80000
      expect(body.services).to.have.length(1);
      expect(body.parts).to.have.length(1);
    });
    cy.then(() => get('/api/parts')).then(({ body }) => {
      expect(Number(body.find((p) => p.id === t.partId).stock_qty)).to.eq(12);
    });
    cy.then(() => put(`/api/repair-orders/${t.orderId}/status`, { status: 'hoan_thanh' }))
      .its('status').should('eq', 200);

    // M09 – invoice total and duplicate prevention
    cy.then(() => post('/api/invoices', { repair_order_id: t.orderId, discount: 40000, payment_method: 'tien_mat' }))
      .then(({ body }) => { t.invoiceId = body.id; expect(Number(body.total)).to.eq(500000); });
    cy.then(() => get(`/api/invoices/${t.invoiceId}`)).then(({ body }) => {
      expect(Number(body.service_total)).to.eq(300000);
      expect(Number(body.parts_total)).to.eq(240000);
      expect(Number(body.total)).to.eq(500000);
    });
    cy.then(() => post('/api/invoices', { repair_order_id: t.orderId, discount: 0 }, false))
      .its('status').should('be.gte', 400);

    // M08 – appointment confirmation
    cy.then(() => post('/api/appointments', { customer_id: t.customerId, vehicle_id: t.vehicleId, scheduled_at: '2027-01-20T09:00:00.000Z' }))
      .then(({ body }) => { t.apptId = body.id; });
    cy.then(() => put(`/api/appointments/${t.apptId}/confirm`, {}))
      .its('status').should('eq', 200);
    cy.then(() => get('/api/appointments?status=da_xac_nhan')).then(({ body }) => {
      expect(body.some((a) => a.id === t.apptId)).to.eq(true);
    });

    // M02, M10 – dashboard/reports
    cy.then(() => get('/api/reports/dashboard')).then(({ body }) => {
      expect(body.totalCustomers).to.be.a('number');
      expect(body.totalVehicles).to.be.a('number');
    });
    cy.then(() => get('/api/reports/revenue?period=month&year=2026'))
      .its('status').should('eq', 200);
    cy.then(() => get('/api/reports/services')).its('body').should('be.an', 'array');
  });

  it('STAFF-API-01: thêm/sửa/xóa nhân viên; không xóa chính mình', () => {
    const unique = `${Date.now()}_${Cypress._.random(1000, 9999)}`;
    let userId;
    cy.apiTestRequest('POST', '/api/users', { username: `cy_staff_${unique}`, password: 'SafeTest123!', full_name: 'Cypress Staff', role: 'nhan_vien_le_tan' })
      .then(({ body }) => { userId = body.id; expect(userId).to.be.a('number'); });
    cy.then(() => cy.apiTestRequest('PUT', `/api/users/${userId}`, { full_name: 'Cypress Staff Edited', role: 'nhan_vien_ky_thuat', phone: '' }))
      .its('status').should('eq', 200);
    cy.then(() => cy.apiTestRequest('GET', '/api/users')).then(({ body }) => {
      expect(body.find((u) => u.id === userId).role).to.eq('nhan_vien_ky_thuat');
    });
    cy.then(() => cy.apiTestRequest('DELETE', `/api/users/${userId}`)).its('status').should('eq', 200);
  });
});
