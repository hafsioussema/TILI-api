# TILI API

REST API built with NestJS for user management and authentication.

## Features

- JWT authentication with access and refresh tokens
- Role-based access control: `ADMIN`, `CHEF_PROJET`, and `CONSULTANT`
- Administrator-managed account creation
- SMTP email notifications for welcome and password-change flows
- Account lockout after repeated failed login attempts
- Swagger API documentation
- Unit and end-to-end tests

## Prerequisites

- Node.js 18 or a version supported by the project
- MongoDB 6+
- SMTP provider for email features (Mailtrap can be used during development)

## Setup

```bash
git clone <repository-url>
cd <repository-directory>
npm install
```

Create a local environment file from the example:

```bash
cp .env.example .env
```

Update `.env` with your local configuration. Before first startup, generate separate unique values for `JWT_SECRET` and `ADMIN_PASSWORD` (run the command twice and use a different result each time):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Set `ADMIN_EMAIL` to a real administrator email. When no administrator exists yet, startup refuses placeholder or legacy default admin credentials. The initial administrator must change the password after signing in. Never commit `.env` or deployment secrets.

## Environment Configuration

Configure the following values in your local `.env` file as needed by the application:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/tili-db
JWT_SECRET=replace-with-a-unique-random-jwt-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM="TILI App <noreply@example.com>"
ADMIN_EMAIL=replace-with-your-admin-email
ADMIN_PASSWORD=replace-with-a-unique-random-admin-password
```

These are example placeholders only. Use strong unique secrets locally and store production values in your deployment platform's secret manager. Never reuse example credentials in production.

## Run the API

Development mode:

```bash
npm run start:dev
```

Build and run:

```bash
npm run build
npm run start:prod
```

When the server is running, Swagger documentation is available at:

```
http://localhost:3000/api/docs
```

## Authentication Flow

1. An administrator creates a user account through `POST /users`.
2. The user receives an email when configured.
3. The user signs in through `POST /auth/login`.
4. The user can update their profile and change their password using the relevant authenticated endpoints.

For the complete endpoint list and request schemas, consult the Swagger documentation and source code.

## Testing

Run the tests configured in the repository:

```bash
npm test
npm run test:e2e
```

Check `package.json` for the exact scripts supported by the current branch.

## Security Notes

- Keep `.env` out of version control.
- Rotate any credential that may have been committed previously.
- Use a unique, high-entropy JWT secret in each environment.
- Restrict Swagger access appropriately in production.
