export const environment = {
  production: false,
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'gym-app',
    clientId: 'gym-web-client'
  },
  firebase: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT.firebasestorage.app',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID'
  },
  cloudinary: {
    cloudName: 'YOUR_CLOUD_NAME',
    uploadPreset: 'YOUR_UPLOAD_PRESET'
  }
};
