const { initializeApp } = require('firebase/app');
const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} = require('firebase/storage');
const multer = require('multer');

const firebaseConfig = {
  apiKey: 'AIzaSyDOkC-FMpYNyDb_TYPiZ-m_EoifRTzVsjA',
  authDomain: 'kohineko-7d678.firebaseapp.com',
  projectId: 'kohineko-7d678',
  storageBucket: 'kohineko-7d678.appspot.com',
  messagingSenderId: '597681719456',
  appId: '1:597681719456:web:3c099019e2888fb36461c5',
  measurementId: 'G-X221KMS0F4',
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const uploadImage = (file, folder) =>
  new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Image file is undefined'));
    } else {
      const fileName = Date.now();
      const storageRef = ref(storage, `${folder}/${fileName}`);
      if (file.mimetype.includes('image') === false) {
        reject(new Error('File is not an image'));
      }
      uploadBytes(storageRef, file.buffer, { contentType: file.mimetype })
        .then(() => {
          console.log('Image uploaded successfully!');
          return getDownloadURL(storageRef);
        })
        .then((downloadURL) => {
          console.log('Image URL:', downloadURL);
          resolve(downloadURL);
        })
        .catch((error) => {
          reject(error);
        });
    }
  });

const upload = multer({
  storage: multer.memoryStorage(),
});

const deleteImage = (url) => {
  const storageRef = ref(storage, url);
  deleteObject(storageRef)
    .then(() => {
      console.log('Image deleted successfully!');
    })
    .catch((error) => {
      console.error('Error deleting image:', error);
    });
};

module.exports = { uploadImage, upload, deleteImage };
