// ==================== GESTIÓN DE USUARIOS ====================

// ==================== FUNCIONES CRUD DE USUARIOS ====================

/**
 * Obtener todos los usuarios desde Supabase
 */
async function getUsuariosFromSupabase() {
  try {
    const response = await fetch(
      `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.table3}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_CONFIG.key,
          Authorization: `Bearer ${SUPABASE_CONFIG.key}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error al obtener usuarios: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getUsuariosFromSupabase:", error);
    showNotification("Error al cargar usuarios", "error");
    return [];
  }
}

/**
 * Crear un nuevo usuario en Supabase
 */
async function createUserInSupabase(usuario) {
  try {
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
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          dni: usuario.dni,
          correo: usuario.correo,
          fecha_creacion: new Date().toISOString(),
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Error al crear usuario: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en createUserInSupabase:", error);
    showNotification("Error al crear usuario", "error");
    return null;
  }
}

/**
 * Actualizar un usuario en Supabase
 */
async function updateUserInSupabase(id, usuario) {
  try {
    const response = await fetch(
      `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.table3}?id=eq.${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_CONFIG.key,
          Authorization: `Bearer ${SUPABASE_CONFIG.key}`,
        },
        body: JSON.stringify({
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          dni: usuario.dni,
          correo: usuario.correo,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Error al actualizar usuario: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en updateUserInSupabase:", error);
    showNotification("Error al actualizar usuario", "error");
    return null;
  }
}

/**
 * Eliminar un usuario de Supabase
 */
async function deleteUserFromSupabase(id) {
  try {
    const response = await fetch(
      `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.table3}?id=eq.${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_CONFIG.key,
          Authorization: `Bearer ${SUPABASE_CONFIG.key}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error al eliminar usuario: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Error en deleteUserFromSupabase:", error);
    showNotification("Error al eliminar usuario", "error");
    return false;
  }
}

// ==================== FUNCIONES DE UI ====================

/**
 * Mostrar formulario para crear/editar usuario
 */
function showUserForm(usuarioId = null) {
  const modal = document.getElementById("userFormModal");
  const form = document.getElementById("userForm");
  const title = document.getElementById("userFormTitle");
  const submitBtn = document.getElementById("userFormSubmitBtn");

  if (usuarioId) {
    title.textContent = "Editar Usuario";
    submitBtn.textContent = "Actualizar Usuario";
    form.dataset.userId = usuarioId;

    // Cargar datos del usuario
    const usuarioInput = document.querySelector("input[data-user-id]");
    if (usuarioInput) {
      // Si ya hay un usuario cargado en el form
      const usuario = window.currentEditUser;
      if (usuario) {
        document.getElementById("userNombre").value = usuario.nombre || "";
        document.getElementById("userApellido").value = usuario.apellido || "";
        document.getElementById("userDni").value = usuario.dni || "";
        document.getElementById("userCorreo").value = usuario.correo || "";
      }
    }
  } else {
    title.textContent = "Crear Nuevo Usuario";
    submitBtn.textContent = "Crear Usuario";
    form.reset();
    form.removeAttribute("data-userId");
  }

  modal.classList.remove("hidden");
  modal.classList.add("modal-open");
}

/**
 * Cerrar modal del formulario
 */
function closeUserForm() {
  const modal = document.getElementById("userFormModal");
  modal.classList.add("hidden");
  modal.classList.remove("modal-open");
  document.getElementById("userForm").reset();
}

/**
 * Guardar usuario (crear o actualizar)
 */
async function handleSaveUser(event) {
  event.preventDefault();

  const form = document.getElementById("userForm");
  const usuario = {
    nombre: document.getElementById("userNombre").value.trim(),
    apellido: document.getElementById("userApellido").value.trim(),
    dni: document.getElementById("userDni").value.trim(),
    correo: document.getElementById("userCorreo").value.trim(),
  };

  // Validar que no estén vacíos
  if (!usuario.nombre || !usuario.apellido || !usuario.dni || !usuario.correo) {
    showNotification("Por favor completa todos los campos", "warning");
    return;
  }

  // Validar DNI (números)
  if (!/^\d+$/.test(usuario.dni)) {
    showNotification("El DNI debe contener solo números", "warning");
    return;
  }

  // Validar correo
  if (!usuario.correo.includes("@")) {
    showNotification("Ingresa un correo válido", "warning");
    return;
  }

  const userId = form.dataset.userId;

  if (userId) {
    // Actualizar usuario existente
    const result = await updateUserInSupabase(userId, usuario);
    if (result) {
      showNotification("Usuario actualizado correctamente ✓", "success");
      closeUserForm();
      loadUsuariosTable();
    }
  } else {
    // Crear nuevo usuario
    const result = await createUserInSupabase(usuario);
    if (result) {
      showNotification("Usuario creado correctamente ✓", "success");

      // Guardar en localStorage para mostrar en navbar si es la primera vez
      if (!localStorage.getItem("cellstore_user")) {
        localStorage.setItem("cellstore_user", JSON.stringify(usuario));
        if (typeof updateUserNavbar === "function") {
          updateUserNavbar();
        }
      }

      closeUserForm();
      loadUsuariosTable();
    }
  }
}

/**
 * Cargar tabla de usuarios
 */
async function loadUsuariosTable() {
  const usuarios = await getUsuariosFromSupabase();
  const tbody = document.getElementById("usuariosTableBody");

  if (!tbody) return;

  if (usuarios.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="text-center">No hay usuarios registrados</td></tr>';
    return;
  }

  tbody.innerHTML = usuarios
    .map(
      (usuario) => `
    <tr class="usuario-row" data-user-id="${usuario.id}">
      <td><strong>${usuario.nombre}</strong></td>
      <td>${usuario.apellido}</td>
      <td>${usuario.dni}</td>
      <td>${usuario.correo}</td>
      <td class="action-buttons">
        <button class="btn-edit" onclick="handleEditUser(${usuario.id})">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Editar
        </button>
        <button class="btn-delete" onclick="handleDeleteUser(${usuario.id})">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Eliminar
        </button>
      </td>
    </tr>
  `,
    )
    .join("");
}

/**
 * Manejar edición de usuario
 */
async function handleEditUser(usuarioId) {
  const usuarios = await getUsuariosFromSupabase();
  const usuario = usuarios.find((u) => u.id === usuarioId);

  if (!usuario) {
    showNotification("Usuario no encontrado", "error");
    return;
  }

  window.currentEditUser = usuario;
  const form = document.getElementById("userForm");
  form.dataset.userId = usuarioId;

  document.getElementById("userNombre").value = usuario.nombre || "";
  document.getElementById("userApellido").value = usuario.apellido || "";
  document.getElementById("userDni").value = usuario.dni || "";
  document.getElementById("userCorreo").value = usuario.correo || "";

  showUserForm(usuarioId);
}

/**
 * Manejar eliminación de usuario
 */
async function handleDeleteUser(usuarioId) {
  if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
    return;
  }

  const success = await deleteUserFromSupabase(usuarioId);
  if (success) {
    showNotification("Usuario eliminado correctamente ✓", "success");
    loadUsuariosTable();
  }
}

/**
 * Filtrar usuarios en la tabla
 */
function filterUsuarios() {
  const searchTerm = document
    .getElementById("searchUsuarios")
    .value.toLowerCase();
  const rows = document.querySelectorAll(".usuario-row");

  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? "" : "none";
  });
}

/**
 * Mostrar notificación
 */
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Animar entrada
  setTimeout(() => notification.classList.add("show"), 10);

  // Remover después de 4 segundos
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// ==================== INICIALIZACIÓN ====================

/**
 * Inicializar sección de usuarios
 */
function initUsuariosSection() {
  // Cargar usuarios al abrir la sección
  const showUsuariosBtn = document.querySelector("button[onclick*='usuarios']");
  if (showUsuariosBtn) {
    showUsuariosBtn.addEventListener("click", loadUsuariosTable);
  }

  // Event listeners del modal
  const closeBtn = document.getElementById("userFormClose");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeUserForm);
  }

  const form = document.getElementById("userForm");
  if (form) {
    form.addEventListener("submit", handleSaveUser);
  }

  // Filtro de búsqueda
  const searchInput = document.getElementById("searchUsuarios");
  if (searchInput) {
    searchInput.addEventListener("input", filterUsuarios);
  }

  // Cerrar modal al hacer clic fuera de él
  const modal = document.getElementById("userFormModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeUserForm();
      }
    });
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initUsuariosSection);
} else {
  initUsuariosSection();
}
