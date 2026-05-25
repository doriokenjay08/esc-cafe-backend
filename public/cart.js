let cart = [];

function loadCartFromStorage() {
  cart = JSON.parse(localStorage.getItem("esc_cart") || "[]");
}

function saveCartToStorage() {
  localStorage.setItem("esc_cart", JSON.stringify(cart));
}

function renderCart() {
  const container = document.getElementById("cartItems");
  const emptyState = document.getElementById("cartEmpty");
  const cartForm = document.getElementById("cartForm");
  const summaryRows = document.getElementById("summaryRows");
  const totalEl = document.getElementById("summaryTotal");

  container.innerHTML = "";
  summaryRows.innerHTML = "";

  if (cart.length === 0) {
    emptyState.style.display = "block";
    if (cartForm) cartForm.style.display = "none";
    if (totalEl) totalEl.textContent = "₱ 0";
    return;
  }

  emptyState.style.display = "none";
  if (cartForm) cartForm.style.display = "flex";

  let total = 0;

  cart.forEach((item, index) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">₱ ${item.price} each</p>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty(${index}, -1)">−</button>
        <span class="qty-value">${item.quantity}</span>
        <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
        <button class="remove-btn" onclick="removeItem(${index})">✕</button>
      </div>
    `;
    container.appendChild(div);

    const row = document.createElement("div");
    row.className = "summary-row";
    row.innerHTML = `<span>${item.name} x${item.quantity}</span><span>₱ ${subtotal}</span>`;
    summaryRows.appendChild(row);
  });

  if (totalEl) totalEl.textContent = `₱ ${total}`;
}

function changeQty(index, delta) {
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  saveCartToStorage();
  renderCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCartToStorage();
  renderCart();
}

async function placeOrder() {
  const name = document.getElementById("customerName")?.value.trim();
  const email = document.getElementById("customerEmail")?.value.trim();
  const phone = document.getElementById("customerPhone")?.value.trim();
  const paymentEl = document.querySelector('input[name="payment"]:checked');
  const payment = paymentEl ? paymentEl.value : "COD";
  const statusEl = document.getElementById("orderStatus");
  const btn = document.getElementById("placeOrderBtn");

  if (!name || !email || !phone) {
    statusEl.className = "order-status error";
    statusEl.textContent = "Please fill in all your details!";
    return;
  }

  if (cart.length === 0) {
    statusEl.className = "order-status error";
    statusEl.textContent = "Your cart is empty!";
    return;
  }

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const items = cart.map((item) => ({
    menuItem: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  btn.disabled = true;
  btn.textContent = "Placing Order…";
  statusEl.className = "order-status";
  statusEl.textContent = "";

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  try {
    const res = await fetch(`${API}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        paymentMethod: payment,
        items,
        totalAmount,
        userId: user._id || null,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      statusEl.className = "order-status success";
      statusEl.textContent = `✅ Order placed! Reference: ${data._id}`;
      cart = [];
      saveCartToStorage();
      renderCart();
    } else {
      throw new Error(data.message || "Something went wrong");
    }
  } catch (err) {
    statusEl.className = "order-status error";
    statusEl.textContent = `❌ ${err.message}`;
  } finally {
    btn.disabled = false;
    btn.textContent = "Place Order";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadCartFromStorage();
  renderCart();
  updateCartBadge();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.name) {
    const nameEl = document.getElementById("customerName");
    const emailEl = document.getElementById("customerEmail");
    if (nameEl) nameEl.value = user.name;
    if (emailEl) emailEl.value = user.email;
  }
});
