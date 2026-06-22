// ==================== CONFIGURACIÓN SUPABASE ====================

const SUPABASE_CONFIG = {
  url: "https://zzpvzpoqaewzbcadsfol.supabase.co",
  key: "sb_publishable_8IeQAHEHkj-pmIgpNLUJrA_MqeSn0DC",
  table: "productos",
};

// ==================== FUNCIONES PARA CARGAR PRODUCTOS EN INDEX ====================

async function renderProductosEnIndex() {
  try {
    const products = await getProductsFromSupabase();

    // Cargar productos destacados
    const destacadosContainer = document.getElementById("productosDestacados");
    if (destacadosContainer && products.length > 0) {
      const html = products
        .map(
          (p) => `
        <a href="producto.html" class="producto-card">
          <img src="${p.imagen || "https://tienda.personal.com.ar/images/720/webp/Samsung-Galaxy-A07-Verde_1764179117200024927.png"}" alt="${p.nombre}" width="200">
          <h3>${p.nombre}</h3>
          <p class="precio">$${p.precio}</p>
          <p>${p.marca || ""}, ${p.almacenamiento || ""}, Pantalla ${p.pantalla || ""}</p>
          <button>Agregar al carrito</button>
        </a>
      `,
        )
        .join("");
      destacadosContainer.innerHTML = html;
    }

    // Cargar productos en oferta
    const ofertasContainer = document.getElementById("productosOfertas");
    if (ofertasContainer) {
      const ofertasFiltered = products.filter((p) => p.oferta === true);
      if (ofertasFiltered.length > 0) {
        const html = ofertasFiltered
          .map(
            (p) => `
          <a href="producto.html" class="producto-card">
            <img src="${p.imagen || "https://tienda.personal.com.ar/images/720/webp/Samsung-Galaxy-A07-Verde_1764179117200024927.png"}" alt="${p.nombre}" width="200">
            <h3>${p.nombre}</h3>
            <p class="precio">$${p.precio}</p>
            <p>${p.marca || ""}, ${p.almacenamiento || ""}, Pantalla ${p.pantalla || ""}</p>
            <button>Agregar al carrito</button>
          </a>
        `,
          )
          .join("");
        ofertasContainer.innerHTML = html;
      } else {
        ofertasContainer.innerHTML =
          '<p style="grid-column: 1/-1; text-align: center;">No hay ofertas disponibles</p>';
      }
    }

    // Agregar listeners a todos los botones después de renderizar
    document.querySelectorAll(".producto-card button").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const card = this.closest(".producto-card");
        const name = card.querySelector("h3").textContent;
        const price = card.querySelector(".precio").textContent;
        const details = card.querySelectorAll("p")[1]?.textContent || "";
        const img = card.querySelector("img").src;
        addToCart(name, price, details, img);
      });
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}

// ==================== FUNCIONES DE SUPABASE ====================

