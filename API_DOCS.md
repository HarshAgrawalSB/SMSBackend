# Student Enrollment API

## Base URL
- **Production**: Your Vercel URL
- **Development**: http://localhost:5000

## Available Endpoints

### Root
- `GET /` - API information and available endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Leads
- `GET /api/leads` - Get all leads
- `POST /api/leads` - Create new lead
- `GET /api/leads/:id` - Get lead by ID
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Programs
- `GET /api/programs` - Get all programs
- `GET /api/programs/public` - Get public program list
- `POST /api/programs` - Create new program
- `GET /api/programs/:id` - Get program by ID
- `PUT /api/programs/:id` - Update program
- `DELETE /api/programs/:id` - Delete program

## Environment Variables
Make sure to set these in your Vercel dashboard:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Your JWT secret key
- `NODE_ENV` - Set to 'production'
- `CORS_ORIGIN` - Your frontend URL

## Deployment Notes
- The app is configured for Vercel serverless deployment
- Root route (`/`) now returns API information
- All routes are prefixed with `/api` except the root route
- Health check available at `/api/health`
