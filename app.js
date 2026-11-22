const productGrid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#product-search");
const filterButtons = [...document.querySelectorAll(".filter-button")];
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
const clearFiltersButton = document.querySelector("#clear-filters");
const modal = document.querySelector("#product-modal");
const modalContent = document.querySelector("#modal-content");
const modalClose = document.querySelector(".modal-close");
const themeToggle = document.querySelector(".theme-toggle");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const backToTopButton = document.querySelector(".back-to-top");

let products = [];
let activeCategory = "Todos";
let lastFocusedElement = null;

function applyTheme(theme, persist = true) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Activar modo claro" : "Activar modo oscuro",
    );
  }
  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", isDark ? "#11110f" : "#171716");
  }

  if (persist) {
    try {
      localStorage.setItem("poseck-theme", isDark ? "dark" : "light");
      localStorage.setItem("do-theme", isDark ? "dark" : "light");
    } catch {
      // El tema funciona aunque el navegador bloquee el almacenamiento local.
    }
  }
}

applyTheme(document.documentElement.dataset.theme || "light", false);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  });
}

function updateBackToTopVisibility() {
  backToTopButton.classList.toggle("is-visible", window.scrollY > 520);
}

window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
backToTopButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
updateBackToTopVisibility();

const currency = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const normalizeText = (value) =>
  value
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const stockClass = (stock) => {
  const classes = {
    Disponible: "stock-disponible",
    "Sin stock": "stock-sin-stock",
    "Disponible a pedido": "stock-a-pedido",
  };
  return classes[stock] || "stock-a-pedido";
};

const productCard = (product, index) => `
  <article class="product-card" style="animation-delay:${Math.min(index * 45, 270)}ms">
    <div class="product-image-wrap">
      <img
        class="product-image"
        src="${product.imagen}"
        alt="${product.nombre}"
        width="360"
        height="240"
        loading="lazy"
      />
      <span class="product-category">${product.categoria}</span>
    </div>
    <div class="product-body">
      <span class="product-code">CÓD. ${product.codigo}</span>
      <h3 class="product-name">${product.nombre}</h3>
      <div class="product-meta">
        <div class="price-block">
          <small>Precio con IVA</small>
          <strong>${currency.format(product.precioIva)}</strong>
        </div>
        <span class="stock-badge ${stockClass(product.stock)}">${product.stock}</span>
      </div>
      <button class="detail-button" type="button" data-product-id="${product.id}">
        Ver detalle
      </button>
    </div>
  </article>
`;

function renderProducts() {
  const query = normalizeText(searchInput.value.trim());
  const filtered = products.filter((product) => {
    const matchesCategory =
      activeCategory === "Todos" || product.categoria === activeCategory;
    const searchable = normalizeText(
      `${product.nombre} ${product.codigo} ${product.descripcion}`,
    );
    return matchesCategory && searchable.includes(query);
  });

  productGrid.innerHTML = filtered.map(productCard).join("");
  productGrid.hidden = filtered.length === 0;
  emptyState.hidden = filtered.length !== 0;
  resultCount.textContent = `${filtered.length} ${
    filtered.length === 1 ? "producto" : "productos"
  }`;
}

