describe('M11 – Staff Management / UI', () => {
  beforeEach(() => { cy.mockGarage(); cy.openGarage(); cy.goTo('staff'); cy.get('#staff-table').should('contain', 'Staff Test'); });
  it('STAFF-01: hiển thị nhân viên và phân quyền', () => {
    cy.get('#staff-table').should('contain', 'Quản lý').and('contain', 'Lễ tân');
  });
  it('STAFF-02: thêm nhân viên hợp lệ', () => {
    cy.contains('#page-staff button', 'Thêm nhân viên').click();
    cy.get('#staff-name').type('Nhân viên Demo');
    cy.get('#staff-username').type('demo_staff_001');
    cy.get('#staff-password').type('TestPass123!');
    cy.get('#staff-role').select('nhan_vien_ky_thuat');
    cy.contains('#modal-staff button', 'Lưu').click();
    cy.get('#staff-table').should('contain', 'Nhân viên Demo').and('contain', 'Kỹ thuật');
  });
  it('STAFF-03: bắt buộc nhập mật khẩu khi tạo nhân viên', () => {
    cy.contains('#page-staff button', 'Thêm nhân viên').click();
    cy.get('#staff-name').type('Nhân viên Thiếu Mật Khẩu');
    cy.get('#staff-username').type('demo_staff_002');
    cy.contains('#modal-staff button', 'Lưu').click();
    cy.get('#toast-container').should('contain', 'Mật khẩu là bắt buộc');
  });
});
