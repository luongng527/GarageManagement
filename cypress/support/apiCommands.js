const PRODUCTION_BACKEND = 'garagemanagement-wip3.onrender.com';

Cypress.Commands.add('apiTestRequest', (method, path, body, failOnStatusCode = true) => {
  const apiUrl = String(Cypress.env('apiUrl') || '').replace(/\/$/, '');
  const token = Cypress.env('garageApiToken');
  if (!apiUrl) throw new Error('Thiếu CYPRESS_apiUrl');
  const hostname = new URL(apiUrl).hostname;
  if (hostname === PRODUCTION_BACKEND) {
    throw new Error('Chặn API production đã biết. Hãy dùng backend và database TEST riêng.');
  }
  const isLocal = ['localhost', '127.0.0.1', '::1'].includes(hostname);
  if (!isLocal && Cypress.env('allowRemoteTestBackend') !== 'YES_STAGING') {
    throw new Error('Mặc định chỉ cho phép localhost. Với backend STAGING riêng, đặt CYPRESS_allowRemoteTestBackend=YES_STAGING.');
  }
  return cy.request({
    method,
    url: `${apiUrl}${path}`,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
    failOnStatusCode,
    log: method === 'POST' && path === '/api/auth/login' ? false : true,
  });
});

Cypress.Commands.add('apiTestLogin', () => {
  const username = Cypress.env('adminUsername');
  const password = Cypress.env('adminPassword');
  if (!username || !password) throw new Error('Thiếu CYPRESS_adminUsername hoặc CYPRESS_adminPassword');
  Cypress.env('garageApiToken', null);
  cy.apiTestRequest('POST', '/api/auth/login', { username, password }).then(({ body }) => {
    expect(body.token).to.be.a('string').and.not.be.empty;
    Cypress.env('garageApiToken', body.token);
  });
});