async function getProductsFromSupabase() {
  try {
    const response = await fetch(
      `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.table}?select=*`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_CONFIG.key}`,
          apikey: SUPABASE_CONFIG.key,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error al obtener productos. Status:", response.status);
      console.error("Respuesta:", errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const products = await response.json();
    console.log("Productos obtenidos de Supabase:", products);
    return products || [];
  } catch (error) {
    console.error("Error al obtener productos de Supabase:", error);
    // Fallback a localStorage si Supabase falla
    return getDefaultProducts();
  }
}

async function saveProductToSupabase(product) {
  try {
    // Validar datos antes de enviar
    if (!product.nombre || !product.precio || product.stock === undefined) {
      throw new Error("Faltan campos obligatorios: nombre, precio, stock");
    }

    // Preparar datos válidos para Supabase
    const dataToSend = {
      nombre: String(product.nombre).trim(),
      marca: String(product.marca || "").trim(),
      precio: parseFloat(product.precio),
      stock: parseInt(product.stock),
      almacenamiento: String(product.almacenamiento || "").trim(),
      pantalla: String(product.pantalla || "").trim(),
      color: String(product.color || "").trim(),
      imagen: String(product.imagen || "").trim(),
      descripcion: String(product.descripcion || "").trim(),
      oferta: Boolean(product.oferta),
    };

    // Validar que precio y stock sean números válidos
    if (isNaN(dataToSend.precio) || dataToSend.precio < 0) {
      throw new Error("Precio debe ser un número válido");
    }
    if (isNaN(dataToSend.stock) || dataToSend.stock < 0) {
      throw new Error("Stock debe ser un número válido");
    }

    if (product.id) {
      // Actualizar producto existente
      const response = await fetch(
        `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.table}?id=eq.${product.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_CONFIG.key}`,
            apikey: SUPABASE_CONFIG.key,
            Prefer: "return=representation",
          },
          body: JSON.stringify(dataToSend),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Respuesta del servidor:", errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      console.log("Producto actualizado en Supabase");
      removeLoadingMessage();
      return await response.json();
    } else {
      // Insertar nuevo producto
      const response = await fetch(
        `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.table}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_CONFIG.key}`,
            apikey: SUPABASE_CONFIG.key,
            Prefer: "return=representation",
          },
          body: JSON.stringify(dataToSend),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Respuesta del servidor:", errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      console.log("Producto guardado en Supabase");
      removeLoadingMessage();
      return await response.json();
    }
  } catch (error) {
    console.error("Error al guardar producto en Supabase:", error);
    removeLoadingMessage();
    throw error;
  }
}

async function deleteProductFromSupabase(productId) {
  try {
    const response = await fetch(
      `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.table}?id=eq.${productId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_CONFIG.key}`,
          apikey: SUPABASE_CONFIG.key,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error al eliminar. Status:", response.status);
      console.error("Respuesta:", errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    console.log("Producto eliminado de Supabase");
    removeLoadingMessage();
    return true;
  } catch (error) {
    console.error("Error al eliminar producto de Supabase:", error);
    removeLoadingMessage();
    throw error;
  }
}

// ==================== FUNCIONES GLOBALES ====================

function toggleMenu() {
  const mainNav = document.getElementById("mainNav");
  if (mainNav) {
    mainNav.classList.toggle("active");
  }
}

function getCart() {
  return JSON.parse(localStorage.getItem("cellstore_cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cellstore_cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  const countEl = document.getElementById("cart-count");
  if (countEl) {
    countEl.textContent = `(${total})`;
  }
}

// ==================== FUNCIONES DE CARRITO ====================

function parsePrice(priceStr) {
  return parseFloat(priceStr.replace(/[$,]/g, "")) || 0;
}

function formatPrice(num) {
  return "$" + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function changeQty(index, delta) {
  const cart = getCart();
  if (cart[index]) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }
    saveCart(cart);
    renderCart();
  }
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

function clearCart() {
  if (confirm("¿Estás seguro de vaciar el carrito?")) {
    localStorage.removeItem("cellstore_cart");
    updateCartCount();
    renderCart();
  }
}

function renderCart() {
  const cart = getCart();
  const content = document.getElementById("cart-content");
  if (!content) return;

  if (cart.length === 0) {
    content.innerHTML = `
            <div class="empty-cart">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                <p>Tu carrito está vacío</p>
                <a href="index.html">Ir a comprar productos</a>
            </div>
        `;
    return;
  }

  let subtotal = 0;
  let rows = "";

  cart.forEach((item, index) => {
    const price = parsePrice(item.price);
    const itemTotal = price * item.qty;
    subtotal += itemTotal;

    rows += `
            <tr>
                <td><img src="${item.img}" alt="${item.name}"></td>
                <td>
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-details">${item.details}</div>
                </td>
                <td>${item.price}</td>
                <td>
                    <div class="qty-controls">
                        <button onclick="changeQty(${index}, -1)">−</button>
                        <span>${item.qty}</span>
                        <button onclick="changeQty(${index}, 1)">+</button>
                    </div>
                </td>
                <td><strong>${formatPrice(itemTotal)}</strong></td>
                <td><button class="remove-btn" onclick="removeItem(${index})">Eliminar</button></td>
            </tr>
        `;
  });

  const tax = subtotal * 0.21;
  const total = subtotal + tax;

  content.innerHTML = `
        <table class="cart-table">
            <thead>
                <tr>
                    <th>Imagen</th>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
        <div class="cart-summary">
            <p>Subtotal: <strong>${formatPrice(subtotal)}</strong></p>
            <p>IVA (21%): <strong>${formatPrice(tax)}</strong></p>
            <p class="total">Total: <strong>${formatPrice(total)}</strong></p>
            <button onclick="alert('¡Compra realizada con éxito!')">Finalizar Compra</button>
            <button class="clear-cart-btn" onclick="clearCart()">Vaciar Carrito</button>
        </div>
    `;
}

function addToCart(name, price, details, img) {
  const cart = getCart();
  const existing = cart.find((item) => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, details, img, qty: 1 });
  }
  saveCart(cart);
  const btn = event.target;
  const originalText = btn.textContent;
  btn.textContent = "✓ Agregado";
  btn.style.backgroundColor = "#27ae60";
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.backgroundColor = "";
  }, 1500);
}

// ==================== FUNCIONES DE PRODUCTO ====================

function changeImage(thumb) {
  const mainImage = document.getElementById("mainImage");
  if (mainImage) {
    mainImage.src = thumb.src;
    document
      .querySelectorAll(".thumbnail")
      .forEach((t) => t.classList.remove("active"));
    thumb.classList.add("active");
  }
}

function selectOption(btn) {
  btn.parentElement
    .querySelectorAll(".option-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
}

function changeProductQty(delta) {
  const input = document.getElementById("productQty");
  if (input) {
    let val = parseInt(input.value) + delta;
    if (val < 1) val = 1;
    if (val > 10) val = 10;
    input.value = val;
  }
}

function addProductToCart() {
  const qty = parseInt(document.getElementById("productQty").value);
  const cart = getCart();
  const existing = cart.find((item) => item.name === "Samsung Galaxy S24");
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      name: "Samsung Galaxy S24",
      price: "$899",
      details: 'Samsung, 128GB, Pantalla 6.2"',
      img: "https://tienda.personal.com.ar/images/720/webp/Samsung-Galaxy-A07-Verde_1764179117200024927.png",
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

function switchTab(event, tabId) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .querySelectorAll(".tab-content")
    .forEach((content) => content.classList.add("hidden"));
  event.target.classList.add("active");
  document.getElementById(tabId).classList.remove("hidden");
}

// ==================== FUNCIONES DE LOGIN ====================

function togglePassword() {
  const input = document.getElementById("password");
  const icon = document.getElementById("eyeIcon");
  if (input && icon) {
    if (input.type === "password") {
      input.type = "text";
      icon.innerHTML =
        '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
    } else {
      input.type = "password";
      icon.innerHTML =
        '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    }
  }
}

function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("loginError");

  if (username === "admin" && password === "1234") {
    localStorage.setItem("cellstore_admin", "true");
    window.location.href = "admin.html";
  } else {
    if (errorEl) {
      errorEl.textContent = "Usuario o contraseña incorrectos";
      errorEl.style.display = "block";
    }
  }
}

function handleLogout() {
  localStorage.removeItem("cellstore_admin");
  window.location.href = "login.html";
}

// ==================== FUNCIONES DE ADMIN ====================

function showSection(sectionId) {
  document
    .querySelectorAll(".section")
    .forEach((s) => s.classList.add("hidden"));
  const section = document.getElementById("section-" + sectionId);
  if (section) {
    section.classList.remove("hidden");
  }
  document
    .querySelectorAll(".admin-nav-btn")
    .forEach((b) => b.classList.remove("active"));
  if (event && event.target && event.target.closest(".admin-nav-btn")) {
    event.target.closest(".admin-nav-btn").classList.add("active");
  }
}

function getDefaultProducts() {
  return [
    {
      nombre: "iPhone 15 Pro",
      marca: "Apple",
      precio: 999,
      stock: 25,
      almacenamiento: "256 GB",
      pantalla: '6.1"',
      color: "Negro",
      imagen:
        "https://tienda.personal.com.ar/images/720/webp/Samsung-Galaxy-A07-Verde_1764179117200024927.png",
      descripcion: "El último iPhone con chip A17 Pro y cámara de 48MP.",
      oferta: false,
    },
    {
      nombre: "Samsung Galaxy S24",
      marca: "Samsung",
      precio: 899,
      stock: 30,
      almacenamiento: "128 GB",
      pantalla: '6.2"',
      color: "Verde",
      imagen:
        "https://tienda.personal.com.ar/images/720/webp/Samsung-Galaxy-A07-Verde_1764179117200024927.png",
      descripcion: "Smartphone premium con cámara de 50MP.",
      oferta: true,
    },
    {
      nombre: "Google Pixel 8",
      marca: "Google",
      precio: 699,
      stock: 15,
      almacenamiento: "128 GB",
      pantalla: '6.3"',
      color: "Azul",
      imagen:
        "https://tienda.personal.com.ar/images/720/webp/Samsung-Galaxy-A07-Verde_1764179117200024927.png",
      descripcion: "Experiencia Android pura con IA avanzada.",
      oferta: false,
    },
    {
      nombre: "Motorola Edge 40",
      marca: "Motorola",
      precio: 499,
      stock: 40,
      almacenamiento: "256 GB",
      pantalla: '6.5"',
      color: "Negro",
      imagen:
        "https://tienda.personal.com.ar/images/720/webp/Samsung-Galaxy-A07-Verde_1764179117200024927.png",
      descripcion: "Rendimiento y estilo a excelente precio.",
      oferta: false,
    },
  ];
}

function getProducts() {
  const products = localStorage.getItem("cellstore_products");
  if (!products) {
    localStorage.setItem(
      "cellstore_products",
      JSON.stringify(getDefaultProducts()),
    );
    return getDefaultProducts();
  }
  return JSON.parse(products);
}

async function getProductsAsync() {
  try {
    const supabaseProducts = await getProductsFromSupabase();
    if (supabaseProducts && supabaseProducts.length > 0) {
      return supabaseProducts;
    }
  } catch (error) {
    console.log("Usando productos locales como fallback");
  }
  return getProducts();
}

function saveProducts(products) {
  localStorage.setItem("cellstore_products", JSON.stringify(products));
  renderProducts();
}

async function saveProductsAsync(product, isEditing = false) {
  try {
    // Mostrar indicador de carga
    showLoadingMessage("Guardando producto...");

    const result = await saveProductToSupabase(product);
    showSuccessMessage("Producto guardado exitosamente");
    await renderProductsFromSupabase();
    return result;
  } catch (error) {
    console.error("Error al guardar producto:", error);
    showErrorMessage("Error al guardar el producto: " + error.message);
    throw error;
  }
}

async function deleteProductAsync(productId) {
  try {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      showLoadingMessage("Eliminando producto...");
      await deleteProductFromSupabase(productId);
      showSuccessMessage("Producto eliminado exitosamente");
      await renderProductsFromSupabase();
    }
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    showErrorMessage("Error al eliminar el producto: " + error.message);
  }
}

function renderProducts(filter = "") {
  const products = getProducts();
  const tbody = document.getElementById("productsBody");
  if (!tbody) return;

  const filtered = products.filter((p) =>
    p.nombre.toLowerCase().includes(filter.toLowerCase()),
  );

  if (filtered.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="no-products">No se encontraron productos</td></tr>';
    return;
  }

  tbody.innerHTML = filtered
    .map((p, i) => {
      const realIndex = products.indexOf(p);
      return `
            <tr>
                <td><img src="${p.imagen || ""}" alt="${p.nombre}" class="admin-img"></td>
                <td><strong>${p.nombre}</strong></td>
                <td>${p.marca}</td>
                <td>$${p.precio}</td>
                <td>${p.stock}</td>
                <td>
                    <button class="btn-edit" onclick="editProduct(${realIndex})">Editar</button>
                    <button class="btn-delete" onclick="deleteProduct(${realIndex})">Eliminar</button>
                </td>
            </tr>
        `;
    })
    .join("");
}

async function renderProductsFromSupabase(filter = "") {
  try {
    const products = await getProductsFromSupabase();
    const tbody = document.getElementById("productsBody");
    if (!tbody) return;

    const filtered = products.filter(
      (p) => p.nombre && p.nombre.toLowerCase().includes(filter.toLowerCase()),
    );

    if (filtered.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="no-products">No se encontraron productos</td></tr>';
      return;
    }

    tbody.innerHTML = filtered
      .map(
        (p) => `
            <tr>
                <td><img src="${p.imagen || ""}" alt="${p.nombre}" class="admin-img"></td>
                <td><strong>${p.nombre}</strong></td>
                <td>${p.marca || ""}</td>
                <td>$${p.precio}</td>
                <td>${p.stock}</td>
                <td>
                    <button class="btn-edit" onclick="editProductFromSupabase(${p.id})">Editar</button>
                    <button class="btn-delete" onclick="deleteProductFromSupabaseUI(${p.id})">Eliminar</button>
                </td>
            </tr>
        `,
      )
      .join("");
  } catch (error) {
    console.error("Error al cargar productos:", error);
    document.getElementById("productsBody").innerHTML =
      '<tr><td colspan="6" class="no-products">Error al cargar productos</td></tr>';
  }
}

function filterProducts() {
  const search = document.getElementById("searchProducts").value;
  renderProducts(search);
}

async function filterProductsFromSupabase() {
  const search = document.getElementById("searchProducts").value;
  await renderProductsFromSupabase(search);
}

// ==================== FUNCIONES DE MENSAJES ====================

function showLoadingMessage(message = "Cargando...") {
  const div = document.createElement("div");
  div.id = "loading-msg";
  div.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #007bff;
        color: white;
        padding: 20px 40px;
        border-radius: 8px;
        z-index: 9999;
        text-align: center;
    `;
  div.textContent = message;
  document.body.appendChild(div);
}

