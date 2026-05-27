# Ex3 Backend

Simple REST API for the Ex3 user management frontend.

## Run locally

```bash
cd backend
npm start
```

The API runs at:

```text
http://localhost:3000/users
```

## API

```text
GET    /users
GET    /users/:id
POST   /users
PUT    /users/:id
DELETE /users/:id
```

The same endpoints also work with `/api/users`.

## Deploy to Render

Create a new Render Web Service and use these settings:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

After deployment, update the frontend `API_URL` to:

```js
const API_URL = "https://your-render-service.onrender.com/users";
```
