# Project Setup Guide

This guide provides step-by-step instructions to set up and run both the Expo React Native frontend and the Express.js backend.

## Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (latest LTS version recommended)
- **npm** or **yarn**

## Frontend (Expo React Native)

### Setup

1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
   or
   ```sh
   yarn install
   ```
3. Start the Expo development server:
   ```sh
   npx expo start
   ```
4. Scan the QR code with the Expo Go app (Android/iOS) or run it on an emulator:
   ```sh
   npx expo start --android   # For Android(Need Android Studio First)
   npx expo start --ios       # For iOS (MacOS required; Need Xcode First)
   ```

## Backend (Express.js)

### Setup

1. Navigate to the backend directory:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
   or
   ```sh
   yarn install
   ```
3. Create a `.env` file in the `backend` directory and add your environment variables:
   ```env
   ENDPOINT=
   PROJECT_ID=
   API_KEY=
   DATABASE_ID=
   CALL_COLLECTION_ID=
   CONTACT_COLLECTION_ID=
   ```
4. Start the backend server:
   ```sh
   npm start
   ```
   or (for hot reloading)
   ```sh
   npm run dev  # If using nodemon
   ```

## Connecting Frontend with Backend

- Ensure the API base URL in your frontend project matches the backend's running address, usually `http://localhost:3000`.
- Update API URLs in the frontend code where necessary, e.g., `axios` requests:
  ```js
  const API_BASE_URL = "http://localhost:3000";
  ```

## Troubleshooting

- If Expo doesn't detect the device, ensure your emulator/simulator is running or connect a physical device.
- If the backend doesn't start, check `.env` file configuration and ensure no ports are blocked.

## Additional Commands

- To build the React Native app:
  ```sh
  npx expo build
  ```
- To test the backend API:
  ```sh
  curl http://localhost:3000/api/test
  ```

