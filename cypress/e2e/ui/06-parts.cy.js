describe('M06 – Parts Management / UI', () => {
  beforeEach(() => { cy.mockGarage(); cy.openGarage(); cy.goTo('parts'); cy.get('#part-table').should('contain', 'Lọc dầu'); });
  it('PART-01: hiển thị cảnh báo sắp hết hàng', () => {
    cy.get('#part-table tr').contains('Lọc dầu').closest('tr').should('contain', 'Sắp hết');
  });
  it('PART-02: lọc các phụ tùng sắp hết', () => {
    cy.contains('#page-parts button', 'Sắp hết hàng').click();
    cy.get('#part-table').should('contain', 'Lọc dầu').and('not.contain', 'Dầu nhớt');
  });
  it('PART-03: nhập kho tăng tồn kho', () => {
    cy.get('#part-table tr').contains('Lọc dầu').closest('tr').contains('button', 'Nhập').click();
    cy.get('#restock-qty').type('10');
    cy.get('#modal-restock').contains('button', 'Nhập kho').click();
    cy.get('#part-table tr').contains('Lọc dầu').closest('tr').should('contain', '12');
  });
  it('PART-04: thêm phụ tùng hợp lệ', () => {
    cy.get('#add-part-btn').click();
    cy.get('#part-name').type('Má phanh Test');
    cy.get('#part-price').type('350000');
    cy.get('#part-stock').type('15');
    cy.contains('#modal-part button', 'Lưu').click();
    cy.get('#part-table').should('contain', 'Má phanh Test');
  });
});
