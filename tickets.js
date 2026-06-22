// Ticket tiers for UNTOLD
const TIERS = [
  { id: "ga", name: "General Admission", desc: "Standing access · all night", price: 49 },
  { id: "vip", name: "VIP", desc: "Fast-track entry + lounge", price: 119 },
  { id: "frost", name: "Frost Table", desc: "Reserved table for 4 + bottle", price: 420 },
];

const MAX_PER_TIER = 8;

const cart = Object.fromEntries(TIERS.map((t) => [t.id, 0]));

const modal = document.getElementById("ticketsModal");
const tiersEl = document.getElementById("tiers");
const totalEl = document.getElementById("totalAmount");
const checkoutBtn = document.getElementById("checkoutBtn");

// Render tiers
function renderTiers() {
  tiersEl.innerHTML = TIERS.map(
    (t) => `
    <li class="tier" data-id="${t.id}">
      <div class="tier__info">
        <div class="tier__name">${t.name}</div>
        <div class="tier__desc">${t.desc}</div>
      </div>
      <div class="tier__price">$${t.price}</div>
      <div class="stepper">
        <button class="stepper__btn" data-action="dec" aria-label="Remove one">−</button>
        <span class="stepper__count" data-count>${cart[t.id]}</span>
        <button class="stepper__btn" data-action="inc" aria-label="Add one">+</button>
      </div>
    </li>`
  ).join("");
}

function updateTotal() {
  const total = TIERS.reduce((sum, t) => sum + t.price * cart[t.id], 0);
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  totalEl.textContent = `$${total.toLocaleString()}`;
  checkoutBtn.disabled = count === 0;
  checkoutBtn.textContent = count === 0 ? "Checkout" : `Checkout · ${count} ticket${count > 1 ? "s" : ""}`;
}

// Stepper handling (event delegation)
tiersEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".stepper__btn");
  if (!btn) return;
  const id = btn.closest(".tier").dataset.id;
  const delta = btn.dataset.action === "inc" ? 1 : -1;
  cart[id] = Math.min(MAX_PER_TIER, Math.max(0, cart[id] + delta));
  btn.closest(".tier").querySelector("[data-count]").textContent = cart[id];
  updateTotal();
});

// Open / close
function openModal() {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.getElementById("openTickets").addEventListener("click", openModal);

modal.querySelectorAll("[data-close]").forEach((el) =>
  el.addEventListener("click", closeModal)
);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
});

checkoutBtn.addEventListener("click", () => {
  const summary = TIERS.filter((t) => cart[t.id] > 0)
    .map((t) => `${cart[t.id]}× ${t.name}`)
    .join(", ");
  alert(`Heading to checkout:\n${summary}`);
});

// Init
renderTiers();
updateTotal();
