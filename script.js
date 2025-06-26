// Variables globales
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
let deliveryAddress = JSON.parse(localStorage.getItem('deliveryAddress')) || null;
const MIN_ORDER = 150;

// Selección de elementos del DOM
const DOM = {
  // Header
  locationSelector: document.getElementById('locationSelector'),
  locationText: document.querySelector('.location-text'),
  cartButton: document.getElementById('cartButton'),
  cartCount: document.querySelector('.cart-count'),
  
  // Modal de dirección
  addressModal: document.getElementById('addressModal'),
  closeModal: document.getElementById('closeModal'),
  addressForm: document.getElementById('addressForm'),
  streetInput: document.getElementById('streetInput'),
  numberInput: document.getElementById('numberInput'),
  coloniaInput: document.getElementById('coloniaInput'),
  confirmedAddress: document.getElementById('confirmedAddress'),
  confirmedAddressContainer: document.getElementById('confirmedAddressContainer'),
  
  // Carrito
  cartSidebar: document.getElementById('cartSidebar'),
  closeSidebar: document.getElementById('closeSidebar'),
  sidebarOverlay: document.getElementById('sidebarOverlay'),
  emptyCartState: document.getElementById('emptyCartState'),
  fullCartState: document.getElementById('fullCartState'),
  cartItemsContainer: document.getElementById('cartItems'),
  cartDeliveryAddress: document.getElementById('cartDeliveryAddress'),
  minOrderMessage: document.getElementById('minOrderMessage'),
  cartSubtotal: document.getElementById('cartSubtotal'),
  checkoutButton: document.getElementById('checkoutButton'),
  clearCartButton: document.getElementById('clearCartButton'),
  
  // Productos
  productsGrid: document.querySelector('.products-grid'),
  addToCartButtons: document.querySelectorAll('.add-to-cart')
};

// Funciones del carrito
function addToCart(e) {
  const button = e.target.closest('.add-to-cart');
  if (!button) return;

  const productCard = button.closest('.product-card');
  const productId = productCard.dataset.id;
  
  const product = {
    id: productId,
    name: productCard.querySelector('.product-name').textContent,
    price: parseFloat(productCard.querySelector('.product-price').textContent.replace(/[^0-9.]/g, '')),
    image: productCard.querySelector('.product-image').src,
    quantity: 1
  };
  
  const existingItem = cartItems.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cartItems.push(product);
  }
  
  updateCart();
  
  // Feedback visual
  button.innerHTML = '<i class="fas fa-check"></i> Añadido';
  button.style.backgroundColor = '#4CAF50';
  
  setTimeout(() => {
    button.innerHTML = '<i class="fas fa-plus"></i> Añadir';
    button.style.backgroundColor = '';
  }, 2000);
}

function updateCart() {
  // Actualizar contador
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  DOM.cartCount.textContent = itemCount;
  
  // Guardar en localStorage
  localStorage.setItem('cartItems', JSON.stringify(cartItems));
  
  // Actualizar UI del carrito si está abierto
  if (DOM.cartSidebar.classList.contains('open')) {
    updateCartUI();
  }
}

