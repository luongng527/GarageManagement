describe('M08 – Appointment Management / UI', () => {
  beforeEach(() => {
    cy.mockGarage(); cy.openGarage();
    cy.goTo('customers'); cy.get('#customer-table').should('contain', 'Nguyễn An');
    cy.goTo('appointments'); cy.get('#appt-table').should('contain', 'Kiểm tra phanh');
  });
  it('APPT-01: hiển thị lịch đang chờ xác nhận', () => {
    cy.get('#appt-table').should('contain', 'Chờ xác nhận');
  });
  it('APPT-02: xác nhận lịch hẹn', () => {
    cy.get('#appt-table tr').contains('Kiểm tra phanh').closest('tr').contains('button', 'Xác nhận').click();
    cy.get('#appt-table').should('contain', 'Đã xác nhận');
  });
  it('APPT-03: tạo lịch hẹn hợp lệ', () => {
    cy.contains('#page-appointments button', 'Tạo lịch hẹn').click();
    cy.get('#appt-customer-id').select('10');
    cy.get('#appt-datetime').type('2026-12-20T09:30');
    cy.get('#appt-note').type('Thay lọc gió');
    cy.contains('#modal-appointment button', 'Tạo lịch').click();
    cy.get('#appt-table').should('contain', 'Thay lọc gió');
  });
  it('APPT-04: từ chối tạo lịch chưa chọn ngày giờ', () => {
    cy.contains('#page-appointments button', 'Tạo lịch hẹn').click();
    cy.contains('#modal-appointment button', 'Tạo lịch').click();
    cy.get('#toast-container').should('contain', 'Vui lòng chọn đủ thông tin');
  });
});