function setActiveCategory(category) {
  activeCategory = category;
  filterButtons.forEach((button) => {
    const isActive = button.dataset.category === category;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  renderProducts();
}

function openModal(product) {
  lastFocusedElement = document.activeElement;
  const whatsappText = encodeURIComponent(
    `Hola Poseck Ferreterías, me interesa consultar por el producto: ${product.nombre} (Cód: ${product.codigo}) por ${currency.format(product.precioIva)} IVA inc.`
  );
  modalContent.innerHTML = `
    <div class="modal-product-head">
      <div class="modal-image">
        <img src="${product.imagen}" alt="${product.nombre}" width="420" height="300" />
      </div>
      <div class="modal-summary">
        <span class="product-code">CÓD. ${product.codigo} · ${product.categoria}</span>
        <h2 id="modal-title">${product.nombre}</h2>
        <p>${product.descripcion}</p>
        <p style="margin-top:16px">
          <span class="stock-badge ${stockClass(product.stock)}">${product.stock}</span>
        </p>
      </div>
    </div>
    <section class="spec-sheet" aria-label="Ficha técnica">
      <div class="spec-heading">
        <strong>FICHA TÉCNICA</strong>
        <span>PF / ${product.codigo}</span>
      </div>
      <dl class="spec-list">
        <div class="spec-row">
          <dt>Código</dt>
          <dd>${product.codigo}</dd>
        </div>
        <div class="spec-row">
          <dt>Presentación / Embalaje</dt>
          <dd>${product.embalaje}</dd>
        </div>
        <div class="spec-row is-price">
          <dt>Precio neto</dt>
          <dd>${currency.format(product.precioNeto)}</dd>
        </div>
        <div class="spec-row is-total">
          <dt>Precio con IVA</dt>
          <dd>${currency.format(product.precioIva)}</dd>
        </div>
      </dl>
    </section>
    <section class="list-action" aria-label="Acciones de compra y cotización">
      <div class="quantity-field">
        <span class="quantity-label">Cantidad</span>
        <div class="quantity-control">
          <button type="button" data-quantity-action="decrease" aria-label="Disminuir cantidad">
            −
          </button>
          <input
            id="product-quantity"
            type="number"
            min="1"
            max="999"
            value="1"
            inputmode="numeric"
            aria-label="Cantidad del producto"
          />
          <button type="button" data-quantity-action="increase" aria-label="Aumentar cantidad">
            +
          </button>
        </div>
      </div>
      <div class="modal-buttons-group">
        <button class="add-list-button" type="button" data-add-to-cart="${product.id}">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="20" r="1.5" />
            <circle cx="18" cy="20" r="1.5" />
            <path d="M2.5 3h3l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h9.2a1.5 1.5 0 0 0 1.4-1.1L21.5 7H6.2" />
          </svg>
          <span>Agregar al carrito</span>
        </button>
        <a
          class="whatsapp-quote-button"
          href="https://wa.me/56953326406?text=${whatsappText}"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span>Cotizar por WhatsApp</span>
        </a>
      </div>
    </section>
  `;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  modalClose.focus();
}

function closeModal() {
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  lastFocusedElement?.focus();
}

async function loadProducts() {
  resultCount.textContent = "Cargando productos…";
  productGrid.hidden = false;
  emptyState.hidden = true;

  if (
    window.location.protocol === "file:" &&
    Array.isArray(window.PRODUCTOS)
  ) {
    products = window.PRODUCTOS;
    renderProducts();
    return;
  }

  try {
    const response = await fetch("./productos.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(
        `No se pudo cargar productos.json (HTTP ${response.status}).`,
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new TypeError("productos.json debe contener una lista de productos.");
    }

    products = data;
    renderProducts();
  } catch (error) {
    if (Array.isArray(window.PRODUCTOS)) {
      products = window.PRODUCTOS;
      renderProducts();
      console.warn(
        "No se pudo cargar productos.json; se utilizó el respaldo local.",
        error,
      );
      return;
    }

    products = [];
    resultCount.textContent = "Catálogo no disponible";
    productGrid.innerHTML = `
      <div class="empty-state" style="display:block;grid-column:1/-1">
        <h3>No pudimos cargar los productos</h3>
        <p>${
          window.location.protocol === "file:"
            ? "Chrome no permite cargar productos.json desde file://. Abre el proyecto mediante un servidor local."
            : "Revisa tu conexión e intenta cargar el catálogo nuevamente."
        }</p>
        <button type="button" data-retry-products>Reintentar</button>
      </div>
    `;
    console.error("Error al cargar el catálogo:", error);
  }
}

searchInput.addEventListener("input", renderProducts);

filterButtons.forEach((button) => {
  button.setAttribute(
    "aria-pressed",
    String(button.dataset.category === activeCategory),
  );
  button.addEventListener("click", () => setActiveCategory(button.dataset.category));
});

productGrid.addEventListener("click", (event) => {
  const retryButton = event.target.closest("[data-retry-products]");
  if (retryButton) {
    loadProducts();
    return;
  }

  const button = event.target.closest("[data-product-id]");
  if (!button) return;
  const product = products.find(({ id }) => id === Number(button.dataset.productId));
  if (product) openModal(product);
});

modalContent.addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity-action]");
  const quantityInput = modalContent.querySelector("#product-quantity");

  if (quantityButton && quantityInput) {
    const direction = quantityButton.dataset.quantityAction;
    const currentValue = Number(quantityInput.value) || 1;
    quantityInput.value = String(
      direction === "increase"
        ? Math.min(currentValue + 1, 999)
        : Math.max(currentValue - 1, 1),
    );
  }

  const addButton = event.target.closest("[data-add-to-cart]");
  if (addButton && quantityInput) {
    const productId = Number(addButton.dataset.addToCart);
    const qty = Math.min(Math.max(Number(quantityInput.value) || 1, 1), 999);
    const product = products.find(({ id }) => id === productId);
    if (product) {
      addItemToCart({
        id: product.id,
        codigo: product.codigo,
        nombre: product.nombre,
        imagen: product.imagen,
        precioNeto: product.precioNeto,
        precioIva: product.precioIva,
        qty,
      });
    }

    const label = addButton.querySelector("span");
    label.textContent = "✓ Agregado al carrito";
    addButton.classList.add("is-added");

    window.setTimeout(() => {
      label.textContent = "Agregar al carrito";
      addButton.classList.remove("is-added");
    }, 1800);
  }
});

