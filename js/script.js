// ==================== ESTADO GLOBAL ====================

let products = [];

// ==================== FUNCIONES PARA CARGAR PRODUCTOS EN INDEX ====================

async function renderProductosEnIndex() {
  try {
    console.log("🔄 Iniciando carga de productos...");
    products = await getProductsFromSupabase();
    console.log("✓ Productos cargados:", products.length);

    // Cargar productos destacados con paginación
    const destacadosContainer = document.getElementById("productosDestacados");
    if (destacadosContainer) {
      paginationManagers.destacados = new Pagination(products, 12);
      updatePaginatedContent("productosDestacados");
      console.log("✓ Productos destacados renderizados");
    } else {
      console.warn("⚠ No se encontró el contenedor de productos destacados");
    }

    // Cargar productos en oferta con paginación
    const ofertasContainer = document.getElementById("productosOfertas");
    if (ofertasContainer) {
      const productosEnOferta = products.filter((p) => p.oferta === true);

      if (productosEnOferta.length > 0) {
        paginationManagers.ofertas = new Pagination(productosEnOferta, 12);
        updatePaginatedContent("productosOfertas");
        console.log("✓ Ofertas renderizadas");
      } else {
        ofertasContainer.innerHTML =
          '<p style="grid-column: 1/-1; text-align: center;">No hay ofertas disponibles en este momento</p>';
        console.log("ℹ Sin ofertas activas");
      }
    }

    console.log("✓ Renderizado completado");
  } catch (error) {
    console.error("❌ Error al cargar productos:", error);
    const destacadosContainer = document.getElementById("productosDestacados");
    if (destacadosContainer) {
      destacadosContainer.innerHTML =
        '<p style="color: red;">Error al cargar productos. Por favor recarga la página.</p>';
    }
  }
}

// ==================== FUNCIONES DE SUPABASE ====================

async function getProductsFromSupabase() {
  // Productos de ejemplo siempre disponibles como base
  const seedBase =
    typeof SEED_PRODUCTS !== "undefined"
      ? SEED_PRODUCTS.map((p, i) => ({ id: `seed-${i + 1}`, ...p }))
      : [];

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
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const supabaseProducts = (await response.json()) || [];

    // Evitar duplicados: si un nombre de seed ya existe en Supabase, no se agrega
    const supabaseNames = new Set(
      supabaseProducts.map((p) => p.nombre?.toLowerCase()),
    );
    const uniqueSeed = seedBase.filter(
      (p) => !supabaseNames.has(p.nombre?.toLowerCase()),
    );

    return [...supabaseProducts, ...uniqueSeed];
  } catch (error) {
    console.error(
      "Error al obtener productos de Supabase, usando productos de ejemplo:",
      error,
    );
    return seedBase.length > 0 ? seedBase : getDefaultProducts();
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
            <button onclick="window.location.href='compra.html?from=carrito'" class="btn-primary">Finalizar Compra</button>
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
    localStorage.setItem(
      "cellstore_user",
      JSON.stringify({
        nombre: "Administrador",
        apellido: "",
        correo: "admin@cellstore.com",
      }),
    );
    window.location.href = "admin.html";
  } else {
    if (errorEl) {
      errorEl.textContent = "Usuario o contraseña incorrectos";
      errorEl.style.display = "block";
    }
  }
}

// ==================== FUNCIONES DE REGISTRO ====================

