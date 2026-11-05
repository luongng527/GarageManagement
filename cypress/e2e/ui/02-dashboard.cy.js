describe('M02 – Dashboard / UI', () => {
  beforeEach(() => { cy.mockGarage(); cy.openGarage(); });
  it('DASH-01: hiển thị KPI từ API', () => {
    cy.get('#dash-stats').children().should('have.length.greaterThan', 0);
    cy.get('#dash-recent-orders').should('contain', '81A-12345');
    cy.get('#dash-upcoming-appts').should('contain', 'Nguyễn An');
  });
  it('DASH-02: chuyển trang từ Dashboard sang Khách hàng', () => {
    cy.goTo('customers');
    cy.get('#customer-table').should('contain', 'Nguyễn An');
  });
});