modalContent.addEventListener("change", (event) => {
  if (event.target.id !== "product-quantity") return;
  const value = Number(event.target.value) || 1;
  event.target.value = String(Math.min(Math.max(value, 1), 999));
});

clearFiltersButton.addEventListener("click", () => {
  searchInput.value = "";
  setActiveCategory("Todos");
  searchInput.focus();
});

modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === "Escape" && !modal.hidden) closeModal();
  if (event.key === "Tab" && !modal.hidden) {
    const focusable = [...modal.querySelectorAll("button, [href], input")];
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

loadProducts();


document.querySelectorAll(".partner-3d-link").forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href) return;
    event.preventDefault();
    link.classList.add("is-clicked");
    window.setTimeout(() => {
      link.classList.remove("is-clicked");
      window.location.href = href;
    }, 170);
  });
});


/* ---- Shopping Cart (E-Commerce) ---- */
const CART_STORAGE_KEY = "poseck-cart";
const cartToggleBtn = document.querySelector("#cart-toggle-btn");
const cartBadge = document.querySelector("#cart-badge");
const cartBackdrop = document.querySelector("#cart-backdrop");
const cartCloseBtn = document.querySelector("#cart-close-btn");
const cartItemsContainer = document.querySelector("#cart-items-container");
const cartFooter = document.querySelector("#cart-drawer-footer");
const cartSubtotalNetoEl = document.querySelector("#cart-subtotal-neto");
const cartIvaEl = document.querySelector("#cart-iva");
const cartTotalIvaEl = document.querySelector("#cart-total-iva");
const cartWhatsappBtn = document.querySelector("#cart-whatsapp-btn");
const cartClearBtn = document.querySelector("#cart-clear-btn");

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let cart = loadCart();

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Ignorar si almacenamiento local está restringido.
  }
}

function addItemToCart(item) {
  const existing = cart.find((entry) => entry.codigo === item.codigo);
  if (existing) {
    existing.qty = Math.min(existing.qty + item.qty, 999);
  } else {
    cart.push({ ...item });
  }
  saveCart();
  renderCart();
  if (cartBadge) {
    cartBadge.classList.remove("is-pop");
    void cartBadge.offsetWidth;
    cartBadge.classList.add("is-pop");
  }
}

