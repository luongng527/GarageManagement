describe('M04 – Vehicle Management / UI', () => {
  beforeEach(() => {
    cy.mockGarage(); cy.openGarage();
    cy.goTo('customers'); cy.get('#customer-table').should('contain', 'Nguyễn An');
    cy.goTo('vehicles'); cy.get('#vehicle-table').should('contain', '81A-12345');
  });
  it('VEH-01: tìm kiếm xe bằng biển số', () => {
    cy.get('#vehicle-search').type('81A-12345');
    cy.get('#vehicle-table').should('contain', 'Toyota');
  });
  it('VEH-02: thêm xe hợp lệ', () => {
    cy.contains('#page-vehicles button', 'Thêm xe').click();
    cy.get('#vehicle-customer-id').select('10');
    cy.get('#vehicle-plate').type('81B-99999');
    cy.get('#vehicle-brand').type('Honda');
    cy.get('#vehicle-model').type('Civic');
    cy.contains('#modal-vehicle button', 'Lưu').click();
    cy.get('#vehicle-table').should('contain', '81B-99999');
  });
  it('VEH-03: thiếu biển số không cho lưu', () => {
    cy.contains('#page-vehicles button', 'Thêm xe').click();
    cy.get('#vehicle-brand').type('Honda');
    cy.get('#vehicle-model').type('Civic');
    cy.contains('#modal-vehicle button', 'Lưu').click();
    cy.get('#toast-container').should('contain', 'Thiếu thông tin');
  });
});
