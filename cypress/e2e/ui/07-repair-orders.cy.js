describe('M07 – Repair Order Management / UI', () => {
  beforeEach(() => {
    cy.mockGarage(); cy.openGarage();
    cy.goTo('customers'); cy.get('#customer-table').should('contain', 'Nguyễn An');
    cy.goTo('repair-orders'); cy.get('#order-table').should('contain', '81A-12345');
  });
  it('RO-01: hiển thị danh sách phiếu sửa', () => {
    cy.get('#order-table').should('contain', 'PS0501').and('contain', 'Hoàn thành');
  });
  it('RO-02: xem chi tiết phiếu sửa', () => {
    cy.get('#order-table tr').contains('PS0501').click();
    cy.get('#modal-order-detail').should('have.class', 'open');
    cy.get('#order-detail-body').should('contain', 'Thay dầu').and('contain', 'Lọc dầu');
  });
  it('RO-03: tạo phiếu sửa chữa mới', () => {
    cy.contains('#page-repair-orders button', 'Tạo phiếu mới').click();
    cy.get('#ro-customer-id').select('10');
    cy.get('#ro-vehicle-id').should('contain', '81A-12345').select('20');
    cy.get('#ro-condition').type('Xe khó khởi động');
    cy.contains('#modal-repair-order button', 'Tạo phiếu').click();
    cy.get('#modal-order-detail').should('have.class', 'open');
    cy.get('#order-detail-body').should('contain', 'Xe khó khởi động');
  });
  it('RO-04: lọc theo trạng thái hoàn thành', () => {
    cy.get('#order-status-filter').select('hoan_thanh');
    cy.get('#order-table').should('contain', 'PS0501').and('not.contain', 'PS0502');
  });
});
