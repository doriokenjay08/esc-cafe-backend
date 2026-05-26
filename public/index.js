const API = "https://esc-cafe-backend-production.up.railway.app";
//const API = "http://localhost:5000";
function getCart() {
  return JSON.parse(localStorage.getItem("esc_cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("esc_cart", JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((sum, i) => sum + i.quantity, 0);
  const badges = document.querySelectorAll(".cart-badge");
  badges.forEach((b) => {
    b.textContent = total;
    b.style.display = total > 0 ? "flex" : "none";
  });
}

function addToCart(id, name, price) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }
  saveCart(cart);
  showToast(`${name} added to cart!`);
}

function showToast(msg) {
  let toast = document.getElementById("esc-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "esc-toast";
    toast.style.cssText =
      "position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#8B4513;color:#fff;padding:12px 28px;border-radius:30px;font-family:Poppins,sans-serif;font-size:14px;font-weight:600;z-index:9999;opacity:0;transition:opacity 0.3s;pointer-events:none;";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = "1";
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = "0";
  }, 2200);
}

async function handleLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const status = document.getElementById("loginStatus");
  if (!email || !password) {
    status.textContent = "Please fill in all fields.";
    return;
  }
  status.textContent = "Signing in…";
  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      status.textContent = data.message || "Login failed";
      return;
    }
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    if (data.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "mainm.html";
    }
  } catch {
    status.textContent = "Network error. Please try again.";
  }
}

async function handleRegister() {
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  const status = document.getElementById("registerStatus");
  if (!name || !email || !password) {
    status.textContent = "Please fill in all fields.";
    return;
  }
  status.textContent = "Creating account…";
  try {
    const res = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      status.textContent = data.message || "Registration failed";
      return;
    }
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    window.location.href = "mainm.html";
  } catch {
    status.textContent = "Network error. Please try again.";
  }
}

function togglePw(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}

function switchTab(tab) {
  document.getElementById("loginForm").style.display =
    tab === "login" ? "block" : "none";
  document.getElementById("registerForm").style.display =
    tab === "register" ? "block" : "none";
  document
    .getElementById("loginTab")
    .classList.toggle("active", tab === "login");
  document
    .getElementById("registerTab")
    .classList.toggle("active", tab === "register");
}

function loginWithGoogle() {
  alert("Google login coming soon!");
}
function loginWithFacebook() {
  alert("Facebook login coming soon!");
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (token && document.body.dataset.page === "login") {
    if (user.role === "admin") window.location.href = "admin.html";
    else window.location.href = "mainm.html";
  }

  if (token) {
    const navLinks = document.getElementById("navLinks");
    if (navLinks) {
      const logoutLi = document.createElement("li");
      logoutLi.innerHTML = '<a href="#" onclick="logout()">Logout</a>';
      navLinks.appendChild(logoutLi);
    }
  }
});