function showSuccessMessage(message, duration = 3000) {
  const div = document.createElement("div");
  div.id = "success-msg";
  div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 9999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
  div.textContent = message;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), duration);
}

function showErrorMessage(message, duration = 5000) {
  const div = document.createElement("div");
  div.id = "error-msg";
  div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 9999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
  div.textContent = message;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), duration);
}

function removeLoadingMessage() {
  const loadingMsg = document.getElementById("loading-msg");
  if (loadingMsg) loadingMsg.remove();
}

function editProduct(index) {
  const products = getProducts();
  const p = products[index];
  document.getElementById("editIndex").value = index;
  document.getElementById("formTitle").textContent = "Editar Producto";
  document.getElementById("prodNombre").value = p.nombre;
  document.getElementById("prodMarca").value = p.marca;
  document.getElementById("prodPrecio").value = p.precio;
  document.getElementById("prodStock").value = p.stock;
  document.getElementById("prodAlmacenamiento").value = p.almacenamiento;
  document.getElementById("prodPantalla").value = p.pantalla;
  document.getElementById("prodColor").value = p.color;
  document.getElementById("prodImagen").value = p.imagen || "";
  document.getElementById("prodDescripcion").value = p.descripcion;
  document.getElementById("prodOferta").checked = p.oferta || false;
  showSection("add-product");
  document
    .querySelectorAll(".admin-nav-btn")
    .forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".admin-nav-btn")[1].classList.add("active");
}

