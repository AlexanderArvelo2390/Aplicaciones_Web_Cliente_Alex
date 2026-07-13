// ==================== SISTEMA DE PAGINACIÓN ====================

class Pagination {
  constructor(items, itemsPerPage = 12) {
    this.items = items;
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
  }

  setPage(pageNumber) {
    const maxPages = this.getMaxPages();
    if (pageNumber >= 1 && pageNumber <= maxPages) {
      this.currentPage = pageNumber;
      return true;
    }
    return false;
  }

  getMaxPages() {
    return Math.ceil(this.items.length / this.itemsPerPage);
  }

  getCurrentItems() {
    const startIdx = (this.currentPage - 1) * this.itemsPerPage;
    const endIdx = startIdx + this.itemsPerPage;
    return this.items.slice(startIdx, endIdx);
  }

  getPaginationInfo() {
    return {
      currentPage: this.currentPage,
      maxPages: this.getMaxPages(),
      totalItems: this.items.length,
      itemsPerPage: this.itemsPerPage,
      startIdx: (this.currentPage - 1) * this.itemsPerPage + 1,
      endIdx: Math.min(this.currentPage * this.itemsPerPage, this.items.length),
    };
  }

  reset() {
    this.currentPage = 1;
  }
}

// Gestores de paginación para cada sección
const paginationManagers = {
  productos: null,
  destacados: null,
  ofertas: null,
};

function createPaginationControls(containerId, paginationManager) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const maxPages = paginationManager.getMaxPages();
  if (maxPages <= 1) return; // No mostrar controles si hay solo una página

  const controlsDiv = document.createElement("div");
  controlsDiv.className = "pagination-controls";
  controlsDiv.id = `pagination-${containerId}`;

  // Botón anterior
  const btnPrev = document.createElement("button");
  btnPrev.className = "pagination-btn pagination-prev";
  btnPrev.innerHTML = "← Anterior";
  btnPrev.disabled = paginationManager.currentPage === 1;
  btnPrev.addEventListener("click", () => {
    if (paginationManager.setPage(paginationManager.currentPage - 1)) {
      updatePaginatedContent(containerId);
    }
  });
  controlsDiv.appendChild(btnPrev);

  // Números de página
  const pagesDiv = document.createElement("div");
  pagesDiv.className = "pagination-pages";

  for (let i = 1; i <= maxPages; i++) {
    const btn = document.createElement("button");
    btn.className = "pagination-number";
    if (i === paginationManager.currentPage) {
      btn.classList.add("active");
    }
    btn.textContent = i;
    btn.addEventListener("click", () => {
      if (paginationManager.setPage(i)) {
        updatePaginatedContent(containerId);
      }
    });
    pagesDiv.appendChild(btn);
  }
  controlsDiv.appendChild(pagesDiv);

  // Botón siguiente
  const btnNext = document.createElement("button");
  btnNext.className = "pagination-btn pagination-next";
  btnNext.innerHTML = "Siguiente →";
  btnNext.disabled = paginationManager.currentPage === maxPages;
  btnNext.addEventListener("click", () => {
    if (paginationManager.setPage(paginationManager.currentPage + 1)) {
      updatePaginatedContent(containerId);
    }
  });
  controlsDiv.appendChild(btnNext);

  // Info de página
  const info = paginationManager.getPaginationInfo();
  const infoDiv = document.createElement("div");
  infoDiv.className = "pagination-info";
  infoDiv.textContent = `Página ${info.currentPage} de ${info.maxPages} | ${info.startIdx}-${info.endIdx} de ${info.totalItems}`;
  controlsDiv.appendChild(infoDiv);

  // Insertar antes del siguiente elemento o al final
  const nextElement = container.nextElementSibling;
  if (nextElement) {
    container.parentNode.insertBefore(controlsDiv, nextElement);
  } else {
    container.parentNode.appendChild(controlsDiv);
  }
}

function updatePaginationControls(containerId) {
  const oldControls = document.getElementById(`pagination-${containerId}`);
  if (oldControls) {
    oldControls.remove();
  }

  const manager =
    paginationManagers[
      containerId
        .replace("Grid", "")
        .replace("Destacados", "destacados")
        .replace("Ofertas", "ofertas")
    ];
  if (manager) {
    createPaginationControls(containerId, manager);
    // Scroll to top of grid
    const grid = document.getElementById(containerId);
    if (grid) {
      grid.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}

function updatePaginatedContent(gridId) {
  const manager =
    paginationManagers[
      gridId === "productosGrid"
        ? "productos"
        : gridId === "productosDestacados"
          ? "destacados"
          : gridId === "productosOfertas"
            ? "ofertas"
            : null
    ];

  if (!manager) return;

  const grid = document.getElementById(gridId);
  if (!grid) return;

  const items = manager.getCurrentItems();
  const DEFAULT_IMG =
    "https://tienda.personal.com.ar/images/720/webp/Samsung-Galaxy-A07-Verde_1764179117200024927.png";

  grid.innerHTML = items
    .map(
      (p) => `
      <a href="producto.html?id=${p.id}" class="producto-card">
        <img src="${p.imagen || DEFAULT_IMG}" alt="${p.nombre}" width="200">
        <h3>${p.nombre}</h3>
        <p class="precio">$${p.precio}</p>
        <p>${p.marca || ""}, ${p.almacenamiento || ""}, Pantalla ${p.pantalla || ""}</p>
        <button>Agregar al carrito</button>
      </a>`,
    )
    .join("");

  // Re-attach event listeners para botones "Agregar al carrito"
  grid.querySelectorAll(".producto-card button").forEach((btn) => {
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

  updatePaginationControls(gridId);
}

// Función para limpiar todas las paginaciones
function resetAllPaginations() {
  Object.values(paginationManagers).forEach((manager) => {
    if (manager) manager.reset();
  });
}
