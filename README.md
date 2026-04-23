# 🌾 SmartSeason Field Monitoring System
https://smartseason-frontend-apv1.onrender.com
A full-stack web application for tracking crop progress across multiple fields during a growing season. Built with TypeScript, Express.js, React, and SQLite.

## ✨ Features

- **User Authentication**: Role-based access control (Admin Coordinator & Field Agents)
- **Field Management**: Create, view, and manage fields with crop types and planting dates
- **Field Stages**: Track four-stage lifecycle (Planted → Growing → Ready → Harvested)
- **Field Updates**: Field agents can update stages and add observation notes
- **Status Tracking**: Automatic status calculation (Active, At Risk, Completed)
- **Dashboards**: Role-specific dashboards with field summaries and statistics
- **Responsive UI**: Clean, intuitive interface for all devices

## 📋 System Requirements

- **Node.js** 16+
- **npm** 8+
- **SQLite3**

## 🗂️ Project Structure

```
smartseason-field-monitoring/
├── backend/                 # Express.js TypeScript API
│   ├── src/
│   │   ├── app.ts          # Main Express application
│   │   ├── config/         # Database configuration & seeding
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth & error handling
│   │   ├── models/         # Data models
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic
│   │   └── types/          # TypeScript interfaces
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API client
│   │   ├── styles/        # CSS stylesheets
│   │   ├── types/         # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── README.md              # This file
└── .gitignore
```

## 🚀 Getting Started

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start the server (development mode)
npm run dev
```

The backend will run on **http://localhost:3000**

### 2. Frontend Setup

In a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create frontend env file
cp .env.example .env

# Start the development server
npm run dev
```

The frontend will run on **http://localhost:5173**

## 🔐 Demo Credentials

The system comes pre-populated with sample data for testing:

```
Admin Coordinator:
  Email: admin@smartseason.com
  Password: admin123

Field Agent 1:
  Email: agent1@smartseason.com
  Password: agent123

Field Agent 2:
  Email: agent2@smartseason.com
  Password: agent123
```

## 🛠️ Technology Stack

### Backend
- **Express.js**: Web framework
- **TypeScript**: Type safety
- **SQLite3**: Database
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin requests

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool & dev server
- **React Router**: Client-side routing
- **Axios**: HTTP client

## 📐 Design Decisions

### 1. Database Schema
- **Users Table**: Stores user credentials and role information
- **Fields Table**: Contains field metadata and current status
- **Field Updates Table**: Maintains audit trail of stage changes and observations

Using SQLite for simplicity; can be replaced with PostgreSQL/MySQL in production.

### 2. Authentication
- JWT-based stateless authentication
- Tokens stored in localStorage on frontend
- Automatic token injection via Axios interceptor
- Frontend API base URL is configurable through `VITE_API_BASE_URL`
- Password hashing with bcryptjs (10 salt rounds)

### 3. Authorization
- Role-based access control (RBAC) via middleware
- Admin: Full field management and monitoring
- Field Agent: Update assigned fields and view personal statistics
- Boundary: Agents cannot see all fields, only assigned ones

### 4. Field Status Logic
The system calculates field status based on current stage:
- **Planted Stage** → **ACTIVE** (early progress)
- **Growing Stage** → **ACTIVE** (normal progress)
- **Ready Stage** → **AT_RISK** (requires harvest coordination)
- **Harvested Stage** → **COMPLETED** (finished)

This logic can be extended with additional factors (weather, time since planting, etc.)

### 5. API Architecture
- **RESTful endpoints** with clear separation of concerns
- **Service layer** for business logic (status calculation, data retrieval)
- **Controller layer** for request handling and validation
- **Middleware** for cross-cutting concerns (auth, error handling)
- **Type-safe routes** using TypeScript

### 6. Frontend Structure
- **Context API** for global authentication state
- **Protected Routes** for role-based access
- **Component-based** with separation of logic and presentation
- **CSS modules** for scoped styling
- **Responsive grid layouts** for different screen sizes

### 7. Data Seeding
Automatic sample data creation on backend startup:
- 1 admin coordinator with 3 sample fields
- 2 field agents with assigned fields
- 3 sample fields in different growth stages

## 📊 Key Features Explained

### Field Lifecycle
```
Planted → Growing → Ready → Harvested
  ↓         ↓        ↓         ↓
ACTIVE    ACTIVE  AT_RISK  COMPLETED
```

### Admin Dashboard
- Total fields count
- Status breakdown (Active, At Risk, Completed)
- Stage distribution
- Full visibility across all fields

### Field Agent Dashboard
- Count of assigned fields
- Personal field statistics
- Stage and status summary

