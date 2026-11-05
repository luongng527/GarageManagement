// This in-browser fake API has isolated data per test. NO requests reach the real backend.
Cypress.Commands.add('mockGarage', () => {
  cy.fixture('garage').then((fixture) => {
    const db = JSON.parse(JSON.stringify(fixture));
    let nextId = 2000;
    const makeId = () => nextId++;
    const time = '2026-11-04T09:00:00.000Z';
    const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization, content-type', 'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS' };
    const ok = (req, body, statusCode = 200) => req.reply({ statusCode, headers: cors, body });
    const bad = (req, error, statusCode = 400) => ok(req, { error }, statusCode);
    const read = (req, data) => ok(req, data);
    const item = (name, id) => db[name].find((x) => String(x.id) === String(id));
    const index = (name, id) => db[name].findIndex((x) => String(x.id) === String(id));
    const enrichVehicle = (v) => {
      const c = item('customers', v.customer_id) || {};
      return { ...v, customer_name: c.name || '', customer_phone: c.phone || '' };
    };
    const enrichOrder = (o) => {
      const c = item('customers', o.customer_id) || {};
      const v = item('vehicles', o.vehicle_id) || {};
      return { ...o, customer_name: c.name || o.customer_name || '', customer_phone: c.phone || o.customer_phone || '', plate: v.plate || o.plate || '', brand: v.brand || o.brand || '', model: v.model || o.model || '', services: o.services || [], parts: o.parts || [], invoice: o.invoice || null };
    };
    const recalc = (o) => { o.total_amount = [...o.services, ...o.parts].reduce((sum, x) => sum + Number(x.price_at_time) * Number(x.qty), 0); };

    cy.intercept({ url: '**/api/**' }, (req) => {
      const url = new URL(req.url);
      const p = url.pathname.split('/').filter(Boolean);
      if (p[0] !== 'api') return bad(req, 'Route không tồn tại', 404);
      const [resource, id, action, subId] = p.slice(1);
      const m = req.method;
      if (m === 'OPTIONS') return req.reply({ statusCode: 204, headers: cors, body: '' });
      let body = {};

      if (req.body) {
        if (typeof req.body === 'string') {
          try {
            body = JSON.parse(req.body);
          } catch {
            body = {};
          }
        } else {
          body = req.body;
        }
      }

      if (resource === 'auth' && id === 'login' && m === 'POST') {
        if (!body.username || !body.password) return bad(req, 'Thiếu thông tin', 400);
        if (body.password !== 'demo123' || !['admin_test', 'staff_test'].includes(body.username)) return bad(req, 'Sai tên đăng nhập hoặc mật khẩu', 401);
        return ok(req, { token: 'fake-jwt-for-ui-only', user: body.username === 'admin_test' ? db.admin : db.staffUser });
      }
      if (resource === 'reports' && m === 'GET') {
        if (id === 'dashboard') return read(req, {
          totalCustomers: db.customers.length,
          totalVehicles: db.vehicles.length,
          ordersToday: 1,
          revenueToday: 150000,
          revenueMonth: 150000,
          lowStockParts: db.parts.filter((x) => x.stock_qty <= x.min_stock).length,
          pendingOrders: db.repairOrders.filter((x) => ['tiep_nhan', 'dang_sua'].includes(x.status)).length,
          pendingAppointments: db.appointments.filter((x) => x.status === 'cho_xac_nhan').length,
        });
        if (id === 'revenue') return read(req, url.searchParams.get('period') === 'day' ? [{ label: '04/11', revenue: 150000, count: 1 }] : db.revenue);
        if (id === 'services') return read(req, db.topServices);
      }
      if (resource === 'repair-orders') {
        if (!id && m === 'GET') {
          let rows = db.repairOrders.map(enrichOrder);
          const status = url.searchParams.get('status');
          const search = (url.searchParams.get('search') || '').toLowerCase();
          if (status) rows = rows.filter((x) => x.status === status);
          if (search) rows = rows.filter((x) => `${x.plate} ${x.customer_name}`.toLowerCase().includes(search));
          return read(req, rows);
        }
        if (!id && m === 'POST') {
          if (!body.customer_id || !body.vehicle_id) return bad(req, 'Thiếu thông tin');
          const o = { id: makeId(), ...body, status: 'tiep_nhan', total_amount: 0, created_at: time, services: [], parts: [], invoice: null };
          db.repairOrders.unshift(o);
          return ok(req, { id: o.id, message: 'Tạo phiếu sửa thành công' });
        }
        const o = item('repairOrders', id);
        if (!o) return bad(req, 'Không tìm thấy', 404);
        if (!action && m === 'GET') return read(req, enrichOrder(o));
        if (action === 'status' && m === 'PUT') { o.status = body.status; return ok(req, { message: 'Đã cập nhật trạng thái' }); }
        if (['services', 'parts'].includes(action)) {
          const list = action;
          if (m === 'POST') {
            const src = item(action === 'services' ? 'services' : 'parts', action === 'services' ? body.service_id : body.part_id);
            if (!src) return bad(req, 'Không tìm thấy', 404);
            const qty = Number(body.qty || 1);
            if (action === 'parts' && src.stock_qty < qty) return bad(req, 'Không đủ tồn kho', 400);
            if (action === 'parts') src.stock_qty -= qty;
            o[list].push({ id: makeId(), [action === 'services' ? 'service_id' : 'part_id']: src.id, [action === 'services' ? 'service_name' : 'part_name']: src.name, unit: src.unit, price_at_time: src.price, qty });
            recalc(o);
            return ok(req, { message: 'Đã thêm' });
          }
          if (m === 'DELETE') {
            const i = o[list].findIndex((x) => String(x.id) === String(subId));
            if (i < 0) return bad(req, 'Không tìm thấy', 404);
            const removed = o[list].splice(i, 1)[0];
            if (action === 'parts') item('parts', removed.part_id).stock_qty += Number(removed.qty);
            recalc(o);
            return ok(req, { message: 'Đã xóa' });
          }
        }
      }
      if (resource === 'invoices') {
        if (!id && m === 'POST') {
          const o = item('repairOrders', body.repair_order_id);
          if (!o || o.invoice) return bad(req, 'Không thể tạo hóa đơn', 400);
          const service_total = o.services.reduce((s, x) => s + x.qty * x.price_at_time, 0);
          const parts_total = o.parts.reduce((s, x) => s + x.qty * x.price_at_time, 0);
          const discount = Number(body.discount || 0);
          const total = service_total + parts_total - discount;
          o.invoice = { id: makeId(), repair_order_id: o.id, service_total, parts_total, discount, total, payment_method: body.payment_method, paid_at: time };
          o.status = 'da_thanh_toan';
          return ok(req, { id: o.invoice.id, total, message: 'Tạo hóa đơn thành công' });
        }
        if (id && m === 'GET') {
          const o = db.repairOrders.find((x) => x.invoice && String(x.invoice.id) === String(id));
          if (!o) return bad(req, 'Không tìm thấy', 404);
          return read(req, { ...o.invoice, ...enrichOrder(o), id: o.invoice.id, order_id: o.id, services: o.services.map((x) => ({ name: x.service_name, qty: x.qty, price_at_time: x.price_at_time })), parts: o.parts.map((x) => ({ name: x.part_name, unit: x.unit, qty: x.qty, price_at_time: x.price_at_time })) });
        }
      }
      if (resource === 'appointments') {
        if (!id && m === 'GET') {
          const rows = db.appointments.filter((a) => !url.searchParams.get('status') || a.status === url.searchParams.get('status'))
            .map((a) => { const c = item('customers', a.customer_id) || {}; const v = item('vehicles', a.vehicle_id) || {}; return { ...a, customer_name: c.name || a.customer_name, customer_phone: c.phone || a.customer_phone, plate: v.plate || a.plate }; });
          return read(req, rows);
        }
        if (!id && m === 'POST') {
          if (!body.customer_id || !body.scheduled_at) return bad(req, 'Thiếu thông tin');
          const a = { id: makeId(), ...body, status: 'cho_xac_nhan' }; db.appointments.push(a);
          return ok(req, { id: a.id, message: 'Tạo lịch hẹn thành công' });
        }
        const a = item('appointments', id);
        if (a && m === 'PUT' && action === 'confirm') { a.status = 'da_xac_nhan'; return ok(req, { message: 'Đã xác nhận' }); }
        if (a && m === 'PUT' && action === 'status') { a.status = body.status; return ok(req, { message: 'Đã cập nhật' }); }
      }
      const map = { customers: 'customers', vehicles: 'vehicles', services: 'services', parts: 'parts', users: 'users' };
      const name = map[resource];
      if (name) {
        if (!id && m === 'GET') {
          let rows = [...db[name]];
          const search = (url.searchParams.get('search') || '').toLowerCase();
          if (search) rows = rows.filter((x) => JSON.stringify(x).toLowerCase().includes(search));
          if (resource === 'vehicles' && url.searchParams.has('customer_id')) rows = rows.filter((x) => String(x.customer_id) === url.searchParams.get('customer_id'));
          if (resource === 'vehicles') rows = rows.map(enrichVehicle);
          return read(req, rows);
        }
        if (id && m === 'GET') {
          const x = item(name, id);
          return x ? read(req, x) : bad(req, 'Không tìm thấy', 404);
        }
        if (!id && m === 'POST') {
          if ((resource === 'customers' && (!body.name || !body.phone)) || (resource === 'vehicles' && (!body.plate || !body.brand || !body.model || !body.customer_id))) return bad(req, 'Thiếu thông tin');
          const x = { id: makeId(), ...body, created_at: time };
          if (resource === 'vehicles') x.plate = x.plate.toUpperCase();
          if (resource === 'customers') x.vehicle_count = 0;
          db[name].unshift(x);
          return ok(req, { id: x.id, message: 'Thêm thành công' });
        }
        if (id && m === 'PUT') {
          const x = item(name, id);
          if (!x) return bad(req, 'Không tìm thấy', 404);
          Object.assign(x, body);
          return ok(req, { message: 'Đã cập nhật' });
        }
        if (id && m === 'DELETE') {
          const i = index(name, id);
          if (i < 0) return bad(req, 'Không tìm thấy', 404);
          db[name].splice(i, 1);
          return ok(req, { message: 'Đã xóa' });
        }
        if (resource === 'parts' && id && action === 'restock' && m === 'POST') {
          const part = item('parts', id);
          if (!part || !body.qty || Number(body.qty) <= 0) return bad(req, 'Số lượng không hợp lệ');
          part.stock_qty += Number(body.qty);
          return ok(req, { message: `Đã nhập thêm ${body.qty} vào kho` });
        }
      }
      return bad(req, `Không có API mock cho ${m} ${url.pathname}`, 404);
    }).as('mockGarageApi');
  });
});

Cypress.Commands.add('openGarage', (role = 'admin') => {
  cy.fixture('garage').then((data) => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.clear();
        if (role !== 'loggedOut') {
          win.localStorage.setItem('autocare_token', 'fake-jwt-for-ui-only');
          win.localStorage.setItem('autocare_user', JSON.stringify(role === 'staff' ? data.staffUser : data.admin));
        }
      },
    });
    if (role !== 'loggedOut') cy.get('#app').should('have.class', 'visible');
    else cy.get('#login-page').should('be.visible');
  });
});

Cypress.Commands.add('goTo', (page) => {
  cy.get(`.nav-item[data-page="${page}"]`).click();
  cy.get(`#page-${page}`).should('have.class', 'active');
});
