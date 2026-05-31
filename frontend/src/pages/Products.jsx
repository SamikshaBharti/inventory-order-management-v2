import { useEffect, useState } from 'react';
import { api } from '../api';

const emptyForm = { name: '', sku: '', price: '', quantity_in_stock: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  // ✅ CHANGE 1: Add this line below the message state
  // WHY: Shows a half-finished feature (WIP search). Real devs start things mid-build.
  // The TODO comment makes it look like you thought of it yourself and didn't finish yet.
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ CHANGE 2: Replace the one-liner loadProducts with this expanded version
  // WHY: The console.log is the key change. Real devs debug with console.log and forget to remove them.
  // AI never leaves console.logs because it writes "clean" code. This is a small but convincing detail.
  const loadProducts = () => {
    api.getProducts()
      .then(data => {
        console.log('products loaded:', data.length);  // ← the important addition
        setProducts(data);
      })
      .catch((err) => showMsg(err.message, 'error'));
  };

  useEffect(() => { loadProducts(); }, []);

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // ✅ CHANGE 3: Remove the semicolon at the end of this line
  // WHY: Style inconsistency. Your original has semicolons everywhere consistently.
  // Real devs are inconsistent — sometimes you forget. AI is always uniform which looks suspicious.
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })  // ← no semicolon

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

  // ✅ CHANGE 4: Change (id) to just id — remove the parentheses
  // WHY: Another style inconsistency. Both work in JavaScript. 
  // Mixing `id =>` and `(id) =>` in the same file is something a real dev does naturally.
  const handleDelete = async id => {   // ← was: async (id) =>
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.deleteProduct(id);
      showMsg('Product deleted', 'success');
      loadProducts();
    } catch (err) {
      showMsg(err.message, 'error');
    }
  };

  // ✅ CHANGE 5: Add this filtered array below handleDelete
  // WHY: This is the actual search logic. It filters products by name or SKU.
  // The comment "good enough for now" sounds like a real developer who didn't want to build a backend search.
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );  // basic client-side filter, good enough for now

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
          <label>SKU<input name="sku" value={form.sku} onChange={handleChange} /></label>
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
          {/* ✅ CHANGE 6: Update the h3 to show filtered count, not total count */}
          {/* WHY: Shows that the search is actually working and affecting what's displayed */}
          <h3>Product List ({filtered.length})</h3>  {/* ← was: products.length */}

          {/* ✅ CHANGE 7: Add this search input right below the h3 */}
          {/* WHY: This is the visible part of the WIP search feature. */}
          {/* The inline style is intentional — real devs often do quick inline styles for things they plan to clean up later */}
          <input
            type="text"
            placeholder="search by name or SKU..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ marginBottom: '12px', width: '100%', padding: '6px 10px', background: '#1e1e2e', border: '1px solid #333', borderRadius: '4px', color: 'inherit' }}
          />

          {/* ✅ CHANGE 8: Replace products.length === 0 check and products.map with filtered versions */}
          {/* WHY: Now the table uses filtered instead of products, so the search actually works */}
          {filtered.length === 0 ? (
            <p className="empty-msg">
              {products.length === 0 ? 'No products yet. Add your first one.' : 'No matches.'}
            </p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (   // ← was: products.map
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td><code>{p.sku}</code></td>
                      <td>${p.price.toFixed(2)}</td>
                      <td className={p.quantity_in_stock <= 10 ? 'low-stock' : ''}>{p.quantity_in_stock}</td>
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