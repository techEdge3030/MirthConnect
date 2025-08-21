# Mirth Web App - Developer Setup Guide

Welcome to the Mirth Web App project! This guide will help you get your development environment up and running quickly.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Mirth Connect Installation](#mirth-connect-installation)
3. [Project Structure](#project-structure)
4. [Runtime Configuration](#runtime-configuration)
5. [Setup Instructions](#setup-instructions)
6. [Running the Development Servers](#running-the-development-servers)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites
- **Node.js v16** (use [nvm](https://github.com/nvm-sh/nvm) to manage versions)
- **npm** (comes with Node.js)
- **Mirth Connect** (see below)
- (Optional) **Wireshark** for API traffic analysis
- **Quick Setup:**
  - Use `setup-dev.sh` (Linux/macOS) or `setup-dev.ps1` (Windows) in the project root to automatically install Node.js, npm, and other project dependencies except for Mirth.

---

## Mirth Connect Installation
1. Download Mirth Connect and Administrator Launcher from the [official downloads](https://github.com/nextgenhealthcare/connect/discussions/6310).
2. Install and run Mirth Connect.
3. **Default credentials:**
   - Username: `admin`
   - Password: `admin`
4. Edit the file `[Installation Path]/conf/mirth.properties` and add:
   ```
    server.api.allowhttp = true
   ```
   This allows non-HTTPS API calls for local development.

---

## Project Structure
- `client/` - React frontend (Vite, MUI, TypeScript)
- `server/` - Node.js/Express backend (API proxy)

---

## Runtime Configuration

The client app is now configured at runtime using `client/public/config.json`.

**Edit this file to set the Mirth API URL and the UI context path:**

```
{
  "MIRTH_API_URL": "http://localhost:8081",
  "UI_CONTEXT_PATH": "/"
}
```
- `MIRTH_API_URL` should point to your backend server (usually `localhost:8081` for local dev).
- `UI_CONTEXT_PATH` should be the base path where the app is served (usually `/`).

**You no longer need to set VITE_API_URL or use a .env file for the client.**

---

## Setup Instructions

### 1. Node Version
Ensure you are using Node.js v16:
```sh
nvm install 16
nvm use 16
node -v
```

### 2. Install Dependencies
From the project root, run:
```sh
npm install
```
This will install dependencies for both the root and the subprojects (`client` and `server`).

---

## Running the Development Servers

### Recommended: Start Both Client and Server Together
From the project root, simply run:
```sh
npm run dev
```
This will launch both the backend (API proxy) and the frontend concurrently using [concurrently](https://www.npmjs.com/package/concurrently):
- Backend: [http://localhost:8081](http://localhost:8081)
- Frontend: [http://localhost:3000](http://localhost:3000)

### Manual: Start Individually (if needed)
You can also start each service separately:
- **Backend:**
  ```sh
  cd server
  npm run dev
  ```
- **Frontend:**
  ```sh
  cd client
  npm run dev
  ```

### Access the App
- Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Additional Notes
- **CORS:** The backend acts as a proxy to handle CORS and authentication headers for Mirth Connect.
- **Wireshark:** (Optional) Use Wireshark to analyze API traffic if you need to reverse-engineer or debug Mirth Connect API calls.
- **Production Builds:**
  - Client: `npm run build` (see `package.json` for environment-specific builds)
  - Server: `npm run build`

---

## Troubleshooting
- **config.json:** Make sure `client/public/config.json` is present and correctly configured.
- **Mirth Connect not reachable:** Check that Mirth Connect is running and accessible at the URL specified in `server/.env`.
- **Port conflicts:** Ensure nothing else is running on ports 3000 (frontend), 8081 (backend), or 8080 (Mirth Connect default).
- **Node version:** Use Node.js v16 for compatibility.

---

## Contributing
- Please follow existing code style and commit conventions.
- Open issues or pull requests for bugs, features, or questions.

---

## License
See LICENSE file for details.
