import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { auth, db, storage, signInWithEmailAndPassword, signOut, collection, getDocs, addDoc, doc, getDoc, deleteDoc, ref, uploadBytes, getDownloadURL, deleteObject, updateDoc } from './firebase.js';
import XLSX from 'xlsx';

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
ipcMain.handle('add-product', async (event, productData, imageFile, imageDescriptionFile) => {
  try {
    let imageUrl = '';
    let imageDescriptionUrl = '';
    if (imageFile) {
      const imageBuffer = Buffer.from(imageFile.data);
      const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageBuffer);
      imageUrl = await getDownloadURL(storageRef);
    }
    if (imageDescriptionFile) {
      const imageDescriptionBuffer = Buffer.from(imageDescriptionFile.data);
      const storageRef = ref(storage, `products/${Date.now()}_${imageDescriptionFile.name}`);
      await uploadBytes(storageRef, imageDescriptionBuffer);
      imageDescriptionUrl = await getDownloadURL(storageRef);
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
      image_description_url: imageDescriptionUrl,
      created_at: new Date().toISOString()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Actualizar producto
ipcMain.handle('update-product', async (event, productId, productData, imageFile, imageDescriptionFile) => {
  try {
    let imageUrl = productData.image_url || '';
    let imageDescriptionUrl = productData.image_description_url || '';
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
    if (imageDescriptionFile) {
      const imageDescriptionBuffer = Buffer.from(imageDescriptionFile.data);
      const storageRef = ref(storage, `products/${Date.now()}_${imageDescriptionFile.name}`);
      await uploadBytes(storageRef, imageDescriptionBuffer);
      imageDescriptionUrl = await getDownloadURL(storageRef);
      // Eliminar la imagen anterior si existe
      if (productData.image_description_url) {
        const oldImageRef = ref(storage, productData.image_description_url);
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
      image_url: imageUrl,
      image_description_url: imageDescriptionUrl
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
    if (product.image_description_url) {
      const imageDescriptionRef = ref(storage, product.image_description_url);
      await deleteObject(imageDescriptionRef);
    }
    await deleteDoc(doc(db, 'products', productId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Cargar archivo Excel masivamente
ipcMain.handle('upload-excel', async (event, excelFile) => {
  try {
    // Leer el archivo Excel
    const workbook = XLSX.read(Buffer.from(excelFile.data), { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    let count = 0;
    for (const row of data) {
      // Mapear los campos del Excel a la estructura de Firestore
      const productData = {
        articleNumber: row['Número de artículo'] || '',
        name: row['Descripción del artículo'] || '',
        type: row['Tipo'] || '',
        brand: row['Marca'] ? row['Marca'].toLowerCase() : '',
        model: row['Modelo'] || '',
        fuelType: '', // No está en el Excel, dejar vacío
        price: 0, // No está en el Excel, establecer en 0
        currency: 'USD', // Predeterminado en USD
        features: '', // No está en el Excel, dejar vacío
        image_url: '', // No hay imágenes en el Excel
        image_description_url: '', // No hay imágenes en el Excel
        created_at: new Date().toISOString()
      };

      // Validar campos obligatorios
      if (!productData.articleNumber || !productData.name || !productData.type || !productData.brand || !productData.model) {
        console.warn('Fila omitida por datos incompletos:', productData);
        continue;
      }

      // Guardar en Firestore
      await addDoc(collection(db, 'products'), productData);
      count++;
    }

    return { success: true, count };
  } catch (error) {
    return { success: false, error: error.message };
  }
});