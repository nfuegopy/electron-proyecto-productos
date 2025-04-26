document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const excelFile = document.getElementById('excelFile').files[0];
    const submitButton = document.getElementById('submitButton');
    const submitText = document.getElementById('submitText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
  
    if (!excelFile) {
      errorMessage.textContent = 'Por favor, selecciona un archivo Excel.';
      errorMessage.style.display = 'block';
      successMessage.style.display = 'none';
      return;
    }
  
    // Mostrar indicador de carga
    submitButton.disabled = true;
    submitText.style.display = 'none';
    loadingSpinner.style.display = 'inline-block';
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
  
    try {
      const arrayBuffer = await excelFile.arrayBuffer();
      const result = await window.electron.uploadExcel({ name: excelFile.name, data: arrayBuffer });
  
      if (result.success) {
        successMessage.textContent = `Productos cargados exitosamente: ${result.count} productos procesados.`;
        successMessage.style.display = 'block';
        document.getElementById('uploadForm').reset();
      } else {
        errorMessage.textContent = `Error al cargar el archivo: ${result.error}`;
        errorMessage.style.display = 'block';
      }
    } catch (error) {
      errorMessage.textContent = `Error inesperado: ${error.message}`;
      errorMessage.style.display = 'block';
    } finally {
      submitButton.disabled = false;
      submitText.style.display = 'inline';
      loadingSpinner.style.display = 'none';
    }
  });