async function editProductFromSupabase(productId) {
  try {
    const products = await getProductsFromSupabase();
    const p = products.find((prod) => prod.id === productId);
    if (!p) {
      throw new Error("Producto no encontrado");
    }

    document.getElementById("editIndex").value = productId;
    document.getElementById("formTitle").textContent = "Editar Producto";
    document.getElementById("prodNombre").value = p.nombre;
    document.getElementById("prodMarca").value = p.marca || "";
    document.getElementById("prodPrecio").value = p.precio;
    document.getElementById("prodStock").value = p.stock;
    document.getElementById("prodAlmacenamiento").value =
      p.almacenamiento || "";
    document.getElementById("prodPantalla").value = p.pantalla || "";
    document.getElementById("prodColor").value = p.color || "";
    document.getElementById("prodImagen").value = p.imagen || "";
    document.getElementById("prodDescripcion").value = p.descripcion || "";
    document.getElementById("prodOferta").checked = p.oferta || false;
    showSection("add-product");
    document
      .querySelectorAll(".admin-nav-btn")
      .forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".admin-nav-btn")[1].classList.add("active");
  } catch (error) {
    console.error("Error al cargar producto:", error);
    showErrorMessage("Error al cargar el producto: " + error.message);
  }
}

function deleteProduct(index) {
  if (confirm("¿Estás seguro de eliminar este producto?")) {
    const products = getProducts();
    products.splice(index, 1);
    saveProducts(products);
  }
}

