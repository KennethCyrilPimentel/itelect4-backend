# itelect4-backend

REST API for **Shoot Tracker**, a photography booking app. Built with Node, Express, TypeScript, MongoDB (Mongoose) and JWT authentication.

## Live links

- **Live backend (API):** https://itelect4-backend-eta.vercel.app
- **Live frontend:** https://itelect4-project-it-4-b-mu.vercel.app
- **Frontend repo:** https://github.com/KennethCyrilPimentel/itelect4-project-IT4B

Health check: https://itelect4-backend-eta.vercel.app/api/health

## Routes

Every route except register, login and health needs the header `Authorization: Bearer <token>`. Each user only sees their own rows.

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Server and database status |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in, returns `{ token, user }` |
| GET | `/api/shoots` | List my shoots |
| GET | `/api/shoots/:id` | One shoot |
| POST | `/api/shoots` | Create a shoot |
| PATCH | `/api/shoots/:id` | Update a shoot |
| DELETE | `/api/shoots/:id` | Delete a shoot |
| GET | `/api/deliverables` | List my deliverables (`?shootId=` filters by shoot) |
| GET | `/api/deliverables/:id` | One deliverable |
| POST | `/api/deliverables` | Create a deliverable on one of my shoots |
| PATCH | `/api/deliverables/:id` | Update a deliverable |
| DELETE | `/api/deliverables/:id` | Delete a deliverable |

## Run it locally

```
npm install
npm run dev
```

Create a `.env` file with:

```
MONGODB_URI=your MongoDB Atlas connection string
JWT_SECRET=any long random string
CLIENT_URL=http://localhost:5173
```

The API runs on http://localhost:4000. Other scripts: `npm run build` and `npm run typecheck`.

## Deployment

Deployed on Vercel. `MONGODB_URI`, `JWT_SECRET` and `CLIENT_URL` (the frontend's address, used for CORS) are set as environment variables there.