async function handleRegister(event) {
  event.preventDefault();
  console.log("📝 Procesando registro...");

  const nombre = document.getElementById("regNombre")?.value?.trim() || "";
  const apellido = document.getElementById("regApellido")?.value?.trim() || "";
  const dni = document.getElementById("regDni")?.value?.trim() || "";
  const correo = document.getElementById("regCorreo")?.value?.trim() || "";
  const errorEl = document.getElementById("registerError");

  console.log("Datos:", { nombre, apellido, dni, correo });

  // Validaciones
  if (!nombre || !apellido || !dni || !correo) {
    const msg = "Por favor completa todos los campos";
    console.warn("⚠", msg);
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = "block";
    }
    return;
  }

  if (!/^\d+$/.test(dni)) {
    const msg = "El DNI solo puede contener números";
    console.warn("⚠", msg);
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = "block";
    }
    return;
  }

  if (!correo.includes("@")) {
    const msg = "Por favor ingresa un correo válido";
    console.warn("⚠", msg);
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = "block";
    }
    return;
  }

  try {
    console.log("🔄 Enviando a Supabase...");

    // Guardar usuario en Supabase
    const response = await fetch(
      `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.table3}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_CONFIG.key,
          Authorization: `Bearer ${SUPABASE_CONFIG.key}`,
        },
        body: JSON.stringify({
          nombre: nombre,
          apellido: apellido,
          dni: dni,
          correo: correo,
        }),
      },
    );

    console.log("Respuesta de Supabase:", response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error("Error en respuesta:", error);
      throw new Error(`Error: ${response.status}`);
    }

    console.log("✓ Usuario registrado en Supabase");

    // Guardar en localStorage
    localStorage.setItem(
      "cellstore_user",
      JSON.stringify({
        nombre: nombre,
        apellido: apellido,
        correo: correo,
      }),
    );

    // Mostrar mensaje de éxito
    if (errorEl) {
      errorEl.style.display = "none";
    }

    alert("¡Registro exitoso! Bienvenido a CellStore.");

    // Limpiar formulario
    document.getElementById("registerForm").reset();

    // Redirigir al home
    setTimeout(() => {
      window.location.href = "index.html";
    }, 500);
  } catch (error) {
    console.error("❌ Error al registrar:", error);
    if (errorEl) {
      errorEl.textContent = "Error al registrar. Intenta nuevamente.";
      errorEl.style.display = "block";
    }
  }
}

function showLoginForm() {
  document.getElementById("loginForm").classList.add("form-active");
  document.getElementById("loginForm").classList.remove("hidden-form");
  document.getElementById("registerForm").classList.remove("form-active");
  document.getElementById("registerForm").classList.add("hidden-form");
  document.getElementById("tabLogin").classList.add("active");
  document.getElementById("tabRegister").classList.remove("active");
  document.getElementById("loginError").style.display = "none";
  document.getElementById("registerError").style.display = "none";
}

function showRegisterForm() {
  document.getElementById("registerForm").classList.add("form-active");
  document.getElementById("registerForm").classList.remove("hidden-form");
  document.getElementById("loginForm").classList.remove("form-active");
  document.getElementById("loginForm").classList.add("hidden-form");
  document.getElementById("tabRegister").classList.add("active");
  document.getElementById("tabLogin").classList.remove("active");
  document.getElementById("loginError").style.display = "none";
  document.getElementById("registerError").style.display = "none";
}

function handleLogout() {
  localStorage.removeItem("cellstore_admin");
  localStorage.removeItem("cellstore_user");
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
  // Cargar datos de secciones del home al abrir esa pestaña
  if (sectionId === "home-sections") {
    renderHomeSections();
  }
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
                    <button class="btn-edit" data-product-id="${p.id}">Editar</button>
                    <button class="btn-delete" data-product-id="${p.id}">Eliminar</button>
                </td>
            </tr>
        `,
      )
      .join("");

    // Agregar event listeners seguros
    tbody.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.dataset.productId;
        editProductFromSupabase(productId);
      });
    });

    tbody.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.dataset.productId;
        deleteProductFromSupabaseUI(productId);
      });
    });
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
  // Remover mensaje anterior si existe
  const existing = document.getElementById("loading-msg");
  if (existing) existing.remove();

  const div = document.createElement("div");
  div.id = "loading-msg";
  div.className = "notification notification-loading";
  div.textContent = message;
  document.body.appendChild(div);
}

function showSuccessMessage(message, duration = 3000) {
  const div = document.createElement("div");
  div.className = "notification notification-success";
  div.textContent = message;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), duration);
}

