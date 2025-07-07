const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

const SECRET_KEY = "super_secret_key";

let db;
const dbPath = path.join(__dirname, "ecommerce.db");

// ================== Initialize DB ======================
const initializeDbAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });

    // USERS TABLE
    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT
      );
    `);

    // PRODUCTS TABLE
    await db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        category TEXT,
        price REAL,
        stock INTEGER
      );
    `);

    // CART TABLE
    await db.run(`
      CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        productId INTEGER,
        quantity INTEGER,
        FOREIGN KEY(userId) REFERENCES users(id)
      );
    `);

    // ORDERS TABLE
    await db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        total REAL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id)
      );
    `);

    // ORDER ITEMS TABLE
    await db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId INTEGER,
        productId INTEGER,
        quantity INTEGER,
        price REAL,
        FOREIGN KEY(orderId) REFERENCES orders(id)
      );
    `);

    app.listen(3000, () =>
      console.log("Server running at http://localhost:3000")
    );
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// ================== AUTH MIDDLEWARE ======================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

// ================== USER ROUTES ======================
app.post("/signup", async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.run(
      `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
      [username, hashed, role || 'customer']
    );
    res.status(201).json({ message: "User created" });
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: "User already exists or invalid" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await db.get(`SELECT * FROM users WHERE username = ?`, [username]);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token });
});

// ================== PRODUCT ROUTES ======================
app.get("/products", async (req, res) => {
  const { page = 1, limit = 5, search, category } = req.query;
  let query = "SELECT * FROM products WHERE 1=1";
  let params = [];

  if (search) {
    query += " AND name LIKE ?";
    params.push(`%${search}%`);
  }
  if (category) {
    query += " AND category = ?";
    params.push(category);
  }

  query += " LIMIT ? OFFSET ?";
  params.push(Number(limit), (page - 1) * limit);

  const products = await db.all(query, params);
  res.json(products);
});

app.get("/products/:id", async (req, res) => {
  const { id } = req.params;
  const product = await db.get("SELECT * FROM products WHERE id = ?", [id]);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

app.post("/products", authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Only admin" });
  const { name, category, price, stock } = req.body;
  await db.run(
    `INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)`,
    [name, category, price, stock]
  );
  res.status(201).json({ message: "Product added" });
});

app.put("/products/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Only admin" });
  const { name, category, price, stock } = req.body;
  await db.run(
    `UPDATE products SET name=?, category=?, price=?, stock=? WHERE id=?`,
    [name, category, price, stock, req.params.id]
  );
  res.json({ message: "Product updated" });
});

app.delete("/products/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Only admin" });
  await db.run(`DELETE FROM products WHERE id=?`, [req.params.id]);
  res.json({ message: "Product deleted" });
});

// ================== CART ROUTES ======================
app.get("/cart", authenticateToken, async (req, res) => {
  const items = await db.all(`
    SELECT cart.id, products.name, cart.quantity, products.price 
    FROM cart 
    JOIN products ON cart.productId = products.id 
    WHERE cart.userId = ?`, [req.user.id]);
  res.json(items);
});

app.post("/cart/add", authenticateToken, async (req, res) => {
  const { productId, quantity } = req.body;
  const exists = await db.get(
    `SELECT * FROM cart WHERE userId=? AND productId=?`,
    [req.user.id, productId]
  );
  if (exists) {
    await db.run(`UPDATE cart SET quantity = quantity + ? WHERE id = ?`, [quantity, exists.id]);
  } else {
    await db.run(`INSERT INTO cart (userId, productId, quantity) VALUES (?, ?, ?)`,
      [req.user.id, productId, quantity]);
  }
  res.json({ message: "Added to cart" });
});

app.post("/cart/remove", authenticateToken, async (req, res) => {
  const { productId } = req.body;
  await db.run(`DELETE FROM cart WHERE userId = ? AND productId = ?`, [req.user.id, productId]);
  res.json({ message: "Removed from cart" });
});

// ================== ORDER ROUTES ======================
app.post("/orders", authenticateToken, async (req, res) => {
  const cartItems = await db.all(`
    SELECT cart.productId, cart.quantity, products.price 
    FROM cart 
    JOIN products ON cart.productId = products.id 
    WHERE cart.userId = ?`, [req.user.id]);

  if (cartItems.length === 0) return res.status(400).json({ error: "Cart is empty" });

  const total = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const result = await db.run(`INSERT INTO orders (userId, total) VALUES (?, ?)`, [req.user.id, total]);
  const orderId = result.lastID;

  for (const item of cartItems) {
    await db.run(`INSERT INTO order_items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)`,
      [orderId, item.productId, item.quantity, item.price]);
  }

  await db.run(`DELETE FROM cart WHERE userId = ?`, [req.user.id]);

  res.json({ message: "Order placed", orderId });
});

app.get("/orders", authenticateToken, async (req, res) => {
  const orders = await db.all(`SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC`, [req.user.id]);
  res.json(orders);
});
