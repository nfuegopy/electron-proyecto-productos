const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  login: (email, password) => ipcRenderer.invoke('login', email, password),
  logout: () => ipcRenderer.invoke('logout'),
  loadProducts: () => ipcRenderer.invoke('load-products'),
  addProduct: (productData, imageFile) => ipcRenderer.invoke('add-product', productData, imageFile),
  deleteProduct: (productId) => ipcRenderer.invoke('delete-product', productId)
});