function showErrorMessage(message, duration = 5000) {
  const div = document.createElement("div");
  div.className = "notification notification-error";
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
    const p = products.find((prod) => String(prod.id) === String(productId));
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
      // Si el ID es numérico (Supabase), convertir; si es string (seed-N), mantener
      product.id = /^\d+$/.test(editId) ? parseInt(editId) : editId;
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

// ==================== FUNCIONES DE PÁGINA PRODUCTOS ====================

async function renderProductosPage() {
  const grid = document.getElementById("productosGrid");
  if (!grid) return;

  grid.innerHTML =
    '<p style="grid-column:1/-1;text-align:center;padding:2rem;">Cargando productos...</p>';
  products = await getProductsFromSupabase();

  // Leer parámetros de la URL
  const params = new URLSearchParams(window.location.search);
  const searchParam = params.get("search") || "";
  const marcaParam = params.get("marca") || "";

  if (searchParam) {
    const el = document.getElementById("filtroTexto");
    if (el) el.value = searchParam;
  }
  if (marcaParam) {
    const el = document.getElementById("filtroMarca");
    if (el) el.value = marcaParam;
  }

  aplicarFiltros();
}

function aplicarFiltros() {
  const grid = document.getElementById("productosGrid");
  if (!grid) return;

  const DEFAULT_IMG =
    "https://tienda.personal.com.ar/images/720/webp/Samsung-Galaxy-A07-Verde_1764179117200024927.png";
  const q = (document.getElementById("filtroTexto")?.value || "")
    .toLowerCase()
    .trim();
  const marca = document.getElementById("filtroMarca")?.value || "";
  const soloOfertas = document.getElementById("filtroOferta")?.value === "true";
  const orden = document.getElementById("filtroOrden")?.value || "";

  let filtered = products.filter((p) => {
    const matchQ =
      !q ||
      p.nombre?.toLowerCase().includes(q) ||
      p.marca?.toLowerCase().includes(q) ||
      p.descripcion?.toLowerCase().includes(q);
    const matchMarca = !marca || p.marca === marca;
    const matchOferta = !soloOfertas || p.oferta === true;
    return matchQ && matchMarca && matchOferta;
  });

  if (orden === "precio-asc") filtered.sort((a, b) => a.precio - b.precio);
  else if (orden === "precio-desc")
    filtered.sort((a, b) => b.precio - a.precio);
  else if (orden === "nombre-asc")
    filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));

  const countEl = document.getElementById("productosCount");
  if (countEl)
    countEl.textContent = `${filtered.length} producto${filtered.length !== 1 ? "s" : ""}`;

  if (filtered.length === 0) {
    grid.innerHTML =
      '<p style="grid-column:1/-1;text-align:center;padding:2rem;color:#666;">No se encontraron productos con esos filtros.</p>';
    // Limpiar controles de paginación
    const oldControls = document.getElementById("pagination-productosGrid");
    if (oldControls) oldControls.remove();
    return;
  }

  // Crear gestor de paginación
  paginationManagers.productos = new Pagination(filtered, 12);
  updatePaginatedContent("productosGrid");
}

function limpiarFiltros() {
  const fields = ["filtroTexto", "filtroMarca", "filtroOferta", "filtroOrden"];
  fields.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  // Resetear paginación de productos
  if (paginationManagers.productos) {
    paginationManagers.productos.reset();
  }
  aplicarFiltros();
}

// ==================== FUNCIÓN DE BÚSQUEDA ====================

function initSearch() {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.querySelector(".search-container button");

  if (!searchInput) return;

  const doSearch = () => {
    const query = searchInput.value.trim();
    if (!query) return;

    const isProductosPage = document.getElementById("productosGrid") !== null;

    if (isProductosPage) {
      // Ya estamos en productos.html — sincronizar filtro y aplicar
      const filtroTexto = document.getElementById("filtroTexto");
      if (filtroTexto) filtroTexto.value = query;
      aplicarFiltros();
    } else {
      window.location.href =
        "productos.html?search=" + encodeURIComponent(query);
    }
  };

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch();
  });

  if (searchBtn) {
    searchBtn.addEventListener("click", doSearch);
  }
}

