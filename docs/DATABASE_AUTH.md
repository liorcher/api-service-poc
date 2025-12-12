# Database Authentication

This project supports two MongoDB authentication modes: local (username/password) and production (certificate-based).

## Configuration

Authentication mode is controlled via environment variables in your `.env` file.

### Environment Variables

```bash
# Database base URI
MONGODB_URI=mongodb://localhost:27017/api-service-poc

# Authentication mode: 'local' or 'certificate'
DB_AUTH_MODE=local

# Local Authentication (username/password)
DB_USERNAME=myuser
DB_PASSWORD=mypassword

# Certificate Authentication (production)
DB_CERT_KEY_PATH=/path/to/mongodb-key.pem
DB_CERT_PEM_PATH=/path/to/mongodb-cert.pem
DB_CA_PATH=/path/to/ca-cert.pem  # Optional
```

## Local Authentication (Development)

Use username/password authentication for local development and non-production environments.

### Setup

1. Set authentication mode:
   ```bash
   DB_AUTH_MODE=local
   ```

2. Provide credentials:
   ```bash
   DB_USERNAME=myuser
   DB_PASSWORD=mypassword
   ```

3. Optionally, credentials can be embedded in the URI:
   ```bash
   MONGODB_URI=mongodb://myuser:mypassword@localhost:27017/api-service-poc
   ```

### Behavior

- If `DB_USERNAME` and `DB_PASSWORD` are provided, they will be used for authentication
- If credentials are in the URI, they take precedence
- If no credentials are provided, connects without authentication (suitable for local MongoDB without auth)

## Certificate-Based Authentication (Production)

Use TLS/SSL certificate authentication for production environments with enhanced security.

### Setup

1. Set authentication mode:
   ```bash
   DB_AUTH_MODE=certificate
   ```

2. Provide certificate paths:
   ```bash
   DB_CERT_KEY_PATH=/etc/mongodb/certs/mongodb-key.pem
   DB_CERT_PEM_PATH=/etc/mongodb/certs/mongodb-cert.pem
   DB_CA_PATH=/etc/mongodb/certs/ca-cert.pem  # Optional
   ```

3. Ensure certificate files are accessible:
   ```bash
   chmod 600 /etc/mongodb/certs/mongodb-key.pem
   chmod 644 /etc/mongodb/certs/mongodb-cert.pem
   ```

### Certificate Files

- **Key File** (`DB_CERT_KEY_PATH`): Private key for the client certificate
- **Certificate File** (`DB_CERT_PEM_PATH`): Client certificate for authentication
- **CA Certificate** (`DB_CA_PATH`): Optional Certificate Authority cert for verification

### MongoDB Server Configuration

Your MongoDB server must be configured to accept certificate authentication:

```yaml
# mongod.conf
net:
  tls:
    mode: requireTLS
    certificateKeyFile: /etc/mongodb/certs/server.pem
    CAFile: /etc/mongodb/certs/ca.pem

security:
  authorization: enabled
```

## Implementation Details

The authentication configuration is handled in `src/config/database.config.ts`:

```typescript
function buildMongoOptions(): MongoClientOptions {
  if (env.DB_AUTH_MODE === 'certificate') {
    return {
      tls: true,
      tlsCertificateKeyFile: env.DB_CERT_KEY_PATH,
      tlsCertificateFile: env.DB_CERT_PEM_PATH,
      tlsCAFile: env.DB_CA_PATH  // if provided
    };
  } else {
    // Local auth with username/password
    return {
      auth: {
        username: env.DB_USERNAME,
        password: env.DB_PASSWORD
      }
    };
  }
}
```

## Security Best Practices

### Local Development
- ✅ Use environment variables for credentials
- ✅ Never commit `.env` file to version control
- ✅ Use weak credentials for local development
- ❌ Don't use production credentials locally

### Production
- ✅ Use certificate-based authentication
- ✅ Store certificates securely (encrypted volumes, secret managers)
- ✅ Restrict file permissions (600 for keys, 644 for certs)
- ✅ Rotate certificates regularly
- ✅ Use separate certificates per environment
- ❌ Never commit certificates to version control
- ❌ Don't use the same certificates across environments

## Troubleshooting

### Connection Errors

**Local Auth:**
```
MongoServerError: Authentication failed
```
- Verify `DB_USERNAME` and `DB_PASSWORD` are correct
- Ensure MongoDB user exists: `db.createUser({user: "myuser", pwd: "mypassword", roles: []})`

**Certificate Auth:**
```
Error: Failed to read certificate files
```
- Verify file paths are correct and files exist
- Check file permissions
- Ensure application has read access

```
MongoServerError: SSL handshake failed
```
- Verify certificates are valid and not expired
- Ensure CA certificate matches
- Check MongoDB server TLS configuration

## Example Configurations

### Development (Local)
```bash
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/myapp-dev
DB_AUTH_MODE=local
DB_USERNAME=devuser
DB_PASSWORD=devpass123
```

### Staging (Certificate)
```bash
NODE_ENV=staging
MONGODB_URI=mongodb://staging-db.example.com:27017/myapp-staging
DB_AUTH_MODE=certificate
DB_CERT_KEY_PATH=/etc/certs/staging-key.pem
DB_CERT_PEM_PATH=/etc/certs/staging-cert.pem
DB_CA_PATH=/etc/certs/ca.pem
```

### Production (Certificate)
```bash
NODE_ENV=production
MONGODB_URI=mongodb://prod-db.example.com:27017/myapp-prod
DB_AUTH_MODE=certificate
DB_CERT_KEY_PATH=/var/secrets/mongodb/prod-key.pem
DB_CERT_PEM_PATH=/var/secrets/mongodb/prod-cert.pem
DB_CA_PATH=/var/secrets/mongodb/ca.pem
```
