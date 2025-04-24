document.getElementById('logoutButton').addEventListener('click', async () => {
  await window.electron.logout();
  window.location.href = 'index.html';
});

// Cargar productos al iniciar
async function loadProducts() {
  const productsBody = document.getElementById('productsBody');
  productsBody.innerHTML = '';

  const products = await window.electron.loadProducts();
  products.forEach(product => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.type || 'N/A'}</td>
      <td>${product.brand || 'N/A'}</td>
      <td>${product.fuelType || 'N/A'}</td>
      <td>${product.model || 'N/A'}</td>
      <td>${product.price}</td>
      <td>${product.currency}</td>
      <td>${product.features || ''}</td>
      <td>${product.image_url ? `<img src="${product.image_url}" alt="Producto">` : 'Sin imagen'}</td>
      <td>
        <button class="btn btn-warning btn-sm edit-btn" data-id="${product.id}">Editar</button>
        <button class="btn btn-danger btn-sm delete-btn" data-id="${product.id}">Eliminar</button>
      </td>
    `;
    productsBody.appendChild(row);
  });

  // Añadir eventos a los botones de edición y eliminación
  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.getAttribute('data-id');
      editProduct(productId);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.getAttribute('data-id');
      showDeleteModal(productId);
    });
  });
}

// Editar un producto
async function editProduct(productId) {
  const result = await window.electron.getProduct(productId);
  if (result.success) {
    const product = result.data;
    document.getElementById('productId').value = product.id;
    document.getElementById('name').value = product.name;
    document.getElementById('type').value = product.type || '';
    document.getElementById('brand').value = product.brand || '';
    document.getElementById('fuelType').value = product.fuelType || '';
    document.getElementById('model').value = product.model || '';
    document.getElementById('price').value = product.price;
    document.getElementById('currency').value = product.currency;
    document.getElementById('features').value = product.features || '';
    document.getElementById('formTitle').textContent = 'Editar Producto';
    document.getElementById('submitText').textContent = 'Actualizar Producto';
    document.getElementById('cancelEditButton').style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    alert('Error al cargar el producto: ' + result.error);
  }
}

// Cancelar edición
document.getElementById('cancelEditButton').addEventListener('click', () => {
  resetForm();
});

// Cargar un nuevo producto o actualizar uno existente
document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const productId = document.getElementById('productId').value;
  const name = document.getElementById('name').value;
  const type = document.getElementById('type').value;
  const brand = document.getElementById('brand').value;
  const fuelType = document.getElementById('fuelType').value;
  const model = document.getElementById('model').value;
  const price = parseFloat(document.getElementById('price').value);
  const currency = document.getElementById('currency').value;
  const features = document.getElementById('features').value;
  const image = document.getElementById('image').files[0];

  // Validaciones
  if (price <= 0) {
    alert('El precio debe ser mayor que 0.');
    return;
  }

  // Mostrar indicador de carga
  const submitButton = document.getElementById('submitButton');
  const submitText = document.getElementById('submitText');
  const loadingSpinner = document.getElementById('loadingSpinner');
  submitButton.disabled = true;
  submitText.style.display = 'none';
  loadingSpinner.style.display = 'inline-block';

  try {
    const productData = { name, type, brand, fuelType, model, price, currency, features };
    if (productId) {
      // Actualizar producto existente
      const result = await window.electron.updateProduct(productId, productData, image);
      if (result.success) {
        alert('Producto actualizado exitosamente');
      } else {
        alert('Error al actualizar producto: ' + result.error);
      }
    } else {
      // Cargar nuevo producto
      const result = await window.electron.addProduct(productData, image ? { name: image.name, data: await image.arrayBuffer() } : null);
      if (result.success) {
        alert('Producto cargado exitosamente');
      } else {
        alert('Error al cargar producto: ' + result.error);
      }
    }
    resetForm();
    loadProducts();
  } catch (error) {
    alert('Error inesperado: ' + error.message);
  } finally {
    submitButton.disabled = false;
    submitText.style.display = 'inline';
    loadingSpinner.style.display = 'none';
  }
});

// Resetear el formulario
function resetForm() {
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
  document.getElementById('formTitle').textContent = 'Cargar Nuevo Producto';
  document.getElementById('submitText').textContent = 'Cargar Producto';
  document.getElementById('cancelEditButton').style.display = 'none';
}

// Mostrar modal de confirmación para eliminación
let productIdToDelete = null;
function showDeleteModal(productId) {
  productIdToDelete = productId;
  const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
  deleteModal.show();
}

// Confirmar eliminación
document.getElementById('confirmDeleteButton').addEventListener('click', async () => {
  if (productIdToDelete) {
    const result = await window.electron.deleteProduct(productIdToDelete);
    if (result.success) {
      loadProducts();
    } else {
      alert('Error al eliminar producto: ' + result.error);
    }
    productIdToDelete = null;
    const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
    deleteModal.hide();
  }
});

// Cargar productos al iniciar la página
loadProducts();