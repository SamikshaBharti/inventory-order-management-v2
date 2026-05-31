# StockFlow

inventory + order management 

## stack

- Flask backend (python)
- React frontend (vite)
- postgres for the db
- docker to run everything together

## how to run

```
cp .env.example .env
docker compose up --build
```

frontend is at localhost:3000, api at localhost:5000

## what it does

- add/edit/delete products with SKUs
- manage customers
- place orders (auto-deducts stock, calculates total)
- cancel orders (stock comes back)
- dashboard with low-stock alerts

## api is basically

products, customers, orders — standard CRUD on each. orders are a bit special since they validate stock before confirming.

## notes

used Flask blueprints to keep routes organized. frontend is plain CSS, dark theme, no UI library. tried to keep things simple.
