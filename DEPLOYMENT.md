# Deployment Guide — Yaharika Mart

This guide details how to build, test, and deploy **Yaharika Mart** to cloud hosting platforms (Render, Vercel, Docker) for production releases.

---

## 1. Environment Variables Configuration

Copy `.env.example` to `.env` and fill out the production values:

| Variable | Description | Example / Recommended |
|----------|-------------|-----------------------|
| `MONGO_URI` | MongoDB Atlas Cluster URI | `mongodb+srv://<user>:<pwd>@cluster.mongodb.net/yaharika` |
| `JWT_SECRET` | Secret key for signing Access Tokens | Use a 32+ character random string |
| `JWT_REFRESH_SECRET` | Secret key for signing Refresh Tokens | Use a 32+ character random string |
| `CLIENT_URL` | Domain where Next.js frontend is hosted | `https://yaharika-mart.vercel.app` |
| `PORT` | API Port | `5000` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Account Cloud Name | Used for product image uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | Used for product image uploads |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | Used for product image uploads |

---

## 2. Deploying Backend API to Render

1. Go to [Render Dashboard](https://render.com) and click **New → Web Service**.
2. Connect your GitHub repository.
3. Configure the environment:
   - **Environment**: `Node`
   - **Build Command**: `npm ci --legacy-peer-deps && npm run build --workspace=@yaharika/shared-types && npm run build --workspace=@yaharika/api`
   - **Start Command**: `node apps/api/dist/server.js`
4. Add all environment variables from Section 1 in the **Environment** tab.
5. Set the Health Check path to `/health`.

---

## 3. Deploying Frontend Next.js to Vercel

1. Go to [Vercel Dashboard](https://vercel.com) and click **Add New → Project**.
2. Select your repository.
3. Vercel will automatically detect the Next.js monorepo workspace.
4. Configure:
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add Frontend Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Set to your deployed Render API backend URL (e.g. `https://api.yaharika.in/api`).
   - `NEXT_PUBLIC_SOCKET_URL`: Set to your deployed Render API backend root URL (e.g. `https://api.yaharika.in`).

---

## 4. Docker Production Build

To run the complete production environment using Docker:

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

This starts:
- **API Server Gateway** on `http://localhost:5000`
- **Next.js Web Portal** on `http://localhost:3000`