### Field Updates
- Agents record stage progress
- Add observation notes (weather, pest issues, etc.)
- Audit trail of all changes with timestamps

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Authenticate and get JWT
- `GET /api/auth/profile` - Get current user (requires auth)

### Fields (require authentication)
- `GET /api/fields` - All fields (admin) or all fields (agent view)
- `GET /api/fields/:id` - Field details with updates
- `GET /api/fields/my-fields` - Agent's assigned fields
- `POST /api/fields` - Create field (admin only)
- `PATCH /api/fields/:id` - Update field (admin only)
- `POST /api/fields/:fieldId/updates` - Add update (agents)
- `GET /api/fields/statistics` - System statistics (admin only)

### Agents (require authentication)
- `GET /api/agents` - List all agents (admin only)
- `GET /api/agents/:id` - Agent details (admin only)
- `GET /api/agents/stats/my` - Personal statistics (agent)

## 🧪 Development Workflow

### Building
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

### Type Checking
```bash
# Backend
cd backend && npm run typecheck

# Frontend
cd frontend && npm run typecheck
```

## 🚢 Production Deployment

### Backend
1. Set environment variables in `.env`
2. Build: `npm run build`
3. Run: `npm start`

### Frontend
1. Build: `npm run build`
2. Deploy `dist/` folder to static hosting
3. Set `VITE_API_BASE_URL` to the backend origin

### Recommended Hosting Setup

The simplest production setup for this project is:
- Host `backend/` as a Node web service
- Host `frontend/` as a static site

This matches the current architecture and keeps deployment straightforward.

### Example Deployment Flow

Backend service:
1. Set the project root to `backend`
2. Build with `npm install && npm run build`
3. Start with `npm start`
4. Configure:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `DATABASE_PATH=./data/smartseason.db`
   - `JWT_SECRET=<strong-secret>`
   - `CORS_ORIGIN=<frontend-url>`

Frontend static site:
1. Set the project root to `frontend`
2. Build with `npm install && npm run build`
3. Publish the `dist` directory
4. Configure `VITE_API_BASE_URL=https://your-backend-domain`

### Deployment Notes

- In local development, the frontend uses Vite's `/api` proxy.
- In production, the frontend reads `VITE_API_BASE_URL`.
- SQLite is acceptable for a demo deployment, but many hosts use ephemeral filesystems. If persistent storage is not attached, database changes may be lost after redeploys or restarts.
- For a more durable deployment, move the database to PostgreSQL or another managed relational database.

### Environment Variables
```
NODE_ENV=production
PORT=3000
DATABASE_PATH=/var/lib/smartseason/smartseason.db
JWT_SECRET=<use-strong-secret-key>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://yourdomain.com
```

## 🔍 Error Handling

- **400 Bad Request**: Invalid input or missing required fields
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Insufficient permissions for action
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Unexpected server error

## 🎨 UI/UX Highlights

- **Color-coded stages**: Visual distinction for field lifecycles
- **Status badges**: Quick status identification
- **Responsive grid**: Auto-layout for different screen sizes
- **Clear navigation**: Role-specific menu items
- **Form validation**: Client and server-side validation
- **Error messages**: Clear feedback on failures

## 📝 Assumptions

1. **One admin coordinator** manages all fields
2. **Field agents assigned** to specific fields (not multiple admins)
3. **No concurrent editing** - simple optimistic updates
4. **SQLite is sufficient** for MVP (easily scale to PostgreSQL)
5. **JWT tokens don't expire during session** (7 days default)
6. **Field stages are linear** (can only progress forward)
7. **No real-time features** (polling could be added)

## 🛣️ Future Enhancements

- [ ] **Weather integration**: Auto-status based on conditions
- [ ] **Photo uploads**: Field monitoring with images
- [ ] **Notifications**: Alert admins to at-risk fields
- [ ] **Advanced analytics**: Yield prediction models
- [ ] **Multi-season tracking**: Historical comparisons
- [ ] **Mobile app**: React Native version
- [ ] **Real-time updates**: WebSocket notifications
- [ ] **Google Maps**: Field location visualization
- [ ] **CSV export**: Data export for analysis
- [ ] **API rate limiting**: Prevent abuse

## 🧹 Code Quality

- **TypeScript**: Full type safety across codebase
- **Consistent naming**: Clear, descriptive identifiers
- **Error handling**: Try-catch with proper error messages
- **Separation of concerns**: Controllers, services, middleware
- **No hardcoded values**: Configuration via environment
- **Clean commits**: Logical, focused changes

## 📄 License

This project is provided as-is for educational and demonstration purposes.

---

**Built with ❤️ for field monitoring excellence**

For questions or issues, please refer to the inline code comments or create an issue on the repository.