function updateCartItemQty(codigo, delta) {
  const idx = cart.findIndex((entry) => entry.codigo === codigo);
  if (idx === -1) return;
  const nextQty = cart[idx].qty + delta;
  if (nextQty <= 0) {
    cart.splice(idx, 1);
  } else {
    cart[idx].qty = Math.min(nextQty, 999);
  }
  saveCart();
  renderCart();
}

function removeCartItem(codigo) {
  cart = cart.filter((entry) => entry.codigo !== codigo);
  saveCart();
  renderCart();
}

function renderCart() {
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  if (cartBadge) {
    cartBadge.textContent = String(totalCount);
    cartBadge.classList.toggle("has-items", totalCount > 0);
  }

  if (!cartItemsContainer || !cartFooter) return;

  if (cart.length === 0) {
    cartFooter.hidden = true;
    cartItemsContainer.innerHTML = `
      <div class="cart-empty">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <circle cx="9" cy="20" r="1.5" />
          <circle cx="18" cy="20" r="1.5" />
          <path d="M2.5 3h3l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h9.2a1.5 1.5 0 0 0 1.4-1.1L21.5 7H6.2" />
        </svg>
        <h3>Tu carrito está vacío</h3>
        <p>Despliega cualquier producto del catálogo y agrégalo para armar tu pedido.</p>
      </div>
    `;
    return;
  }

  cartFooter.hidden = false;
  let subtotalNeto = 0;
  let totalIva = 0;

  cartItemsContainer.innerHTML = cart
    .map((item) => {
      const lineTotal = item.precioIva * item.qty;
      const lineNeto = (item.precioNeto || Math.round(item.precioIva / 1.19)) * item.qty;
      subtotalNeto += lineNeto;
      totalIva += lineTotal;
      return `
        <article class="cart-item" data-cart-codigo="${item.codigo}">
          <img class="cart-item-thumb" src="${item.imagen}" alt="${item.nombre}" width="64" height="64" />
          <div class="cart-item-body">
            <div class="cart-item-top">
              <strong>${item.nombre}</strong>
              <button class="cart-item-remove" type="button" data-cart-remove="${item.codigo}" aria-label="Eliminar ${item.nombre}">
                ×
              </button>
            </div>
            <span class="cart-item-sku">Cód. ${item.codigo} · ${currency.format(item.precioIva)} c/u</span>
            <div class="cart-item-bottom">
              <div class="cart-qty-control">
                <button type="button" data-cart-dec="${item.codigo}" aria-label="Disminuir cantidad">−</button>
                <span>${item.qty}</span>
                <button type="button" data-cart-inc="${item.codigo}" aria-label="Aumentar cantidad">+</button>
              </div>
              <strong class="cart-item-subtotal">${currency.format(lineTotal)}</strong>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  const ivaAmount = Math.max(0, totalIva - subtotalNeto);
  if (cartSubtotalNetoEl) cartSubtotalNetoEl.textContent = currency.format(subtotalNeto);
  if (cartIvaEl) cartIvaEl.textContent = currency.format(ivaAmount);
  if (cartTotalIvaEl) cartTotalIvaEl.textContent = currency.format(totalIva);

  if (cartWhatsappBtn) {
    const lines = cart.map(
      (item) => `• ${item.qty}x ${item.nombre} (${item.codigo}) — ${currency.format(item.precioIva * item.qty)}`,
    );
    const msg = `Hola Poseck Ferreterías, quiero realizar el siguiente pedido:\n\n${lines.join("\n")}\n\nTotal IVA incl.: ${currency.format(totalIva)}`;
    cartWhatsappBtn.href = `https://wa.me/56953326406?text=${encodeURIComponent(msg)}`;
  }
}

function openCart() {
  if (!cartBackdrop) return;
  cartBackdrop.hidden = false;
  document.body.classList.add("modal-open");
  cartToggleBtn?.setAttribute("aria-expanded", "true");
  cartCloseBtn?.focus();
}

function closeCart() {
  if (!cartBackdrop) return;
  cartBackdrop.hidden = true;
  if (modal?.hidden !== false) {
    document.body.classList.remove("modal-open");
  }
  cartToggleBtn?.setAttribute("aria-expanded", "false");
}

cartToggleBtn?.addEventListener("click", openCart);
cartCloseBtn?.addEventListener("click", closeCart);
cartBackdrop?.addEventListener("click", (event) => {
  if (event.target === cartBackdrop) closeCart();
});
cartClearBtn?.addEventListener("click", () => {
  cart = [];
  saveCart();
  renderCart();
});

cartItemsContainer?.addEventListener("click", (event) => {
  const incBtn = event.target.closest("[data-cart-inc]");
  if (incBtn) {
    updateCartItemQty(incBtn.dataset.cartInc, 1);
    return;
  }
  const decBtn = event.target.closest("[data-cart-dec]");
  if (decBtn) {
    updateCartItemQty(decBtn.dataset.cartDec, -1);
    return;
  }
  const remBtn = event.target.closest("[data-cart-remove]");
  if (remBtn) {
    removeCartItem(remBtn.dataset.cartRemove);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartBackdrop && !cartBackdrop.hidden) {
    closeCart();
  }
});

renderCart();


/* ---- Customer Account & Login ("Hola, inicia sesión" / "Mi cuenta") ---- */
const ACCOUNT_STORAGE_KEY = "poseck-user";
const ORDERS_STORAGE_KEY = "poseck-orders";
const accountToggleBtn = document.querySelector("#account-toggle-btn");
const accountGreetingEl = document.querySelector("#nav-account-greeting");
const accountLabelEl = document.querySelector("#nav-account-label");
const accountBackdrop = document.querySelector("#account-backdrop");
const accountCloseBtn = document.querySelector("#account-close-btn");
const accountModalBody = document.querySelector("#account-modal-body");

let accountTab = "login";

function loadUser() {
  try {
    const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUser(user) {
  try {
    if (user) {
      localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(ACCOUNT_STORAGE_KEY);
    }
  } catch {
    // Ignorar si almacenamiento local está restringido.
  }
}

function loadOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function recordOrderFromCart() {
  if (!cart.length) return;
  const total = cart.reduce((sum, item) => sum + item.precioIva * item.qty, 0);
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const orders = loadOrders();
  orders.unshift({
    id: `PF-${Date.now().toString().slice(-6)}`,
    date: new Date().toLocaleDateString("es-CL"),
    items: count,
    total,
  });
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders.slice(0, 10)));
  } catch {
    // Ignorar.
  }
}

