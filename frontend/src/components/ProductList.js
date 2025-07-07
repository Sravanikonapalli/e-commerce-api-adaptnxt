import React, { useState, useEffect } from "react";

export default function ProductList({ user, token, addToCart, refreshProducts }) {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => { loadProducts(); }, [page, search, category]);

  async function loadProducts() {
    const res = await fetch(`https://e-commerce-api-adaptnxt.onrender.com/products?page=${page}&limit=5&search=${search}&category=${category}`);
    setProducts(await res.json());
  }

  async function deleteProduct(id) {
    await fetch(`https://e-commerce-api-adaptnxt.onrender.com/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    refreshProducts();
  }

  return (
    <>
      <h3>Products</h3>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search" />
      <select value={category} onChange={e=>setCategory(e.target.value)}>
        <option value="">All</option><option>Electronics</option><option>Clothing</option><option>Footwear</option><option>Accessories</option><option>Computers</option>
      </select>
      <button onClick={() => setPage(1)}>Search</button>

      {products.map(p => (
        <div key={p.id}>
          <b>{p.name}</b> - ${p.price} (Stock: {p.stock})
          {user.role === "customer" && <button onClick={() => addToCart(p.id)}>Add to Cart</button>}
          {user.role === "admin" && <>
            <button onClick={() => editProduct(p)}>Edit</button>
            <button onClick={() => deleteProduct(p.id)}>Delete</button>
          </>}
        </div>
      ))}
      <button onClick={() => setPage(Math.max(1, page-1))}>Prev</button>
      <button onClick={() => setPage(page+1)}>Next</button>
    </>
  );

  async function editProduct(p) {
    const name = prompt("Name", p.name);
    const category = prompt("Category", p.category);
    const price = parseFloat(prompt("Price", p.price));
    const stock = parseInt(prompt("Stock", p.stock));
    await fetch(`https://e-commerce-api-adaptnxt.onrender.com/products/${p.id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name, category, price, stock })
    });
    refreshProducts();
  }
}