async function deleteProductFromSupabaseUI(productId) {
  if (confirm("¿Estás seguro de eliminar este producto?")) {
    try {
      showLoadingMessage("Eliminando producto...");
      await deleteProductFromSupabase(productId);
      showSuccessMessage("Producto eliminado exitosamente");
      await renderProductsFromSupabase();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      showErrorMessage("Error al eliminar el producto: " + error.message);
    }
  }
}

function saveProduct(event) {
  event.preventDefault();
  const products = getProducts();
  const index = parseInt(document.getElementById("editIndex").value);

  const product = {
    nombre: document.getElementById("prodNombre").value,
    marca: document.getElementById("prodMarca").value,
    precio: parseFloat(document.getElementById("prodPrecio").value),
    stock: parseInt(document.getElementById("prodStock").value),
    almacenamiento: document.getElementById("prodAlmacenamiento").value,
    pantalla: document.getElementById("prodPantalla").value,
    color: document.getElementById("prodColor").value,
    imagen: document.getElementById("prodImagen").value,
    descripcion: document.getElementById("prodDescripcion").value,
    oferta: document.getElementById("prodOferta").checked,
  };

  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }

  saveProducts(products);
  resetForm();
  showSection("products");
  document
    .querySelectorAll(".admin-nav-btn")
    .forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".admin-nav-btn")[0].classList.add("active");
}