cartWhatsappBtn?.addEventListener("click", recordOrderFromCart);

function updateAccountNav() {
  const user = loadUser();
  if (!accountGreetingEl || !accountLabelEl) return;
  if (user?.name) {
    const firstName = user.name.trim().split(/\s+/)[0];
    accountGreetingEl.textContent = `Hola, ${firstName}`;
    accountLabelEl.textContent = "Mi cuenta";
  } else {
    accountGreetingEl.textContent = "Hola, inicia sesión";
    accountLabelEl.textContent = "Mi cuenta";
  }
}

function renderAccountModal() {
  if (!accountModalBody) return;
  const user = loadUser();

  if (user) {
    const orders = loadOrders();
    accountModalBody.innerHTML = `
      <div class="account-profile-card">
        <div class="account-avatar">${user.name.trim().charAt(0).toUpperCase()}</div>
        <div>
          <strong>${user.name}</strong>
          <span>${user.email}</span>
          ${user.company ? `<small>Empresa / RUT: ${user.company}</small>` : ""}
        </div>
      </div>

      <div class="account-section">
        <h3>Mis pedidos recientes</h3>
        ${
          orders.length
            ? `<div class="account-orders-list">${orders
                .map(
                  (o) => `
                  <div class="account-order-row">
                    <div>
                      <strong>Pedido ${o.id}</strong>
                      <span>${o.date} · ${o.items} producto(s)</span>
                    </div>
                    <strong>${currency.format(o.total)}</strong>
                  </div>`,
                )
                .join("")}</div>`
            : `<p class="account-empty-orders">Aún no has enviado pedidos desde el carrito.</p>`
        }
      </div>

      <button class="account-logout-btn" type="button" id="account-logout-btn">
        Cerrar sesión
      </button>
    `;
    return;
  }

  accountModalBody.innerHTML = `
    <div class="account-tabs" role="tablist">
      <button type="button" class="account-tab ${accountTab === "login" ? "is-active" : ""}" data-account-tab="login">
        Iniciar sesión
      </button>
      <button type="button" class="account-tab ${accountTab === "register" ? "is-active" : ""}" data-account-tab="register">
        Crear cuenta
      </button>
    </div>

    ${
      accountTab === "login"
        ? `
      <form class="account-form" id="account-login-form">
        <label>
          <span>Correo electrónico</span>
          <input type="email" name="email" required placeholder="cliente@empresa.cl" />
        </label>
        <label>
          <span>Contraseña</span>
          <input type="password" name="password" required placeholder="••••••••" />
        </label>
        <button class="account-submit-btn" type="submit">Ingresar a Mi cuenta</button>
      </form>`
        : `
      <form class="account-form" id="account-register-form">
        <label>
          <span>Nombre completo</span>
          <input type="text" name="name" required placeholder="Ej: Carlos Pérez" />
        </label>
        <label>
          <span>Empresa / RUT (opcional)</span>
          <input type="text" name="company" placeholder="Constructora Sur / 76.xxx.xxx-x" />
        </label>
        <label>
          <span>Correo electrónico</span>
          <input type="email" name="email" required placeholder="carlos@constructora.cl" />
        </label>
        <label>
          <span>Contraseña</span>
          <input type="password" name="password" required minlength="4" placeholder="Mínimo 4 caracteres" />
        </label>
        <button class="account-submit-btn" type="submit">Crear mi cuenta</button>
      </form>`
    }
  `;
}

