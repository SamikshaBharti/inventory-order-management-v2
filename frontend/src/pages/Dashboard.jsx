import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSummary()
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="alert error">{error}</div>;
  if (!summary) return <div className="loading">Loading dashboard...</div>;

  const cards = [
    { label: 'Total Products', value: summary.total_products, color: 'teal' },
    { label: 'Total Customers', value: summary.total_customers, color: 'blue' },
    { label: 'Total Orders', value: summary.total_orders, color: 'purple' },
    { label: 'Low Stock Items', value: summary.low_stock_products.length, color: 'amber' },
  ];

  return (
    <div>
      <header className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your inventory and orders</p>
      </header>

      <div className="stat-grid">
        {cards.map((card) => (
          <article key={card.label} className={`stat-card ${card.color}`}>
            <span className="stat-value">{card.value}</span>
            <span className="stat-label">{card.label}</span>
          </article>
        ))}
      </div>

      <section className="panel">
        <h3>Low Stock Alert (≤ {summary.low_stock_threshold} units)</h3>
        {summary.low_stock_products.length === 0 ? (
          <p className="empty-msg">All products are sufficiently stocked.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Stock Left</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {summary.low_stock_products.map((p) => (
                <tr key={p.id} className={p.quantity_in_stock === 0 ? 'out-of-stock' : ''}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>{p.quantity_in_stock}</td>
                  <td>${p.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
