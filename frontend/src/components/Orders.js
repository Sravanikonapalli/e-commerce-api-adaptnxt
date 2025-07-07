import React from "react";

export default function Orders({ orders }) {
  return (
    <>
      <h3>Orders</h3>
      {orders.map(o => (
        <div key={o.id}>
          Order #{o.id} - ${o.total} on {o.createdAt}
        </div>
      ))}
    </>
  );
}
