import React from "react";

export default function AdminPanel({ token, refreshProducts }) {
  async function addProduct(e) {
    e.preventDefault();
    const { name, category, price, stock } = e.target;
    await fetch("http://localhost:3000/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: name.value,
        category: category.value,
        price: parseFloat(price.value),
        stock: parseInt(stock.value)
      })
    });
    e.target.reset();
    refreshProducts();
  }

  return (
    <form onSubmit={addProduct}>
      <h4>Add Product</h4>
      <input name="name" placeholder="Name" required />
      <input name="category" placeholder="Category" required />
      <input name="price" type="number" step="0.01" placeholder="Price" required />
      <input name="stock" type="number" placeholder="Stock" required />
      <button>Add</button>
    </form>
  );
}