function updateCartUI() {
  if (cartItems.length === 0) {
    DOM.emptyCartState.style.display = 'block';
    DOM.fullCartState.style.display = 'none';
    DOM.checkoutButton.disabled = true;
    return;
  }
  
  DOM.emptyCartState.style.display = 'none';
  DOM.fullCartState.style.display = 'block';
  
  // Renderizar items
  DOM.cartItemsContainer.innerHTML = '';
  cartItems.forEach((item, index) => {
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-price">$${item.price.toFixed(2)}</div>
        <div class="quantity-control">
          <button class="quantity-btn" data-index="${index}" data-action="decrease">-</button>
          <span class="quantity-value">${item.quantity}</span>
          <button class="quantity-btn" data-index="${index}" data-action="increase">+</button>
        </div>
      </div>
    `;
    DOM.cartItemsContainer.appendChild(itemElement);
  });
  
  // Calcular subtotal
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  DOM.cartSubtotal.textContent = subtotal.toFixed(2);
  
  // Validar mínimo de compra
  const meetsMinOrder = subtotal >= MIN_ORDER;
  DOM.minOrderMessage.style.display = meetsMinOrder ? 'block' : 'none';
  DOM.checkoutButton.disabled = !meetsMinOrder;
  
  // Event listeners para botones de cantidad
  document.querySelectorAll('.quantity-btn').forEach(btn => {
    btn.addEventListener('click', handleQuantityChange);
  });
}

// Funciones de dirección
function saveAddress(e) {
  e.preventDefault();
  
  const addressData = {
    street: DOM.streetInput.value.trim(),
    number: DOM.numberInput.value.trim(),
    colonia: DOM.coloniaInput.value.trim()
  };
  
  if (addressData.street && addressData.number && addressData.colonia) {
    deliveryAddress = addressData;
    
    // Actualizar UI
    const formattedAddress = `${addressData.street} ${addressData.number}, ${addressData.colonia}`;
    DOM.locationText.textContent = formattedAddress;
    DOM.cartDeliveryAddress.textContent = formattedAddress;
    DOM.confirmedAddress.textContent = formattedAddress;
    DOM.confirmedAddressContainer.style.display = 'block';
    
    // Guardar en localStorage
    localStorage.setItem('deliveryAddress', JSON.stringify(deliveryAddress));
    
    // Resetear formulario
    DOM.addressForm.reset();
    closeAddressModal();
  } else {
    alert('Por favor completa todos los campos de la dirección');
  }
}

// Funciones de modal/carrito
function openAddressModal() {
  DOM.addressModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Si ya hay dirección, mostrarla
  if (deliveryAddress) {
    DOM.streetInput.value = deliveryAddress.street;
    DOM.numberInput.value = deliveryAddress.number;
    DOM.coloniaInput.value = deliveryAddress.colonia;
  }
}

function closeAddressModal() {
  DOM.addressModal.style.display = 'none';
  document.body.style.overflow = '';
}

function openCart() {
  updateCartUI();
  DOM.cartSidebar.classList.add('open');
  DOM.sidebarOverlay.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  DOM.cartSidebar.classList.remove('open');
  DOM.sidebarOverlay.style.display = 'none';
  document.body.style.overflow = '';
}

// Inicialización
function init() {
  // Cargar datos guardados
  if (deliveryAddress) {
    const formattedAddress = `${deliveryAddress.street} ${deliveryAddress.number}, ${deliveryAddress.colonia}`;
    DOM.locationText.textContent = formattedAddress;
    DOM.cartDeliveryAddress.textContent = formattedAddress;
    DOM.confirmedAddress.textContent = formattedAddress;
    DOM.confirmedAddressContainer.style.display = 'block';
  }

  // Event listeners para botones "Añadir al carrito"
  DOM.addToCartButtons.forEach(button => {
    button.addEventListener('click', addToCart);
  });

  // Event listeners generales
  DOM.locationSelector.addEventListener('click', openAddressModal);
  DOM.cartButton.addEventListener('click', openCart);
  DOM.closeModal.addEventListener('click', closeAddressModal);
  DOM.addressForm.addEventListener('submit', saveAddress);
  DOM.closeSidebar.addEventListener('click', closeCart);
  DOM.sidebarOverlay.addEventListener('click', closeCart);
  DOM.clearCartButton.addEventListener('click', () => {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
      cartItems = [];
      updateCart();
    }
  });

  // Cerrar modal al hacer clic fuera
  DOM.addressModal.addEventListener('click', (e) => {
    if (e.target === DOM.addressModal) {
      closeAddressModal();
    }
  });

  // Actualizar carrito al cargar
  updateCart();
}

// Iniciar la aplicación
document.addEventListener('DOMContentLoaded', init);