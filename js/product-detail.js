let currentProduct = null;

function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function loadProductDetail() {
  try {
    const productId = getProductIdFromUrl();
    if (!productId) {
      document.querySelector(".product-page").innerHTML =
        '<p style="text-align:center;padding:2rem;color:#666;">Producto no especificado</p>';
      return;
    }

    const products = await getProductsFromSupabase();
    const product = products.find((p) => String(p.id) === String(productId));

    if (!product) {
      document.querySelector(".product-page").innerHTML =
        '<p style="text-align:center;padding:2rem;color:#666;">Producto no encontrado</p>';
      return;
    }

    currentProduct = product;
    populateProductDetail(product);
    setupBuyNow();
    loadReviews(product);
  } catch (error) {
    console.error("Error al cargar producto:", error);
  }
}

function populateProductDetail(product) {
  const nameEl = document.getElementById("productName");
  if (nameEl) nameEl.textContent = product.nombre;

  document.title = product.nombre + " - CellStore";

  const mainImg = document.getElementById("mainImage");
  if (mainImg) {
    mainImg.src =
      product.imagen ||
      "https://tienda.personal.com.ar/images/720/webp/Samsung-Galaxy-A07-Verde_1764179117200024927.png";
    mainImg.alt = product.nombre;
  }

  document.querySelectorAll(".thumbnail").forEach((t) => {
    t.src =
      product.imagen ||
      "https://tienda.personal.com.ar/images/720/webp/Samsung-Galaxy-A07-Verde_1764179117200024927.png";
  });

  const badge = document.getElementById("productBadge");
  if (badge) {
    badge.textContent = product.oferta ? "Oferta" : "Nuevo";
  }

  const priceEl = document.getElementById("productPrice");
  if (priceEl) priceEl.textContent = `$${product.precio}`;

  const shortDesc = document.getElementById("productShortDesc");
  if (shortDesc) shortDesc.textContent = product.descripcion || "";

  const descContainer = document.getElementById("productDescription");
  if (descContainer) {
    if (product.descripcion) {
      const isHtml = /<[a-z][\s\S]*>/i.test(product.descripcion);
      descContainer.innerHTML = isHtml
        ? product.descripcion
        : `<p>${product.descripcion}</p>`;
    } else {
      descContainer.innerHTML = "<p>Sin descripción disponible.</p>";
    }
  }
}

function setupBuyNow() {
  const btn = document.getElementById("buyNowBtn");
  if (btn && currentProduct) {
    btn.addEventListener("click", () => {
      window.location.href = "compra.html?id=" + currentProduct.id;
    });
  }
}

// ==================== RESEÑAS (SUPABASE) ====================

async function getReviewsFromSupabase(productId) {
  try {
    const response = await fetch(
      `${SUPABASE_CONFIG.url}/rest/v1/compras?producto_id=eq.${productId}&order=created_at.desc`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_CONFIG.key}`,
          apikey: SUPABASE_CONFIG.key,
        },
      },
    );
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Error al cargar reseñas:", error);
    return [];
  }
}

function renderStars(rating) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-AR");
}

async function loadReviews(product) {
  const container = document.getElementById("reviewsContainer");
  if (!container) return;

  container.innerHTML = "<p>Cargando reseñas...</p>";

  const reviews = await getReviewsFromSupabase(product.id);

  if (reviews.length === 0) {
    container.innerHTML =
      '<p class="no-reviews">No hay reseñas todavía. ¡Sé el primero en opinar!</p>';
    return;
  }

  container.innerHTML = reviews
    .map(
      (r) => `
    <div class="review-item">
      <div class="review-header">
        <strong>${r.nombre} ${r.apellido || ""}</strong>
        <span class="review-stars">${renderStars(r.estrellas)}</span>
        <span class="review-date">${formatDate(r.created_at)}</span>
      </div>
      <p>${r.reseña}</p>
    </div>
  `,
    )
    .join("");
}

function addProductToCart() {
  if (!currentProduct) return;

  const qty = parseInt(document.getElementById("productQty").value) || 1;
  const cart = getCart();
  const existing = cart.find(
    (item) => item.name === currentProduct.nombre,
  );

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      name: currentProduct.nombre,
      price: `$${currentProduct.precio}`,
      details: `${currentProduct.marca || ""}, ${currentProduct.almacenamiento || ""}, Pantalla ${currentProduct.pantalla || ""}`,
      img:
        currentProduct.imagen ||
        "https://tienda.personal.com.ar/images/720/webp/Samsung-Galaxy-A07-Verde_1764179117200024927.png",
      qty: qty,
    });
  }

  saveCart(cart);

  const btn = document.querySelector(".btn-add-cart");
  if (btn) {
    const originalHTML = btn.innerHTML;
    btn.innerHTML = "✓ Agregado al carrito";
    btn.style.backgroundColor = "#27ae60";
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.backgroundColor = "";
    }, 1500);
  }
}

document.addEventListener("DOMContentLoaded", loadProductDetail);
