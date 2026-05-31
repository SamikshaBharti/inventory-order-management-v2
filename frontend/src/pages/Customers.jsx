import { useEffect, useState } from 'react';
import { api } from '../api';

const emptyForm = { full_name: '', email: '', phone: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState({ text: '', type: '' });

  const loadCustomers = () => {
    api.getCustomers().then(setCustomers).catch((err) => showMsg(err.message, 'error'));
  };

  useEffect(() => { loadCustomers(); }, []);

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.phone) {
      showMsg('Please fill in all fields', 'error');
      return;
    }

    try {
      await api.createCustomer(form);
      showMsg('Customer added', 'success');
      setForm(emptyForm);
      loadCustomers();
    } catch (err) {
      showMsg(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await api.deleteCustomer(id);
      showMsg('Customer deleted', 'success');
      loadCustomers();
    } catch (err) {
      showMsg(err.message, 'error');
    }
  };

  return (
    <div>
      <header className="page-header">
        <h2>Customers</h2>
        <p>Keep track of your customer contacts</p>
      </header>

      {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

      <div className="two-col">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <h3>Add Customer</h3>
          <label>Full Name<input name="full_name" value={form.full_name} onChange={handleChange} /></label>
          <label>Email<input name="email" type="email" value={form.email} onChange={handleChange} /></label>
          <label>Phone<input name="phone" value={form.phone} onChange={handleChange} /></label>
          <button type="submit" className="btn primary">Add Customer</button>
        </form>

        <section className="panel">
          <h3>Customer List ({customers.length})</h3>
          {customers.length === 0 ? (
            <p className="empty-msg">No customers yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td>{c.full_name}</td>
                      <td>{c.email}</td>
                      <td>{c.phone}</td>
                      <td>
                        <button className="btn small danger" onClick={() => handleDelete(c.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
