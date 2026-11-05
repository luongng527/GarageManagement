describe('M09 – Invoice Management / UI', () => {
  beforeEach(() => { cy.mockGarage(); cy.openGarage(); });
  it('INV-01: hiển thị lịch sử hóa đơn đã thanh toán', () => {
    cy.goTo('invoices');
    cy.get('#invoice-table').should('contain', 'HĐ0800').and('contain', '150.000');
  });
  it('INV-02: mở chi tiết hóa đơn', () => {
    cy.goTo('invoices');
    cy.get('#invoice-table').should('contain', 'HĐ0800');
    cy.get('#invoice-table tr').contains('HĐ0800').click();
    cy.get('#modal-invoice-detail').should('have.class', 'open');
    cy.get('#inv-detail-body').should('contain', 'Thay dầu');
  });
  it('INV-03: tính tiền và tạo hóa đơn cho phiếu hoàn thành', () => {
    cy.goTo('repair-orders');
    cy.get('#order-table').should('contain', 'PS0501');
    cy.get('#order-table tr').contains('PS0501').closest('tr').contains('button', 'HĐ').click();
    cy.get('#modal-invoice').should('have.class', 'open');
    cy.get('#inv-grand-total').should('contain', '310.000');
    cy.get('#inv-discount').clear().type('10000').blur();
    cy.get('#inv-grand-total').should('contain', '300.000');
    cy.contains('#modal-invoice button', 'Xuất hóa đơn').click();
    cy.goTo('invoices');
    cy.get('#invoice-table').should('contain', '300.000');
  });
});
