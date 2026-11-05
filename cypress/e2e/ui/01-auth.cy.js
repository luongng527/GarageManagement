describe('M01 – Authentication / UI', () => {
  beforeEach(() => { cy.mockGarage(); cy.openGarage('loggedOut'); });

  it('AUTH-01: đăng nhập hợp lệ', () => {
    cy.get('#login-username').type('admin_test');
    cy.get('#login-password').type('demo123');
    cy.get('#login-btn').click();
    cy.get('#app').should('have.class', 'visible');
    cy.get('#user-display-name').should('contain', 'Admin Test');
    cy.window().its('localStorage').invoke('getItem', 'autocare_token').should('equal', 'fake-jwt-for-ui-only');
  });

  it('AUTH-02: sai mật khẩu hiển thị lỗi, không vào hệ thống', () => {
    cy.get('#login-username').type('admin_test');
    cy.get('#login-password').type('sai_mat_khau');
    cy.get('#login-btn').click();
    cy.get('#login-error').should('have.class', 'show').and('contain', 'Sai tên đăng nhập');
    cy.get('#app').should('not.have.class', 'visible');
  });

  it('AUTH-03: thiếu username hoặc password', () => {
    cy.get('#login-btn').click();
    cy.get('#login-error').should('contain', 'Vui lòng nhập đầy đủ');
  });

  it('AUTH-04: đăng xuất xóa phiên', () => {
    cy.get('#login-username').type('admin_test');
    cy.get('#login-password').type('demo123');
    cy.get('#login-btn').click();
    cy.get('#logout-btn').click();
    cy.get('#login-page').should('be.visible');
    cy.window().its('localStorage').invoke('getItem', 'autocare_token').should('be.null');
  });

  it('AUTH-05: giao diện nhân viên ẩn các chức năng quản trị', () => {
    cy.get('#login-username').type('staff_test');
    cy.get('#login-password').type('demo123');
    cy.get('#login-btn').click();
    cy.get('[data-page="reports"]').should('not.be.visible');
    cy.get('[data-page="staff"]').should('not.be.visible');
  });
});