async function saveProductAsync(event) {
  event.preventDefault();
  try {
    const editId = document.getElementById("editIndex").value;

    const product = {
      nombre: document.getElementById("prodNombre").value,
      marca: document.getElementById("prodMarca").value,
      precio: parseFloat(document.getElementById("prodPrecio").value),
      stock: parseInt(document.getElementById("prodStock").value),
      almacenamiento: document.getElementById("prodAlmacenamiento").value,
      pantalla: document.getElementById("prodPantalla").value,
      color: document.getElementById("prodColor").value,
      imagen: document.getElementById("prodImagen").value,
      descripcion: document.getElementById("prodDescripcion").value,
      oferta: document.getElementById("prodOferta").checked,
    };

    if (editId && editId !== "-1") {
      product.id = parseInt(editId);
    }

    await saveProductToSupabase(product);
    showSuccessMessage("Producto guardado exitosamente");
    resetForm();
    showSection("products");
    document
      .querySelectorAll(".admin-nav-btn")
      .forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".admin-nav-btn")[0].classList.add("active");
    await renderProductsFromSupabase();
  } catch (error) {
    console.error("Error al guardar producto:", error);
    showErrorMessage("Error al guardar el producto: " + error.message);
  }
}

function resetForm() {
  const form = document.getElementById("productForm");
  if (form) {
    form.reset();
    document.getElementById("editIndex").value = -1;
    document.getElementById("formTitle").textContent = "Agregar Nuevo Producto";
  }
}

// ==================== FUNCIONES PARA GALERÍA HOME ====================