function filterProductsOnIndex(query) {
  const cards = document.querySelectorAll(
    "#productosDestacados .producto-card, #productosOfertas .producto-card",
  );
  const q = query.toLowerCase();
  let visible = 0;
  cards.forEach((card) => {
    const name = card.querySelector("h3")?.textContent?.toLowerCase() || "";
    const detail =
      card.querySelectorAll("p")[1]?.textContent?.toLowerCase() || "";
    const matches = name.includes(q) || detail.includes(q);
    card.style.display = matches ? "" : "none";
    if (matches) visible++;
  });

  // Mostrar mensaje si no hay resultados
  const dest = document.getElementById("productosDestacados");
  const existingMsg = document.getElementById("search-no-results");
  if (existingMsg) existingMsg.remove();
  if (visible === 0 && dest) {
    dest.insertAdjacentHTML(
      "afterend",
      `<p id="search-no-results" style="text-align:center;padding:2rem;color:#666;">No se encontraron productos para "<strong>${query}</strong>"</p>`,
    );
  }
}

// ==================== GESTIÓN DE SECCIONES DEL HOME ====================

function getHomeSection(section) {
  const data = localStorage.getItem(`cellstore_home_${section}`);
  return data ? JSON.parse(data) : null; // null = comportamiento por defecto
}

function saveHomeSection(section, ids) {
  if (ids.length === 0) {
    localStorage.removeItem(`cellstore_home_${section}`);
  } else {
    localStorage.setItem(`cellstore_home_${section}`, JSON.stringify(ids));
  }
}

function clearHomeSection(section) {
  localStorage.removeItem(`cellstore_home_${section}`);
  renderHomeSections();
  showSuccessMessage("Sección restablecida a valores por defecto");
}

