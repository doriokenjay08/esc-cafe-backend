async function loadSignatures() {
  const container = document.querySelector(".menu-cards");
  if (!container) return;
  container.innerHTML = '<div class="loading-spinner"></div>';
  try {
    const res = await fetch(`${API}/api/menu?category=Signature`);
    const items = await res.json();
    if (!items.length) {
      container.innerHTML =
        '<p style="color:#888;padding:20px;">No signature drinks available.</p>';
      return;
    }
    container.innerHTML = items
      .map(
        (item) => `
      <div class="menu-card">
        <img src="${item.image || "images/placeholder.jpg"}" alt="${
          item.name
        }" onerror="this.style.opacity='0'" />
        <div class="menu-card-info">
          <p class="menu-card-name">${item.name}</p>
          <p class="menu-card-price">₱ ${item.price}</p>
          <button class="btn-add-cart" onclick="addToCart('${item._id}','${
          item.name
        }',${item.price})">Add to Cart</button>
        </div>
      </div>
    `
      )
      .join("");
  } catch {
    container.innerHTML =
      '<p style="color:#888;padding:20px;">Could not load menu.</p>';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadSignatures();
  updateCartBadge();
});