function saveHeroImage(heroNumber) {
  try {
    const urlInput = document.getElementById(`heroUrl${heroNumber}`);
    const preview = document.getElementById(`heroPreview${heroNumber}`);

    if (!urlInput.value.trim()) {
      showErrorMessage("Por favor ingresa una URL válida");
      return;
    }

    // Validar que sea una URL válida
    try {
      new URL(urlInput.value);
    } catch (e) {
      showErrorMessage("URL inválida");
      return;
    }

    // Guardar en localStorage
    localStorage.setItem(`cellstore_hero${heroNumber}`, urlInput.value);

    // Actualizar preview
    preview.src = urlInput.value;
    preview.onerror = function () {
      showErrorMessage("No se pudo cargar la imagen. Verifica la URL.");
      preview.src = urlInput.value; // Mantener la anterior
    };

    showSuccessMessage(`Imagen Hero ${heroNumber} guardada correctamente`);
  } catch (error) {
    console.error("Error al guardar imagen:", error);
    showErrorMessage("Error al guardar la imagen");
  }
}

function resetGalleryToDefaults() {
  if (
    confirm("¿Estás seguro de que deseas restaurar las imágenes por defecto?")
  ) {
    localStorage.removeItem("cellstore_hero1");
    localStorage.removeItem("cellstore_hero2");

    document.getElementById("heroUrl1").value =
      "https://tiendaonline.movistar.com.ar/media/wysiwyg/home/movistar/CF_abril-d.jpg";
    document.getElementById("heroUrl2").value =
      "https://tiendaonline.movistar.com.ar/media/wysiwyg/home/movistar/otono164-d.jpg";

    document.getElementById("heroPreview1").src =
      "https://tiendaonline.movistar.com.ar/media/wysiwyg/home/movistar/CF_abril-d.jpg";
    document.getElementById("heroPreview2").src =
      "https://tiendaonline.movistar.com.ar/media/wysiwyg/home/movistar/otono164-d.jpg";

    showSuccessMessage("Imágenes restauradas a valores por defecto");
  }
}

function loadHeroImages() {
  // Cargar imágenes guardadas en localStorage
  const hero1Url =
    localStorage.getItem("cellstore_hero1") ||
    "https://tiendaonline.movistar.com.ar/media/wysiwyg/home/movistar/CF_abril-d.jpg";
  const hero2Url =
    localStorage.getItem("cellstore_hero2") ||
    "https://tiendaonline.movistar.com.ar/media/wysiwyg/home/movistar/otono164-d.jpg";

  // Aplicar a las imágenes específicas del home
  const hero1 = document.getElementById("hero1");
  const hero2 = document.getElementById("hero2");

  if (hero1) {
    hero1.src = hero1Url;
    hero1.onerror = function () {
      this.src =
        "https://tiendaonline.movistar.com.ar/media/wysiwyg/home/movistar/CF_abril-d.jpg";
    };
  }

  if (hero2) {
    hero2.src = hero2Url;
    hero2.onerror = function () {
      this.src =
        "https://tiendaonline.movistar.com.ar/media/wysiwyg/home/movistar/otono164-d.jpg";
    };
  }
}

// ==================== INICIALIZACIÓN ====================

document.addEventListener("DOMContentLoaded", () => {
  // Actualizar carrito en todas las páginas
  updateCartCount();

  // Cargar imágenes hero del home
  if (document.getElementById("hero1") || document.getElementById("hero2")) {
    loadHeroImages();
  }

  // Para página de índice - cargar productos de Supabase
  if (document.getElementById("productosDestacados")) {
    renderProductosEnIndex();
  }

  // Para página de admin
  if (localStorage.getItem("cellstore_admin") === "true") {
    const adminSection = document.getElementById("section-products");
    if (adminSection) {
      // Cargar productos de Supabase
      renderProductsFromSupabase();

      // Actualizar form de productos para usar Supabase
      const productForm = document.getElementById("productForm");
      if (productForm) {
        productForm.onsubmit = saveProductAsync;
      }
    }
  }

  // Para página de login
  if (window.location.pathname.includes("login.html")) {
    if (localStorage.getItem("cellstore_admin") === "true") {
      window.location.href = "admin.html";
    }
  }

  // Proteger página de admin
  if (document.querySelector(".admin-main")) {
    if (localStorage.getItem("cellstore_admin") !== "true") {
      window.location.href = "login.html";
    }
  }

  // Para página de carrito
  if (document.getElementById("cart-content")) {
    renderCart();
  }
});
