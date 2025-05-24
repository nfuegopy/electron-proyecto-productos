const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  login: (email, password) => ipcRenderer.invoke('login', email, password),
  logout: () => ipcRenderer.invoke('logout'),
  loadProducts: () => ipcRenderer.invoke('load-products'),
  getProduct: (productId) => ipcRenderer.invoke('get-product', productId),
  addProduct: (productData, imageFile, imageDescriptionFile) => ipcRenderer.invoke('add-product', productData, imageFile, imageDescriptionFile),
  updateProduct: (productId, productData, imageFile, imageDescriptionFile) => ipcRenderer.invoke('update-product', productId, productData, imageFile, imageDescriptionFile),
  deleteProduct: (productId) => ipcRenderer.invoke('delete-product', productId),
  uploadExcel: (excelFile) => ipcRenderer.invoke('upload-excel', excelFile)
});