describe('M05 – Service Management / UI', () => {
  beforeEach(() => { cy.mockGarage(); cy.openGarage(); cy.goTo('services'); cy.get('#service-table').should('contain', 'Thay dầu'); });
  it('SVC-01: hiển thị danh sách dịch vụ và giá', () => {
    cy.get('#service-table').should('contain', 'Thay dầu').and('contain', '150.000');
  });
  it('SVC-02: thêm dịch vụ hợp lệ', () => {
    cy.get('#add-service-btn').click();
    cy.get('#service-name').type('Kiểm tra ắc quy');
    cy.get('#service-price').type('200000');
    cy.contains('#modal-service button', 'Lưu').click();
    cy.get('#service-table').should('contain', 'Kiểm tra ắc quy');
  });
  it('SVC-03: không lưu dịch vụ thiếu tên', () => {
    cy.get('#add-service-btn').click();
    cy.get('#service-price').type('200000');
    cy.contains('#modal-service button', 'Lưu').click();
    cy.get('#toast-container').should('contain', 'Thiếu thông tin');
  });
});