function openAccountModal() {
  if (!accountBackdrop) return;
  renderAccountModal();
  accountBackdrop.hidden = false;
  document.body.classList.add("modal-open");
  accountToggleBtn?.setAttribute("aria-expanded", "true");
  accountCloseBtn?.focus();
}

function closeAccountModal() {
  if (!accountBackdrop) return;
  accountBackdrop.hidden = true;
  if (modal?.hidden !== false && cartBackdrop?.hidden !== false) {
    document.body.classList.remove("modal-open");
  }
  accountToggleBtn?.setAttribute("aria-expanded", "false");
}

accountToggleBtn?.addEventListener("click", openAccountModal);
accountCloseBtn?.addEventListener("click", closeAccountModal);
accountBackdrop?.addEventListener("click", (event) => {
  if (event.target === accountBackdrop) closeAccountModal();
});

accountModalBody?.addEventListener("click", (event) => {
  const tabBtn = event.target.closest("[data-account-tab]");
  if (tabBtn) {
    accountTab = tabBtn.dataset.accountTab;
    renderAccountModal();
    return;
  }
  if (event.target.closest("#account-logout-btn")) {
    saveUser(null);
    updateAccountNav();
    renderAccountModal();
  }
});

accountModalBody?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);
  if (form.id === "account-login-form") {
    const email = String(data.get("email") || "").trim();
    const inferredName = email.split("@")[0].replace(/[._-]+/g, " ");
    const formatted = inferredName.replace(/\b\w/g, (c) => c.toUpperCase()) || "Cliente";
    saveUser({ name: formatted, email, company: "" });
  } else if (form.id === "account-register-form") {
    saveUser({
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      company: String(data.get("company") || "").trim(),
    });
  }
  updateAccountNav();
  renderAccountModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && accountBackdrop && !accountBackdrop.hidden) {
    closeAccountModal();
  }
});

updateAccountNav();
