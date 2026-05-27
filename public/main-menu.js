const CATEGORY_ORDER = [
  "Signature",
  "Espresso",
  "Non-Coffee",
  "Blended (Frappe)",
  "Refreshers",
  "Add ons",
];

async function loadFullMenu() {
  const section = document.querySelector(".main-menu-section");
  const heading = section.querySelector(".main-menu-heading");

  const loaderEl = document.createElement("div");
  loaderEl.id = "menu-loader";
  loaderEl.innerHTML =
    '<div class="loading-spinner" style="margin:40px auto;display:block;"></div>';
  section.appendChild(loaderEl);

  try {
    const res = await fetch(`${API}/api/menu`);
    const items = await res.json();

    document.getElementById("menu-loader").remove();

    const byCategory = {};
    CATEGORY_ORDER.forEach((cat) => {
      byCategory[cat] = [];
    });
    items.forEach((item) => {
      if (byCategory[item.category] !== undefined)
        byCategory[item.category].push(item);
    });

    CATEGORY_ORDER.forEach((cat) => {
      const catItems = byCategory[cat];
      if (!catItems.length) return;

      const group = document.createElement("div");
      group.className = "mm-group";
      group.innerHTML = `<p class="mm-group-label">${cat}</p>`;

      const total = catItems.length;
      const cols = total >= 4 ? 4 : total >= 3 ? 3 : total >= 2 ? 2 : 1;
      const cards = document.createElement("div");
      cards.className = `mm-cards mm-cards--${cols}`;

      catItems.forEach((item) => {
        const card = document.createElement("div");
        card.className = "mm-card";
        card.innerHTML = `
          <div class="mm-card-img-wrap">
            <img src="${item.image || "images/placeholder.jpg"}" alt="${
          item.name
        }" onerror="this.style.opacity='0'" />
          </div>
          <div class="mm-card-info">
            <p class="mm-card-name">${item.name}</p>
            <p class="mm-card-price">₱ ${item.price}</p>
            ${
              item.description
                ? `<p class="mm-card-desc">${item.description}</p>`
                : ""
            }
            <button class="btn-add-cart" onclick="addToCart('${item._id}','${
          item.name
        }',${item.price})">Add to Cart</button>
          </div>
        `;
        cards.appendChild(card);
      });

      group.appendChild(cards);
      section.appendChild(group);
    });
  } catch {
    document.getElementById("menu-loader").innerHTML =
      '<p style="text-align:center;color:#888;padding:40px;">Could not load menu. Please try again.</p>';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadFullMenu();
  updateCartBadge();
});