function switchHomeTab(tab) {
  document
    .querySelectorAll(".home-tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelectorAll(".home-tab-content")
    .forEach((c) => c.classList.add("hidden"));

  document.querySelectorAll(".home-tab-btn").forEach((b) => {
    if (b.getAttribute("onclick") === `switchHomeTab('${tab}')`) {
      b.classList.add("active");
    }
  });
  const tabEl = document.getElementById(`home-tab-${tab}`);
  if (tabEl) tabEl.classList.remove("hidden");
}

function toggleHomeSectionProduct(section, productId) {
  const saved = getHomeSection(section) || [];
  const strId = String(productId);
  const idx = saved.indexOf(strId);
  if (idx === -1) {
    saved.push(strId);
  } else {
    saved.splice(idx, 1);
  }
  saveHomeSection(section, saved);

  // Actualizar botón sin re-renderizar todo
  const btn = document.querySelector(
    `[data-section="${section}"][data-id="${strId}"]`,
  );
  if (btn) {
    const isSelected = saved.includes(strId);
    btn.textContent = isSelected ? "✓ Seleccionado" : "Agregar";
    btn.classList.toggle("btn-selected", isSelected);
    btn.closest(".home-product-item").classList.toggle("selected", isSelected);
  }

  // Actualizar contador
  const key = section.charAt(0).toUpperCase() + section.slice(1);
  const countEl = document.getElementById(`count${key}`);
  if (countEl) countEl.textContent = saved.length;
}

async function renderHomeSections() {
  const grid1 = document.getElementById("gridDestacados");
  const grid2 = document.getElementById("gridOfertas");
  if (!grid1 && !grid2) return;

  if (grid1)
    grid1.innerHTML =
      '<p style="grid-column:1/-1;padding:1rem;">Cargando...</p>';
  if (grid2)
    grid2.innerHTML =
      '<p style="grid-column:1/-1;padding:1rem;">Cargando...</p>';

  const allProducts = await getProductsFromSupabase();
  const savedDestacados = getHomeSection("destacados") || [];
  const savedOfertas = getHomeSection("ofertas") || [];

  const countDest = document.getElementById("countDestacados");
  const countOf = document.getElementById("countOfertas");
  if (countDest) countDest.textContent = savedDestacados.length;
  if (countOf) countOf.textContent = savedOfertas.length;

  const buildGrid = (grid, savedIds, section) => {
    if (!grid) return;
    grid.innerHTML = allProducts
      .map((p) => {
        const strId = String(p.id);
        const isSelected = savedIds.includes(strId);
        return `
          <div class="home-product-item${isSelected ? " selected" : ""}">
            <img src="${p.imagen || ""}" alt="${p.nombre}" onerror="this.style.opacity='0'">
            <div class="home-product-info">
              <strong>${p.nombre}</strong>
              <span>$${p.precio} &middot; ${p.marca || ""}</span>
            </div>
            <button
              class="btn-toggle-home${isSelected ? " btn-selected" : ""}"
              data-section="${section}"
              data-id="${strId}"
              onclick="toggleHomeSectionProduct('${section}', '${strId}')"
            >${isSelected ? "✓ Seleccionado" : "Agregar"}</button>
          </div>`;
      })
      .join("");
  };

  buildGrid(grid1, savedDestacados, "destacados");
  buildGrid(grid2, savedOfertas, "ofertas");
}

// ==================== INICIALIZACIÓN ====================

/**
 * Mostrar nombre del usuario en el navbar
 */
function updateUserNavbar() {
  const user = JSON.parse(localStorage.getItem("cellstore_user") || "null");
  const loginLink = document.querySelector(".login-nav-link");

  if (user && user.nombre && loginLink) {
    loginLink.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      ${user.nombre}
    `;
    loginLink.style.background =
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    loginLink.href = "#";
    loginLink.onclick = (e) => {
      e.preventDefault();
      showUserMenu();
    };
  }
}

/**
 * Mostrar menú del usuario
 */
function showUserMenu() {
  const user = JSON.parse(localStorage.getItem("cellstore_user") || "null");
  if (!user) return;

  const existingMenu = document.getElementById("userDropdownMenu");
  if (existingMenu) {
    existingMenu.remove();
    return;
  }

  const menu = document.createElement("div");
  menu.id = "userDropdownMenu";
  menu.className = "user-dropdown-menu";
  menu.innerHTML = `
    <div class="user-menu-header">
      <strong>${user.nombre} ${user.apellido || ""}</strong>
      <small>${user.correo || ""}</small>
    </div>
    <hr style="margin: 0.5rem 0; border: none; border-top: 1px solid #e0e0e0;">
    <a href="#" onclick="handleLogout(); return false;">Cerrar Sesión</a>
  `;

  document.body.appendChild(menu);

  // Posicionar cerca del botón de login
  const loginLink = document.querySelector(".login-nav-link");
  if (loginLink) {
    const rect = loginLink.getBoundingClientRect();
    menu.style.top = rect.bottom + 5 + "px";
    menu.style.right = "20px";
  }

  // Cerrar menú al hacer clic fuera
  setTimeout(() => {
    document.addEventListener("click", closeUserMenu, { once: true });
  }, 100);
}

/**
 * Cerrar menú del usuario
 */
function closeUserMenu() {
  const menu = document.getElementById("userDropdownMenu");
  if (menu) menu.remove();
}

document.addEventListener("DOMContentLoaded", () => {
  // Mostrar nombre del usuario en navbar
  updateUserNavbar();

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

  // Para página de productos
  if (document.getElementById("productosGrid")) {
    renderProductosPage();
  }

  // Para página de admin
  if (localStorage.getItem("cellstore_admin") === "true") {
    const adminSection = document.getElementById("section-products");
    if (adminSection) {
      renderProductsFromSupabase();
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

  // Inicializar búsqueda
  initSearch();
});
