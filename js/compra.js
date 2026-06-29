// ================================================================
// CHECKOUT - SIMULACIÓN DE PAGO EN 3 PASOS
// ================================================================

const checkoutData = {
  personal: null,
  items: [],
  total: 0,
};

document.addEventListener("DOMContentLoaded", initCheckout);

// ──────────────────────────── Init ────────────────────────────

async function initCheckout() {
  await loadOrderSummary();
  setupPersonalForm();
  setupPaymentForm();
  setBackLink();
}

function setBackLink() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  const backBtn = document.getElementById("backBtn");
  if (backBtn && productId) {
    backBtn.href = "producto.html?id=" + productId;
  }
}

// ─────────────────────── Resumen del pedido ───────────────────

async function loadOrderSummary() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  const fromCart = params.get("from") === "carrito";

  if (productId) {
    try {
      const allProducts = await getProductsFromSupabase();
      const product = allProducts.find(
        (p) => String(p.id) === String(productId),
      );
      if (product) {
        checkoutData.items = [
          {
            name: product.nombre,
            price: parseFloat(product.precio) || 0,
            img: product.imagen || "",
            qty: 1,
          },
        ];
      }
    } catch (e) {
      console.error("Error al cargar producto:", e);
    }
  } else if (fromCart) {
    const cart = JSON.parse(localStorage.getItem("cellstore_cart") || "[]");
    checkoutData.items = cart.map((item) => ({
      name: item.name,
      price: parseFloat(String(item.price).replace(/[$,]/g, "")) || 0,
      img: item.img || "",
      qty: item.qty || 1,
    }));
  }

  renderOrderSummary();
}

function renderOrderSummary() {
  const container = document.getElementById("checkoutItems");
  if (!container) return;

  if (checkoutData.items.length === 0) {
    container.innerHTML =
      '<p style="color:#999;font-size:.875rem;">No hay productos en el pedido.</p>';
    updateSummaryTotals(0);
    return;
  }

  let total = 0;
  container.innerHTML = checkoutData.items
    .map((item) => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;
      return `
        <div class="checkout-order-item">
          <img src="${item.img}" alt="${item.name}" onerror="this.style.opacity=0">
          <div class="checkout-order-item-info">
            <span class="checkout-order-name">${item.name}</span>
            <span class="checkout-order-meta">x${item.qty} &middot; $${item.price.toLocaleString()} c/u</span>
          </div>
          <span class="checkout-order-total">$${itemTotal.toLocaleString()}</span>
        </div>`;
    })
    .join("");

  checkoutData.total = total;
  updateSummaryTotals(total);
}

function updateSummaryTotals(total) {
  const sub = document.getElementById("checkoutSubtotal");
  const tot = document.getElementById("checkoutTotal");
  if (sub) sub.textContent = "$" + total.toLocaleString();
  if (tot) tot.textContent = "$" + total.toLocaleString();
}

// ──────────────────────── Control de pasos ────────────────────

function showCheckoutStep(n) {
  for (let i = 1; i <= 3; i++) {
    const panel = document.getElementById(`checkout-step-${i}`);
    const indicator = document.getElementById(`step-indicator-${i}`);
    if (panel) panel.classList.toggle("hidden", i !== n);
    if (indicator) {
      indicator.classList.toggle("active", i === n);
      indicator.classList.toggle("done", i < n);
    }
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ──────────────────── Paso 1: Datos personales ────────────────

function setupPersonalForm() {
  const form = document.getElementById("form-personal");
  if (!form) return;

  form.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () =>
      input.classList.remove("input-error"),
    );
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validatePersonalForm()) return;
    checkoutData.personal = {
      nombre: document.getElementById("chkNombre").value.trim(),
      apellido: document.getElementById("chkApellido").value.trim(),
      email: document.getElementById("chkEmail").value.trim(),
      telefono: document.getElementById("chkTelefono").value.trim(),
      direccion: document.getElementById("chkDireccion").value.trim(),
      ciudad: document.getElementById("chkCiudad").value.trim(),
      cp: document.getElementById("chkCP").value.trim(),
    };
    showCheckoutStep(2);
  });
}

function validatePersonalForm() {
  let valid = true;
  ["chkNombre", "chkApellido", "chkEmail", "chkDireccion", "chkCiudad"].forEach(
    (id) => {
      const el = document.getElementById(id);
      if (!el || !el.value.trim()) {
        el?.classList.add("input-error");
        valid = false;
      }
    },
  );
  const email = document.getElementById("chkEmail");
  if (
    email &&
    email.value.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
  ) {
    email.classList.add("input-error");
    valid = false;
  }
  if (!valid)
    showChkError(
      "form-personal",
      "Completa todos los campos obligatorios correctamente.",
    );
  return valid;
}

// ──────────────────────── Paso 2: Pago ───────────────────────

function setupPaymentForm() {
  setupCardInputs();
  const form = document.getElementById("form-payment");
  if (!form) return;
  form.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () =>
      input.classList.remove("input-error"),
    );
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validatePaymentForm()) return;
    await processPayment();
  });
}

