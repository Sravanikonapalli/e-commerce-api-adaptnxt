import React from "react";

export default function Cart({ cart, token, refreshCart, refreshOrders }) {

  async function removeFromCart(productId) {
    await fetch("https://e-commerce-api-adaptnxt.onrender.com/cart/remove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ productId })
    });
    refreshCart();
  }

  async function placeOrder() {
    await fetch("https://e-commerce-api-adaptnxt.onrender.com/orders", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    refreshCart();
    refreshOrders();
  }

  return (
    <>
      <h3>Cart</h3>
      {Array.isArray(cart) && cart.length > 0 ? (
        cart.map(c => (
          <div key={c.id}>
            {c.name} x {c.quantity} (${c.quantity * c.price})
            <button onClick={() => removeFromCart(c.id)}>Remove</button>
          </div>
        ))
      ) : (
        <div>Your cart is empty.</div>
      )}
      {Array.isArray(cart) && cart.length > 0 && <button onClick={placeOrder}>Place Order</button>}
    </>
  );
}
