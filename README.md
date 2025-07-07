E-Commerce Platform
A simple eCommerce web application built with:

Backend: Node.js (Express), SQLite, JWT Auth, bcrypt

Frontend: React (with hooks)

Supports two roles:

🧑‍💼 Admin: Can manage (add, edit, delete) products.

🛍 Customer: Can view products, add to cart, and place orders.

🚀 Features
✅ Authentication

Signup / Login with hashed passwords.

JWT-based authentication (protected routes).

✅ Roles

Admin and Customer roles with authorization.

✅ Products

Browse with pagination, search & filter by category.

Admin can add, edit, delete products.

✅ Cart & Orders

Customers can add products to cart and place orders.

✅ SQLite DB

Local database file (ecommerce.db) using SQLite.

✅ Security

Uses Helmet for HTTP headers.

CORS enabled.

⚙️ Installation & Setup
📁 Clone & install
bash
Copy code
git clone https://github.com/your-username/ecommerce-app.git
cd ecommerce-app
🔧 Install backend dependencies
bash
Copy code
npm install
🚀 Start backend server
bash
Copy code
node index.js
Runs on http://localhost:3000

🌐 Start React frontend
Open another terminal:

bash
Copy code
cd client
npm install
npm start
Runs on http://localhost:3001

🔑 API Endpoints
Endpoint	Method	Auth	Description
/signup	POST	❌	Signup with { username, password, role }
/login	POST	❌	Login, returns JWT token
/products	GET	❌	List products (with page, limit, search, category)
/products	POST	✅ admin	Add a product
/products/:id	PUT	✅ admin	Update product
/products/:id	DELETE	✅ admin	Delete product
/cart	GET	✅	Get user's cart
/cart/add	POST	✅	Add product to cart { productId, quantity }
/cart/remove	POST	✅	Remove from cart { productId }
/orders	GET	✅	Get user's orders
/orders	POST	✅	Place an order

🖥 Sample curl commands
🚀 Signup (customer or admin)
bash
Copy code
curl -X POST http://localhost:3000/signup \
-H "Content-Type: application/json" \
-d '{"username":"alice", "password":"1234", "role":"customer"}'
🔐 Login
bash
Copy code
curl -X POST http://localhost:3000/login \
-H "Content-Type: application/json" \
-d '{"username":"alice", "password":"1234"}'
📦 Get products
bash
Copy code
curl http://localhost:3000/products
➕ Add to cart
bash
Copy code
curl -X POST http://localhost:3000/cart/add \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <JWT_TOKEN>" \
-d '{"productId":1, "quantity":2}'
🛒 Place order
bash
Copy code
curl -X POST http://localhost:3000/orders \
-H "Authorization: Bearer <JWT_TOKEN>"
💡 Notes
The app uses SQLite for simplicity (creates ecommerce.db).

You can inspect it using DB Browser for SQLite.

For production, you can swap to PostgreSQL, MySQL or another DB.

✨ Future Improvements
✅ Add refresh tokens
✅ Better UI for orders
✅ Product image uploads
✅ Email notifications


livelinks

backend-https://e-commerce-api-adaptnxt.onrender.com
