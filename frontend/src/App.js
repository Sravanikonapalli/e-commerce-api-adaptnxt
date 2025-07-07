import React, { useState, useEffect } from "react";
import AuthForm from "./components/AuthForm";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import Orders from "./components/Orders";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!token) return;
    refreshCart();
    refreshOrders();
  }, [token]);

 async function refreshCart() {
  const res = await fetch("http://localhost:3000/cart", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (Array.isArray(data)) {
    setCart(data);
  } else {
    console.error("Failed to load cart:", data);
    setCart([]); // fallback
  }
}

async function refreshOrders() {
  const res = await fetch("http://localhost:3000/orders", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (Array.isArray(data)) {
    setOrders(data);
  } else {
    console.error("Failed to load orders:", data);
    setOrders([]); // fallback
  }
}

  function logout() {
    localStorage.clear();
    setUser(null); setToken(null); setCart([]); setOrders([]);
  }

  if (!user) return <AuthForm setUser={setUser} setToken={setToken} />;

  return (
    <div style={{ maxWidth: 800, margin: "auto" }}>
      <h2>Hello, {user.username} ({user.role})</h2>
      <button onClick={logout}>Logout</button>
      <ProductList user={user} token={token} addToCart={addToCart} refreshProducts={() => window.location.reload()} />
      {user.role === "admin" && <AdminPanel token={token} refreshProducts={() => window.location.reload()} />}
      {user.role === "customer" && <>
        <Cart cart={cart} token={token} refreshCart={refreshCart} refreshOrders={refreshOrders} />
        <Orders orders={orders} />
      </>}
    </div>
  );

  async function addToCart(productId) {
    await fetch("http://localhost:3000/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ productId, quantity: 1 })
    });
    refreshCart();
  }
}
