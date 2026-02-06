# MyBusinesSpace Backend API

REST API with Google OAuth authentication, company management, teams, cases, and contacts. Includes WebSocket for real-time communication.

## � API Documentation

### Accessing the Documentation

**Option 1: Local Development (Recommended)**

When running the backend server locally, access the interactive Swagger documentation at:

```
http://localhost:3001/api-docs
```

**Option 2: GitHub Pages (Published)**

The documentation is automatically published to GitHub Pages on every push to main/master:

```
https://redcrane-slu.github.io/mybusinesspace-backend/
```

**Option 3: Static OpenAPI Spec**

You can also access the raw OpenAPI specification:

- **Local**: Run `npm run docs:generate` and check `docs/openapi.json`
- **Import into Postman**: Import the `openapi.json` file
- **Swagger Editor**: Upload to https://editor.swagger.io/

### Available Scripts

```bash
# Generate OpenAPI JSON file
npm run docs:generate

# Generate and serve docs locally (requires serve package)
npm run docs:serve
```

### How to Update Documentation

The API documentation is generated from JSDoc comments in the route files. To add or update documentation:

1. Open the relevant route file in `src/modules/*/routes.ts` or `src/core/api/*/routes.ts`
2. Add or modify the `@swagger` JSDoc comments above each endpoint
3. Follow the OpenAPI 3.0 specification format
4. The documentation will automatically update when you:
    - Reload `http://localhost:3001/api-docs` (local dev)
    - Push to main/master (GitHub Pages)

### Deployment

**Automatic Deployment**

GitHub Actions automatically deploys the documentation to GitHub Pages when you push to main/master.

Workflow file: `.github/workflows/deploy-docs.yml`

**Enabling GitHub Pages**

To enable GitHub Pages for your repository:

1. Go to GitHub repository settings
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Push to main/master to trigger the deployment

## 🚀 Tech Stack

- **Node.js** + **TypeScript**
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
    - Local development: Docker container
    - Deployment: Supabase
- **Passport.js** - OAuth authentication
- **JSON Web Tokens** - Session management
- **WebSocket** - Real-time communication
- **Swagger/OpenAPI** - API documentation

## 📋 Prerequisites

**Required:**

- [Node.js](https://nodejs.org/) v20+
- [npm](https://www.npmjs.com/) v10+
- [Docker](https://www.docker.com/) and Docker Compose - For local PostgreSQL database

## ⚙️ Setup

### 1. Install Docker

If you don't have Docker installed:

- **macOS**: [Download Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
- **Linux**: Follow [Docker Engine installation guide](https://docs.docker.com/engine/install/)

Docker Desktop includes Docker Compose automatically.

### 2. Install dependencies

```bash
npm install
```

### 3. Generate Prisma Client

After installing dependencies, you need to generate the Prisma Client:

```bash
npx prisma generate
```

This step is **required** before starting the server, as it generates the necessary TypeScript types and the Prisma Client code that the application uses to interact with the database.

> **Note**: If you get an error like `Cannot find module '.prisma/client/default'`, it means you need to run this command.

### 4. Start PostgreSQL with Docker

```bash
# Start PostgreSQL in the background
docker compose up -d

# Verify it's running
docker compose ps

# View logs if needed
docker compose logs -f postgres
```

This will:

- Create a PostgreSQL 16 container
- Expose it on port `5432`
- Create a database named `authdb`
- Use credentials: `postgres` / `postgres123`

### 5. Configure environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Server
NODE_ENV=development
PORT=3001

# Local PostgreSQL Database (from Docker)
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/authdb

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Session
SESSION_SECRET=your-super-secret-session-key-min-32-chars

# Frontend
FRONTEND_URL=http://localhost:3000
```

#### 🔑 Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google OAuth API
4. Create OAuth 2.0 credentials
5. Configure authorized redirect URIs:
    - `http://localhost:3001/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

#### � Generate Secure Secrets

```bash
# Generate JWT_SECRET
openssl rand -hex 32

# Generate SESSION_SECRET
openssl rand -hex 32
```

## 🏃‍♂️ Run the Application

### Development

```bash
# Make sure PostgreSQL is running (if not already started)
docker compose up -d

# Run the backend in development mode with hot-reload
npm run dev
```

API will be available at: `http://localhost:3001`

### Stop the Database

```bash
# Stop PostgreSQL container
docker compose down

# Stop and remove data (⚠️ deletes all database data)
docker compose down -v
```
