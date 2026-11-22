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
