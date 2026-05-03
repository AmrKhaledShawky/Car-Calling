# Free Deployment With Vercel

This project can be deployed as one free Vercel Hobby project:

- Vite React frontend is built into `dist`.
- Express backend runs as a Vercel Function through `api/index.js`.
- MongoDB should use a free MongoDB Atlas M0 cluster.

## 1. Create A Free Database

1. Create a MongoDB Atlas M0 free cluster.
2. Create a database user.
3. In Network Access, add `0.0.0.0/0` for a simple demo deployment.
4. Copy the Node.js connection string and include a database name:

```text
mongodb+srv://USER:PASSWORD@HOST/car-calling?retryWrites=true&w=majority&appName=CarCalling
```

## 2. Deploy On Vercel

1. Push this repository to GitHub.
2. In Vercel, import the GitHub repository.
3. Use the Vite framework preset if Vercel asks.
4. Keep the root directory as the repository root.
5. Vercel will read `vercel.json` for the install command, build command, output directory, and API rewrites.

## 3. Add Environment Variables

Add these in Vercel Project Settings -> Environment Variables:

```text
NODE_ENV=production
MONGODB_URI=mongodb+srv://USER:PASSWORD@HOST/car-calling?retryWrites=true&w=majority&appName=CarCalling
JWT_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-a-different-long-random-secret
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
FRONTEND_URL=https://YOUR-PROJECT.vercel.app
```

If you use these features, also add their real values:

```text
EMAIL_SERVICE=
EMAIL_USER=
EMAIL_PASS=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
```

`VITE_API_URL` is not needed on Vercel because the frontend calls the same domain at `/api`.

## 4. Test The Deployment

After Vercel finishes deploying, open:

```text
https://YOUR-PROJECT.vercel.app
https://YOUR-PROJECT.vercel.app/api/health
```

If `/api/health` returns an error, check the Vercel Function logs first. The most common issue is a missing or incorrect `MONGODB_URI`, `JWT_SECRET`, or `JWT_REFRESH_SECRET`.
