const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

const keycloakUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080';
const keycloakRealm = process.env.KEYCLOAK_REALM || 'gym-app';
const keycloakClientId = process.env.KEYCLOAK_CLIENT_ID || 'gym-web-client';

const content = `export const environment = {
  production: true,
  keycloak: {
    url: '${keycloakUrl}',
    realm: '${keycloakRealm}',
    clientId: '${keycloakClientId}'
  }
};
`;

fs.writeFileSync(envFile, content, 'utf-8');
console.log(`Environment file generated: ${envFile}`);
console.log(`  KEYCLOAK_URL: ${keycloakUrl}`);
console.log(`  KEYCLOAK_REALM: ${keycloakRealm}`);
console.log(`  KEYCLOAK_CLIENT_ID: ${keycloakClientId}`);
