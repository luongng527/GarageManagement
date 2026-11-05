describe('M03 – Customer Management / UI', () => {
  beforeEach(() => { cy.mockGarage(); cy.openGarage(); cy.goTo('customers'); cy.get('#customer-table').should('contain', 'Nguyễn An'); });

  it('CUS-01: hiển thị và tìm kiếm khách hàng', () => {
    cy.get('#customer-table').should('contain', 'Trần Bình');
    cy.get('#customer-search').type('0901111111');
    cy.get('#customer-table').should('contain', 'Nguyễn An').and('not.contain', 'Trần Bình');
  });
  it('CUS-02: không thêm khách hàng thiếu tên', () => {
    cy.contains('#page-customers button', 'Thêm khách hàng').click();
    cy.get('#customer-phone').type('0906666666');
    cy.contains('#modal-customer button', 'Lưu').click();
    cy.get('#modal-customer').should('have.class', 'open');
    cy.get('#toast-container').should('contain', 'bắt buộc');
  });
  it('CUS-03: thêm khách hàng hợp lệ', () => {
    cy.contains('#page-customers button', 'Thêm khách hàng').click();
    cy.get('#customer-name').type('Khách Test Mới');
    cy.get('#customer-phone').type('0908888888');
    cy.get('#customer-address').type('Gia Lai');
    cy.contains('#modal-customer button', 'Lưu').click();
    cy.get('#modal-customer').should('not.have.class', 'open');
    cy.get('#customer-table').should('contain', 'Khách Test Mới');
  });
  it('CUS-04: sửa thông tin khách hàng', () => {
    cy.get('#customer-table tr').contains('Nguyễn An').closest('tr').find('button[title="Sửa"]').click();
    cy.get('#customer-name').should('have.value', 'Nguyễn An').clear().type('Nguyễn An Mới');
    cy.contains('#modal-customer button', 'Lưu').click();
    cy.get('#customer-table').should('contain', 'Nguyễn An Mới');
  });
  it('CUS-05: xóa khách hàng có xác nhận', () => {
    cy.on('window:confirm', () => true);
    cy.get('#customer-table tr').contains('Trần Bình').closest('tr').find('button[title="Xóa"]').click();
    cy.get('#customer-table').should('not.contain', 'Trần Bình');
  });
});
