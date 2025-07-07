# E-Commerce Platform

A simple eCommerce web application built with:

**Backend:** Node.js (Express), SQLite, JWT Auth, bcrypt  
**Frontend:** React (with hooks)

Supports two roles:

- **Admin:** Can manage (add, edit, delete) products.
- **Customer:** Can view products, add to cart, and place orders.

## Features

- **Authentication**  
    Signup / Login with hashed passwords.  
    JWT-based authentication (protected routes).

- **Roles**  
    Admin and Customer roles with authorization.

- **Products**  
    Browse with pagination, search & filter by category.  
    Admin can add, edit, delete products.

- **Cart & Orders**  
    Customers can add products to cart and place orders.

- **SQLite DB**  
    Local database file (`ecommerce.db`) using SQLite.

- **Security**  
    Uses Helmet for HTTP headers.  
    CORS enabled.

## Installation & Setup

### Clone & install

```bash
git clone https://github.com/Sravanikonapalli/e-commerce-api-adaptnxt.git
cd e-commerce-api(adptnxt)
```

### Install backend dependencies

```bash
cd backend
npm install
```

### Start backend server

```bash
node server.js
```
Runs on http://localhost:3000

### Start React frontend

Open another terminal:

```bash
cd frontend
npm install
npm start
```
Runs on http://localhost:3001

## API Endpoints

| Endpoint         | Method | Auth      | Description                                 |
|------------------|--------|-----------|---------------------------------------------|
| /signup          | POST   | No        | Signup with `{ username, password, role }`  |
| /login           | POST   | No        | Login, returns JWT token                    |
| /products        | GET    | No        | List products (with page, limit, search, category) |
| /products        | POST   | Admin     | Add a product                               |
| /products/:id    | PUT    | Admin     | Update product                              |
| /products/:id    | DELETE | Admin     | Delete product                              |
| /cart            | GET    | Yes       | Get user's cart                             |
| /cart/add        | POST   | Yes       | Add product to cart `{ productId, quantity }` |
| /cart/remove     | POST   | Yes       | Remove from cart `{ productId }`            |
| /orders          | GET    | Yes       | Get user's orders                           |
| /orders          | POST   | Yes       | Place an order                              |

## Sample curl commands

**Signup (customer or admin):**
```bash
curl -X POST http://localhost:3000/signup \
-H "Content-Type: application/json" \
-d '{"username":"alice", "password":"1234", "role":"customer"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/login \
-H "Content-Type: application/json" \
-d '{"username":"alice", "password":"1234"}'
```

**Get products:**
```bash
curl http://localhost:3000/products
```

**Add to cart:**
```bash
curl -X POST http://localhost:3000/cart/add \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <JWT_TOKEN>" \
-d '{"productId":1, "quantity":2}'
```

**Place order:**
```bash
curl -X POST http://localhost:3000/orders \
-H "Authorization: Bearer super_secret_key"
```

## Live Links

- Backend: https://e-commerce-api-adaptnxt.onrender.com
- Frontend: https://e-commerce-api-adaptnxt.vercel.app/