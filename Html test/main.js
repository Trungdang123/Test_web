// Dữ liệu giả (sau này thay bằng dữ liệu từ backend)
let products = [];

async function loadProducts() {
  try {
    const res = await fetch("http://localhost:3000/api/products");
    products = await res.json();
    renderProducts(products);
  } catch (err) {
    $("#product-list").innerHTML = "<p>Không tải được dữ liệu sản phẩm.</p>";
  }
}

let cart = []; // [{ id, qty }]

const $ = (s) => document.querySelector(s);
const money = (n) => n.toLocaleString("vi-VN") + "đ";

/* ---------- Sản phẩm ---------- */
function renderProducts(list) {
  $("#product-list").innerHTML = list.length
    ? list.map(p => `
      <article class="card">
        <div class="card-img">${p.image ? `<img src="${p.image}" alt="${p.name}">` : "🍽️"}</div>
        <div class="card-body">
          <h3 class="card-name">${p.name}</h3>
          <p class="card-price">${money(p.price)} / ${p.unit}</p>
          <button class="btn-buy" data-id="${p.id}">Chọn mua</button>
        </div>
      </article>`).join("")
    : "<p>Không tìm thấy sản phẩm.</p>";
}

$("#product-list").addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-buy");
  if (!btn) return;
  addToCart(Number(btn.dataset.id));
});

$("#search").addEventListener("input", (e) => {
  const key = e.target.value.trim().toLowerCase();
  renderProducts(products.filter(p =>
    p.name.toLowerCase().includes(key) ||
    (p.category || "").toLowerCase().includes(key)
  ));
});

/* ---------- Giỏ hàng ---------- */
function addToCart(id) {
  const item = cart.find(i => i.id === id);
  item ? item.qty++ : cart.push({ id, qty: 1 });
  renderCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
}

function renderCart() {
  let total = 0, count = 0;
  $("#cart-items").innerHTML = cart.map(i => {
    const p = products.find(p => p.id === i.id);
    total += p.price * i.qty;
    count += i.qty;
    return `
      <div class="cart-item">
        <div class="cart-info">
          <strong>${p.name}</strong><br>${money(p.price)}
        </div>
        <div class="cart-actions">
          <div class="qty">
            <button onclick="changeQty(${p.id}, -1)">−</button>
            <span>${i.qty}</span>
            <button onclick="changeQty(${p.id}, 1)">+</button>
          </div>
          <button class="btn-remove" onclick="removeFromCart(${p.id})" title="Xóa món này">🗑 Xóa</button>
        </div>
      </div>`;
  }).join("") || "<p>Giỏ hàng trống.</p>";

  $("#subtotal").textContent = money(total);
  $("#cart-count").textContent = count;
}

$("#cart-clear").onclick = () => {
  if (cart.length && confirm("Xóa toàn bộ giỏ hàng?")) {
    cart = [];
    renderCart();
  }
};

/* ---------- Mở / đóng panel ---------- */
$("#cart-open").onclick = () => $("#cart").classList.add("open");
$("#chat-open").onclick = () => $("#chatbot").classList.toggle("open");
document.querySelectorAll("[data-close]").forEach(btn => {
  btn.onclick = () => document.getElementById(btn.dataset.close).classList.remove("open");
});

/* ---------- Chatbot (tạm trả lời mẫu) ---------- */
function addMsg(text, who) {
  const div = document.createElement("div");
  div.className = "msg " + who;
  div.textContent = text;
  $("#chat-body").appendChild(div);
  $("#chat-body").scrollTop = $("#chat-body").scrollHeight;
}

$("#chat-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = $("#chat-input").value.trim();
  if (!text) return;
  addMsg(text, "user");
  $("#chat-input").value = "";
  setTimeout(() => addMsg("Mình đã nhận câu hỏi của bạn. (Chatbot sẽ nối với AI sau.)", "bot"), 500);
});

addMsg("Xin chào! Bạn cần tư vấn đặc sản nào?", "bot");

/* ---------- Khởi động ---------- */
loadProducts();
renderCart();