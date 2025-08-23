# ServiceNow Ticket Automation System

A comprehensive system that automates the creation of ServiceNow Request tickets based on user-submitted business tasks. The system provides a user-friendly web form, automatically submits ticket requests via the ServiceNow API, and allows users to track the status of their submitted tickets.

## 🏗️ Architecture

- **Frontend**: React 18 with Material UI and Balance UI
- **Backend**: Node.js with Express.js and TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: Okta OAuth 2.0 with JWT
- **Integration**: ServiceNow REST API with custom Scripted REST API
- **Testing**: Jest and React Testing Library

## 📁 Project Structure

```
ticket-automation/
├── frontend/                 # React 18 frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── stores/         # MobX stores
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript type definitions
│   ├── package.json
│   └── tsconfig.json
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Database models
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript type definitions
│   ├── tests/              # Backend tests
│   ├── package.json
│   └── tsconfig.json
├── docs/                   # Project documentation
│   ├── Project_Overview.md
│   ├── Requirements-Functional.md
│   ├── Requirements_non_functional.md
│   ├── Technical_Design.md
│   ├── Testing_Strategy.md
│   └── adr/               # Architecture Decision Records
├── scripts/               # Build and deployment scripts
├── docker/               # Docker configuration
├── .github/              # GitHub Actions workflows
├── package.json          # Root package.json for scripts
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ticket-automation
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend && npm install
   
   # Install backend dependencies
   cd ../backend && npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

4. **Database Setup**
   ```bash
   # Start PostgreSQL (if using Docker)
   docker-compose up -d postgres
   
   # Run database migrations
   cd backend && npm run db:migrate
   ```

5. **Start Development Servers**
   ```bash
   # Start backend (from project root)
   npm run dev:backend
   
   # Start frontend (from project root)
   npm run dev:frontend
   ```

## 🛠️ Development

### Available Scripts

#### Root Level
```bash
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only
npm run build            # Build both applications
npm run test             # Run all tests
npm run lint             # Lint all code
```

#### Frontend
```bash
cd frontend
npm start                # Start development server
npm run build            # Build for production
npm test                 # Run tests
npm run lint             # Lint code
```

#### Backend
```bash
cd backend
npm run dev              # Start development server
npm run build            # Build for production
npm test                 # Run tests
npm run lint             # Lint code
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with test data
```

## 🧪 Testing

### Frontend Testing
- **Unit Tests**: Jest + React Testing Library
- **Component Tests**: Testing component behavior and user interactions
- **Store Tests**: Testing MobX store logic

### Backend Testing
- **Unit Tests**: Jest for individual functions and services
- **Integration Tests**: Testing API endpoints and database operations
- **ServiceNow Integration Tests**: Testing ServiceNow API communication

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ticket_automation

# Okta Configuration
OKTA_ISSUER=https://your-domain.okta.com/oauth2/default
OKTA_AUDIENCE=api://default

# ServiceNow Configuration
SERVICENOW_INSTANCE=your-instance.service-now.com
SERVICENOW_USERNAME=your-username
SERVICENOW_PASSWORD=your-password
SERVICENOW_CLIENT_ID=your-client-id
SERVICENOW_CLIENT_SECRET=your-client-secret

# JWT Configuration
JWT_SECRET=your-jwt-secret
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_OKTA_ISSUER=https://your-domain.okta.com/oauth2/default
REACT_APP_OKTA_CLIENT_ID=your-client-id
```

## 📚 Documentation

- [Project Overview](docs/Project_Overview.md)
- [Functional Requirements](docs/Requirements-Functional.md)
- [Non-Functional Requirements](docs/Requirements_non_functional.md)
- [Technical Design](docs/Technical_Design.md)
- [Testing Strategy](docs/Testing_Strategy.md)
- [Architecture Decision Records](docs/adr/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in the `docs/` folder