function setupCardInputs() {
  const numInput = document.getElementById("chkCardNumber");
  const holderInput = document.getElementById("chkCardHolder");
  const expiryInput = document.getElementById("chkCardExpiry");
  const cvvInput = document.getElementById("chkCardCvv");
  const card = document.getElementById("creditCard");

  if (numInput) {
    numInput.addEventListener("input", () => {
      const raw = numInput.value.replace(/\D/g, "").substring(0, 16);
      numInput.value = raw.match(/.{1,4}/g)?.join(" ") || "";
      const padded = raw.padEnd(16, "•");
      const formatted =
        padded.match(/.{1,4}/g)?.join(" ") || "•••• •••• •••• ••••";
      const display = document.getElementById("cardNumberDisplay");
      if (display) display.textContent = formatted;
      updateCardNetwork(raw, card);
    });
  }

  if (holderInput) {
    holderInput.addEventListener("input", () => {
      const display = document.getElementById("cardHolderDisplay");
      if (display)
        display.textContent = holderInput.value.toUpperCase() || "TU NOMBRE";
    });
  }

  if (expiryInput) {
    expiryInput.addEventListener("input", () => {
      let raw = expiryInput.value.replace(/\D/g, "").substring(0, 4);
      if (raw.length > 2) raw = raw.slice(0, 2) + "/" + raw.slice(2);
      expiryInput.value = raw;
      const display = document.getElementById("cardExpiryDisplay");
      if (display) display.textContent = raw || "MM/AA";
    });
  }

  if (cvvInput && card) {
    cvvInput.addEventListener("focus", () => card.classList.add("flipped"));
    cvvInput.addEventListener("blur", () => card.classList.remove("flipped"));
    cvvInput.addEventListener("input", () => {
      const raw = cvvInput.value.replace(/\D/g, "").substring(0, 4);
      cvvInput.value = raw;
      const display = document.getElementById("cardCvvDisplay");
      if (display) display.textContent = raw || "•••";
    });
  }
}

function updateCardNetwork(number, card) {
  if (!card) return;
  card.classList.remove("visa", "mastercard", "amex");
  const networkEl = document.getElementById("cardNetworkDisplay");
  if (/^4/.test(number)) {
    card.classList.add("visa");
    if (networkEl) networkEl.textContent = "VISA";
  } else if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) {
    card.classList.add("mastercard");
    if (networkEl) networkEl.textContent = "MASTERCARD";
  } else if (/^3[47]/.test(number)) {
    card.classList.add("amex");
    if (networkEl) networkEl.textContent = "AMEX";
  } else {
    if (networkEl) networkEl.textContent = "";
  }
}

function validatePaymentForm() {
  let valid = true;

  const numInput = document.getElementById("chkCardNumber");
  const digits = (numInput?.value || "").replace(/\s/g, "");
  if (digits.length !== 16) {
    numInput?.classList.add("input-error");
    valid = false;
  }

  const holderInput = document.getElementById("chkCardHolder");
  if (!holderInput?.value.trim() || holderInput.value.trim().length < 3) {
    holderInput?.classList.add("input-error");
    valid = false;
  }

  const expiryInput = document.getElementById("chkCardExpiry");
  const parts = (expiryInput?.value || "").split("/");
  const mm = parseInt(parts[0]);
  const yy = parseInt(parts[1] || "0");
  const year = 2000 + yy;
  const now = new Date();
  const validExpiry =
    mm >= 1 &&
    mm <= 12 &&
    (year > now.getFullYear() ||
      (year === now.getFullYear() && mm >= now.getMonth() + 1));
  if (!validExpiry) {
    expiryInput?.classList.add("input-error");
    valid = false;
  }

  const cvvInput = document.getElementById("chkCardCvv");
  if ((cvvInput?.value || "").replace(/\D/g, "").length < 3) {
    cvvInput?.classList.add("input-error");
    valid = false;
  }

  if (!valid) showChkError("form-payment", "Verifica los datos de tu tarjeta.");
  return valid;
}

async function processPayment() {
  const btn = document.getElementById("payBtn");
  if (btn) {
    btn.innerHTML = '<span class="btn-spinner"></span> Procesando...';
    btn.disabled = true;
  }

  // Simular 2 segundos de procesamiento
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Vaciar el carrito
  localStorage.removeItem("cellstore_cart");
  if (typeof updateCartCount === "function") updateCartCount();

  // Poblar pantalla de éxito
  const { personal, items, total } = checkoutData;
  if (personal) {
    const nameEl = document.getElementById("successName");
    const emailEl = document.getElementById("successEmail");
    if (nameEl) nameEl.textContent = `${personal.nombre} ${personal.apellido}`;
    if (emailEl) emailEl.textContent = personal.email;
  }

  const successItems = document.getElementById("successItems");
  if (successItems) {
    successItems.innerHTML = items
      .map(
        (item) =>
          `<li><span>${item.name} &times; ${item.qty}</span><span>$${(item.price * item.qty).toLocaleString()}</span></li>`,
      )
      .join("");
  }

  const totalEl = document.getElementById("successTotal");
  if (totalEl) totalEl.textContent = "$" + total.toLocaleString();

  showCheckoutStep(3);
}

// ─────────────────────────── Utilidades ───────────────────────

function showChkError(formId, message) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.querySelector(".chk-error-msg")?.remove();
  const msg = document.createElement("p");
  msg.className = "chk-error-msg";
  msg.textContent = message;
  form.insertBefore(msg, form.firstChild);
  setTimeout(() => msg.remove(), 4000);
}
