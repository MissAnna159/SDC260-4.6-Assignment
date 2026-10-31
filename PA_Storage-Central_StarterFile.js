/*
    Author: Caroline Anascavage
    Date: 10/31/26
    Purpose: Storage Central
*/
//Creating Product Data
const defaultProducts = [
  { id: 1, 
    name: "Hand-Thrown Mug", 
    description: "Ceramic mug with a soft glaze.", 
    price: 28, 
    stock: 5, 
    image: "mug.png", 
    alt: "Hand-thrown ceramic mug" },
  { id: 2, 
    name: "Fall Scarf", 
    description: "cotton hangcrafted scarf", 
    price: 42, 
    stock: 3,
    image: "scarf.png",
    alt: "fall scarf" },
  { id: 3,
    name: "Beeswax Candle", 
    description: "Scented candle in a glass jar.",
    price: 18, 
    stock: 8,
    image: "candle.png", 
    alt: "Beeswax candle in glass jar" },
  { id: 4, 
    name: "Macrame Handcrafted",
    description: "Handcrafted Macrame.", 
    price: 36, 
    stock: 4, 
    image: "macrame.png", 
    alt: "macrame" },
  { id: 5, 
    name: "Bookmark", 
    description: "Scented Bookmark.", 
    price: 22, 
    stock: 6, 
    image: "bookmark.png", 
    alt: "Hand-carved scented bookmark" },
  { id: 6, 
    name: "Coaster Set", 
    description: "Handcrafted Coaster Set.", 
    price: 12, 
    stock: 10, 
    image: "coasters.png", 
    alt: "Coaster set" }
];
//Load Storage
const productGrid = document.getElementById("product-grid");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");
const clearCartBtn = document.getElementById("clear-cart");
const checkoutBtn = document.getElementById("checkout-btn");
const sessionCountEl = document.getElementById("session-count");
const lastPurchaseEl = document.getElementById("last-purchase");
 
let products = JSON.parse(localStorage.getItem("products")) || defaultProducts;
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let sessionAdds = Number(sessionStorage.getItem("sessionAdds")) || 0;

//Out of Stock 
const tooltip = document.createElement("div");
tooltip.classList.add("mouse-tooltip");
tooltip.textContent = "OUT OF STOCK";
document.body.appendChild(tooltip);

//Save Data Functions
function saveData() {
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("cart", JSON.stringify(cart));
  sessionStorage.setItem("sessionAdds", sessionAdds);
}
 
function saveLastPurchaseCookie(items) {
  const value = encodeURIComponent(JSON.stringify(items));
  document.cookie = `lastPurchase=${value}; path=/; max-age=604800`;
}

//Display Products
function displayProducts() {
  productGrid.innerHTML = "";
  products.forEach(product => {
    const card = document.createElement("article");
    card.classList.add("product-card");
    if (product.stock === 0) card.classList.add("out-of-stock");
 
    if (product.stock === 0) {
      card.addEventListener("mousemove", e => {
        tooltip.style.left = e.clientX + "px";
        tooltip.style.top = e.clientY + "px";
        tooltip.classList.add("show");
      });
      card.addEventListener("mouseleave", () => tooltip.classList.remove("show"));
    }
 
    card.innerHTML = `
      <img src="${product.image}" alt="${product.alt}">
      <section class="product-content">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <p>$${product.price.toFixed(2)}</p>
        <p class="stock">Available: ${product.stock}</p>
        <button ${product.stock === 0 ? "disabled" : ""} onclick="addToCart(${product.id})" aria-label="Add ${product.name} to cart">
          Add to Cart
        </button>
      </section>`;
    productGrid.appendChild(card);
  });
}

//Add to cart
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product || product.stock <= 0) return;
 
  product.stock--;
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
 
  sessionAdds++;
  saveData();
  displayProducts();
  displayCart();
 
  // Visual indication: brief bounce on the cart panel
  const panel = document.getElementById("cart-panel");
  panel.classList.add("bounce");
  setTimeout(() => panel.classList.remove("bounce"), 500);
}

//Display Cart and Quantity Controls
function displayCart() {
  cartItems.innerHTML = "";
  let total = 0;
  let count = 0;
 
  cart.forEach((item, index) => {
    total += item.price * item.quantity;
    count += item.quantity;
 
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <p>${item.name} x${item.quantity} — $${(item.price * item.quantity).toFixed(2)}</p>
      <button onclick="changeQty(${index}, 1)">+</button>
      <button onclick="changeQty(${index}, -1)">-</button>`;
    cartItems.appendChild(div);
  });
 
  cartCount.textContent = `Items: ${count}`;
  cartTotal.textContent = `Total: $${total.toFixed(2)}`;
  sessionCountEl.textContent = `Items added this session: ${sessionAdds}`;
}

//Change Quantity and Clear Cart
function changeQty(index, change) {
  const item = cart[index];
  const product = products.find(p => p.id === item.id);
  item.quantity += change;
  if (product) product.stock -= change;
 
  if (item.quantity <= 0) {
    cart.splice(index, 1);
  }
  saveData();
  displayProducts();
  displayCart();
}
 
function clearCart() {
  cart.forEach(item => {
    const p = products.find(x => x.id === item.id);
    if (p) p.stock += item.quantity;
  });
  cart = [];
  saveData();
  displayProducts();
  displayCart();
}

//Check out and Last Purchase
function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }
  let total = 0, count = 0;
  cart.forEach(item => {
    total += item.price * item.quantity;
    count += item.quantity;
  });
 
  saveLastPurchaseCookie(cart.map(i => ({ name: i.name, quantity: i.quantity })));
  alert(`Confirm Purchase\n\nItems: ${count}\nTotal: $${total.toFixed(2)}`);
  clearCart();
  loadLastPurchase();
}
 
function loadLastPurchase() {
  const match = document.cookie.match(/lastPurchase=([^;]+)/);
  if (match) {
    const items = JSON.parse(decodeURIComponent(match[1]));
    lastPurchaseEl.textContent = "Last purchase: " + items.map(i => `${i.name} x${i.quantity}`).join(", ");
  }
}

//Event Listeners
clearCartBtn.addEventListener("click", clearCart);
checkoutBtn.addEventListener("click", checkout);
 
window.addEventListener("DOMContentLoaded", () => {
  displayProducts();
  displayCart();
  loadLastPurchase();
});
