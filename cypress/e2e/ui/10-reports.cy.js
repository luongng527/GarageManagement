describe('M10 – Reports / UI', () => {
  beforeEach(() => { cy.mockGarage(); cy.openGarage(); cy.goTo('reports'); });
  it('REP-01: hiển thị thống kê doanh thu và dịch vụ', () => {
    cy.get('#report-summary-cards').should('contain', 'Tổng doanh thu');
    cy.get('#report-revenue-table').find('tr').should('have.length.greaterThan', 0);
    cy.get('#report-services-list').should('contain', 'Thay dầu');
  });
  it('REP-02: đổi cách nhóm doanh thu', () => {
    cy.get('#report-period').select('year');
    cy.contains('#page-reports button', 'Tải').click();
    cy.get('#report-chart-title').should('contain', 'theo năm');
  });
});
