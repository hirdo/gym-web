const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

const keycloakUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080';
const keycloakRealm = process.env.KEYCLOAK_REALM || 'gym-app';
const keycloakClientId = process.env.KEYCLOAK_CLIENT_ID || 'gym-web-client';

const firebaseApiKey = process.env.FIREBASE_API_KEY || '';
const firebaseAuthDomain = process.env.FIREBASE_AUTH_DOMAIN || '';
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID || '';
const firebaseStorageBucket = process.env.FIREBASE_STORAGE_BUCKET || '';
const firebaseMessagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID || '';
const firebaseAppId = process.env.FIREBASE_APP_ID || '';

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
const cloudinaryUploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || '';

const content = `export const environment = {
  production: true,
  keycloak: {
    url: '${keycloakUrl}',
    realm: '${keycloakRealm}',
    clientId: '${keycloakClientId}'
  },
  firebase: {
    apiKey: '${firebaseApiKey}',
    authDomain: '${firebaseAuthDomain}',
    projectId: '${firebaseProjectId}',
    storageBucket: '${firebaseStorageBucket}',
    messagingSenderId: '${firebaseMessagingSenderId}',
    appId: '${firebaseAppId}'
  },
  cloudinary: {
    cloudName: '${cloudinaryCloudName}',
    uploadPreset: '${cloudinaryUploadPreset}'
  }
};
`;

fs.writeFileSync(envFile, content, 'utf-8');
console.log(`Environment file generated: ${envFile}`);
console.log(`  KEYCLOAK_URL: ${keycloakUrl}`);
console.log(`  KEYCLOAK_REALM: ${keycloakRealm}`);
console.log(`  KEYCLOAK_CLIENT_ID: ${keycloakClientId}`);
console.log(`  FIREBASE_PROJECT_ID: ${firebaseProjectId || '(not set)'}`);
console.log(`  CLOUDINARY_CLOUD_NAME: ${cloudinaryCloudName || '(not set)'}`);
