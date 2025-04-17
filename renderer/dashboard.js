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
      <td>${product.price}</td>
      <td>${product.currency}</td>
      <td>${product.features || ''}</td>
      <td>${product.image_url ? `<img src="${product.image_url}" width="50">` : 'Sin imagen'}</td>
      <td><button class="btn btn-danger btn-sm delete-btn" data-id="${product.id}">Eliminar</button></td>
    `;
    productsBody.appendChild(row);
  });

  // Añadir eventos a los botones de eliminación
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.getAttribute('data-id');
      showDeleteModal(productId);
    });
  });
}

// Cargar un nuevo producto
document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const type = document.getElementById('type').value;
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
    const productData = { name, type, price, currency, features };
    const result = await window.electron.addProduct(productData, image ? { name: image.name, data: await image.arrayBuffer() } : null);
    if (result.success) {
      alert('Producto cargado exitosamente');
      document.getElementById('productForm').reset();
      loadProducts();
    } else {
      alert('Error al cargar producto: ' + result.error);
    }
  } catch (error) {
    alert('Error inesperado: ' + error.message);
  } finally {
    submitButton.disabled = false;
    submitText.style.display = 'inline';
    loadingSpinner.style.display = 'none';
  }
});

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