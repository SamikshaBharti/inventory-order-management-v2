import { useEffect, useState } from 'react';
import { api } from '../api';

const emptyForm = { name: '', sku: '', price: '', quantity_in_stock: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const loadProducts = () => {
    api.getProducts()
      .then(setProducts)
      .catch((err) => showMsg(err.message, 'error'));
  };

  useEffect(() => { loadProducts(); }, []);

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.sku || !form.price || form.quantity_in_stock === '') {
      showMsg('Please fill in all fields', 'error');
      return;
    }

    const payload = {
      name: form.name,
      sku: form.sku,
      price: parseFloat(form.price),
      quantity_in_stock: parseInt(form.quantity_in_stock, 10),
    };

    try {
      if (editingId) {
        await api.updateProduct(editingId, payload);
        showMsg('Product updated', 'success');
      } else {
        await api.createProduct(payload);
        showMsg('Product added', 'success');
      }
      setForm(emptyForm);
      setEditingId(null);
      loadProducts();
    } catch (err) {
      showMsg(err.message, 'error');
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity_in_stock: String(product.quantity_in_stock),
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.deleteProduct(id);
      showMsg('Product deleted', 'success');
      loadProducts();
    } catch (err) {
      showMsg(err.message, 'error');
    }
  };

  const query = searchQuery.trim().toLowerCase();
  const filtered = query
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query)
      )
    : products;

  return (
    <div>
      <header className="page-header">
        <h2>Products</h2>
        <p>Manage your product catalog and stock levels</p>
      </header>

      {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

      <div className="two-col">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit Product' : 'Add Product'}</h3>
          <label>Name<input name="name" value={form.name} onChange={handleChange} /></label>
          <label>SKU Code<input name="sku" value={form.sku} onChange={handleChange} /></label>
          <label>Price ($)<input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} /></label>
          <label>Stock Qty<input name="quantity_in_stock" type="number" min="0" value={form.quantity_in_stock} onChange={handleChange} /></label>
          <div className="btn-row">
            <button type="submit" className="btn primary">{editingId ? 'Save Changes' : 'Add Product'}</button>
            {editingId && (
              <button type="button" className="btn ghost" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <section className="panel">
          <h3>Product List ({filtered.length})</h3>
          <input
            type="search"
            className="search-input"
            placeholder="Search by name or SKU code"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {filtered.length === 0 ? (
            <p className="empty-msg">
              {products.length === 0 ? 'No products yet. Add your first one.' : 'No products match your search.'}
            </p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Name</th><th>SKU Code</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td><code>{p.sku}</code></td>
                      <td>${p.price.toFixed(2)}</td>
                      <td className={p.quantity_in_stock <= 1 ? 'low-stock' : ''}>{p.quantity_in_stock}</td>
                      <td className="actions">
                        <button className="btn small" onClick={() => startEdit(p)}>Edit</button>
                        <button className="btn small danger" onClick={() => handleDelete(p.id)}>Delete</button>
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
