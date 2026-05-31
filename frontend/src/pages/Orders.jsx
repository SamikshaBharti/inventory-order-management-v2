import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [form, setForm] = useState({ customer_id: '', product_id: '', quantity: '1' });
  const [message, setMessage] = useState({ text: '', type: '' });

  const loadAll = () => {
    Promise.all([api.getOrders(), api.getCustomers(), api.getProducts()])
      .then(([o, c, p]) => { setOrders(o); setCustomers(c); setProducts(p); })
      .catch((err) => showMsg(err.message, 'error'));
  };

  useEffect(() => { loadAll(); }, []);

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_id || !form.product_id || !form.quantity) {
      showMsg('Please select customer, product, and quantity', 'error');
      return;
    }

    const payload = {
      customer_id: parseInt(form.customer_id, 10),
      items: [{ product_id: parseInt(form.product_id, 10), quantity: parseInt(form.quantity, 10) }],
    };

    try {
      await api.createOrder(payload);
      showMsg('Order placed successfully', 'success');
      setForm({ customer_id: '', product_id: '', quantity: '1' });
      setSelectedOrder(null);
      loadAll();
    } catch (err) {
      showMsg(err.message, 'error');
    }
  };

  const viewDetails = async (id) => {
    try {
      const order = await api.getOrder(id);
      setSelectedOrder(order);
    } catch (err) {
      showMsg(err.message, 'error');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this order? Stock will be restored.')) return;
    try {
      await api.cancelOrder(id);
      showMsg('Order cancelled', 'success');
      setSelectedOrder(null);
      loadAll();
    } catch (err) {
      showMsg(err.message, 'error');
    }
  };

  return (
    <div>
      <header className="page-header">
        <h2>Orders</h2>
        <p>Create and track customer orders</p>
      </header>

      {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

      <div className="two-col">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <h3>Place New Order</h3>
          <label>
            Customer
            <select name="customer_id" value={form.customer_id} onChange={handleChange}>
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
          </label>
          <label>
            Product
            <select name="product_id" value={form.product_id} onChange={handleChange}>
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (stock: {p.quantity_in_stock}) — ${p.price.toFixed(2)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Quantity
            <input name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} />
          </label>
          <button type="submit" className="btn primary">Place Order</button>
        </form>

        <section className="panel">
          <h3>Order History ({orders.length})</h3>
          {orders.length === 0 ? (
            <p className="empty-msg">No orders placed yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>{o.customer_name}</td>
                      <td>${o.total_amount.toFixed(2)}</td>
                      <td><span className={`badge ${o.status}`}>{o.status}</span></td>
                      <td className="actions">
                        <button className="btn small" onClick={() => viewDetails(o.id)}>Details</button>
                        {o.status !== 'cancelled' && (
                          <button className="btn small danger" onClick={() => handleCancel(o.id)}>Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {selectedOrder && (
        <section className="panel detail-panel">
          <div className="detail-header">
            <h3>Order #{selectedOrder.id} Details</h3>
            <button className="btn ghost small" onClick={() => setSelectedOrder(null)}>Close</button>
          </div>
          <p><strong>Customer:</strong> {selectedOrder.customer_name}</p>
          <p><strong>Status:</strong> {selectedOrder.status}</p>
          <p><strong>Total:</strong> ${selectedOrder.total_amount.toFixed(2)}</p>
          <table>
            <thead>
              <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Line Total</th></tr>
            </thead>
            <tbody>
              {selectedOrder.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product_name}</td>
                  <td>{item.quantity}</td>
                  <td>${item.unit_price.toFixed(2)}</td>
                  <td>${item.line_total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
