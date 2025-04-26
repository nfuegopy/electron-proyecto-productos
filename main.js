import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { auth, db, storage, signInWithEmailAndPassword, signOut, collection, getDocs, addDoc, doc, getDoc, deleteDoc, ref, uploadBytes, getDownloadURL, deleteObject, updateDoc } from './firebase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.loadFile(path.join(__dirname, 'renderer/index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Manejar login
ipcMain.handle('login', async (event, email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('UID del usuario autenticado:', user.uid);
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      console.log('Datos del usuario en Firestore:', userDoc.data());
      if (userDoc.data().role === 'admin') {
        return { success: true };
      } else {
        throw new Error('Acceso denegado: Solo los administradores pueden iniciar sesión.');
      }
    } else {
      throw new Error('Usuario no encontrado en la base de datos.');
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Manejar logout
ipcMain.handle('logout', async () => {
  await signOut(auth);
  return { success: true };
});

// Cargar productos
ipcMain.handle('load-products', async () => {
  const snapshot = await getDocs(collection(db, 'products'));
  const products = [];
  snapshot.forEach(doc => {
    products.push({ id: doc.id, ...doc.data() });
  });
  return products;
});

// Obtener un producto
ipcMain.handle('get-product', async (event, productId) => {
  try {
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (productDoc.exists()) {
      return { success: true, data: { id: productDoc.id, ...productDoc.data() } };
    } else {
      return { success: false, error: 'Producto no encontrado' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Añadir producto
ipcMain.handle('add-product', async (event, productData, imageFile) => {
  try {
    let imageUrl = '';
    if (imageFile) {
      const currentUser = auth.currentUser;
      console.log('Usuario autenticado antes de subir imagen:', currentUser ? currentUser.uid : 'No autenticado');
      const imageBuffer = Buffer.from(imageFile.data);
      const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageBuffer);
      imageUrl = await getDownloadURL(storageRef);
    }
    const docRef = await addDoc(collection(db, 'products'), {
      articleNumber: productData.articleNumber,
      name: productData.name,
      type: productData.type,
      brand: productData.brand,
      fuelType: productData.fuelType,
      model: productData.model,
      price: productData.price,
      currency: productData.currency,
      features: productData.features,
      image_url: imageUrl,
      created_at: new Date().toISOString()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Actualizar producto
ipcMain.handle('update-product', async (event, productId, productData, imageFile) => {
  try {
    let imageUrl = productData.image_url || '';
    if (imageFile) {
      const imageBuffer = Buffer.from(imageFile.data);
      const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageBuffer);
      imageUrl = await getDownloadURL(storageRef);
      // Eliminar la imagen anterior si existe
      if (productData.image_url) {
        const oldImageRef = ref(storage, productData.image_url);
        await deleteObject(oldImageRef);
      }
    }
    await updateDoc(doc(db, 'products', productId), {
      articleNumber: productData.articleNumber,
      name: productData.name,
      type: productData.type,
      brand: productData.brand,
      fuelType: productData.fuelType,
      model: productData.model,
      price: productData.price,
      currency: productData.currency,
      features: productData.features,
      image_url: imageUrl
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Eliminar producto
ipcMain.handle('delete-product', async (event, productId) => {
  try {
    const productDoc = await getDoc(doc(db, 'products', productId));
    const product = productDoc.data();
    if (product.image_url) {
      const imageRef = ref(storage, product.image_url);
      await deleteObject(imageRef);
    }
    await deleteDoc(doc(db, 'products', productId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});