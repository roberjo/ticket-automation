# ServiceNow Ticket Automation System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

A comprehensive system that automates the creation of ServiceNow Request tickets based on user-submitted business tasks. The system provides a user-friendly web form, automatically submits ticket requests via the ServiceNow API, and allows users to track the status of their submitted tickets.

## ✨ Features

- 🔐 **Secure Authentication** - Okta OAuth 2.0 with JWT validation
- 📝 **Dynamic Form Generation** - Forms adapt based on business task type
- 🎫 **Multi-Ticket Creation** - Create multiple ServiceNow tickets from single request
- 📊 **Real-time Status Tracking** - Monitor ticket status with automatic updates
- 🔄 **ServiceNow Integration** - Seamless integration with ServiceNow REST API
- 📱 **Responsive Design** - Modern UI with Material UI and Balance UI
- 🧪 **Comprehensive Testing** - Unit, integration, and end-to-end testing
- 🚀 **Production Ready** - Docker support, CI/CD pipeline, and monitoring

## 🏗️ Architecture

### Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Frontend** | React 18 + TypeScript | Latest |
| **UI Framework** | Material UI + Balance UI | Latest |
| **State Management** | MobX | Latest |
| **Backend** | Node.js + Express.js + TypeScript | 18+ |
| **Database** | PostgreSQL + TypeORM | 14+ |
| **Authentication** | Okta OAuth 2.0 + JWT | Latest |
| **Testing** | Jest + React Testing Library | Latest |
| **API Documentation** | OpenAPI/Swagger 3.0 | Latest |
| **Containerization** | Docker + Docker Compose | Latest |
| **CI/CD** | GitHub Actions | Latest |

## 📁 Project Structure

```
ticket-automation/
├── 📁 frontend/                 # React 18 frontend application
│   ├── 📁 public/              # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable UI components
│   │   ├── 📁 pages/          # Page components
│   │   ├── 📁 stores/         # MobX stores
│   │   ├── 📁 services/       # API services
│   │   ├── 📁 utils/          # Utility functions
│   │   └── 📁 types/          # TypeScript type definitions
│   ├── 📄 package.json
│   └── 📄 tsconfig.json
├── 📁 backend/                 # Node.js backend application
│   ├── 📁 src/
│   │   ├── 📁 controllers/    # Request handlers
│   │   ├── 📁 services/       # Business logic
│   │   ├── 📁 models/         # Database models
│   │   ├── 📁 middleware/     # Express middleware
│   │   ├── 📁 routes/         # API routes
│   │   ├── 📁 utils/          # Utility functions
│   │   └── 📁 types/          # TypeScript type definitions
│   ├── 📁 tests/              # Backend tests
│   ├── 📄 package.json
│   └── 📄 tsconfig.json
├── 📁 docs/                   # Project documentation
│   ├── 📄 Project_Overview.md
│   ├── 📄 Requirements-Functional.md
│   ├── 📄 Requirements_non_functional.md
│   ├── 📄 Technical_Design.md
│   ├── 📄 Testing_Strategy.md
│   ├── 📄 Project_Tasks.md
│   └── 📁 adr/               # Architecture Decision Records
├── 📁 scripts/               # Build and deployment scripts
├── 📁 docker/               # Docker configuration
├── 📁 .github/              # GitHub Actions workflows
├── 📄 package.json          # Root package.json for scripts
├── 📄 .gitignore           # Git ignore rules
└── 📄 README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** package manager
- **Git** ([Download](https://git-scm.com/))
- **Docker** (optional, for containerized development) ([Download](https://www.docker.com/))

### System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux
- **Memory**: 8GB RAM minimum (16GB recommended)
- **Storage**: 10GB free space
- **Network**: Internet connection for package downloads

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ticket-automation.git
   cd ticket-automation
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies (root, frontend, and backend)
   npm run install:all
   
   # Or install individually:
   npm install                    # Root dependencies
   cd frontend && npm install     # Frontend dependencies
   cd ../backend && npm install   # Backend dependencies
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Edit environment files with your configuration
   # See Configuration section below for details
   ```

4. **Database Setup**
   ```bash
   # Option 1: Using Docker (recommended)
   docker-compose up -d postgres
   
   # Option 2: Using local PostgreSQL
   # Create database: ticket_automation
   # Update DATABASE_URL in backend/.env
   
   # Run database migrations
   cd backend && npm run db:migrate
   
   # Seed database with sample data (optional)
   npm run db:seed
   ```

5. **Start Development Servers**
   ```bash
   # Start both frontend and backend simultaneously
   npm run dev
   
   # Or start individually:
   npm run dev:backend   # Backend server (port 3001)
   npm run dev:frontend  # Frontend server (port 3000)
   ```

6. **Access the Application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:3001
   - **API Documentation**: http://localhost:3001/api-docs

## 🛠️ Development

### Available Scripts

#### Root Level Commands
```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only

# Building
npm run build            # Build both applications
npm run build:frontend   # Build frontend only
npm run build:backend    # Build backend only

# Testing
npm run test             # Run all tests
npm run test:frontend    # Run frontend tests
npm run test:backend     # Run backend tests

# Code Quality
npm run lint             # Lint all code
npm run lint:frontend    # Lint frontend code
npm run lint:backend     # Lint backend code

# Utilities
npm run install:all      # Install all dependencies
npm run clean            # Clean build artifacts
```

#### Frontend Commands
```bash
cd frontend

# Development
npm start                # Start development server (port 3000)
npm run dev              # Start development server with hot reload

# Building
npm run build            # Build for production
npm run build:analyze    # Build with bundle analysis

# Testing
npm test                 # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:ci          # Run tests in CI mode

# Code Quality
npm run lint             # Lint code
npm run lint:fix         # Lint and fix issues
npm run format           # Format code with Prettier
```

#### Backend Commands
```bash
cd backend

# Development
npm run dev              # Start development server (port 3001)
npm run dev:debug        # Start with debugging enabled

# Building
npm run build            # Build for production
npm run build:watch      # Build in watch mode

# Testing
npm test                 # Run tests
npm run test:coverage    # Run tests with coverage
npm run test:watch       # Run tests in watch mode

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with test data
npm run db:reset         # Reset database (development only)

# Code Quality
npm run lint             # Lint code
npm run lint:fix         # Lint and fix issues
```

## 🧪 Testing

### Testing Strategy

The project follows a comprehensive testing strategy with multiple layers:

#### Frontend Testing
- **Unit Tests**: Jest + React Testing Library for component testing
- **Integration Tests**: Testing component interactions and API calls
- **Store Tests**: Testing MobX store logic and state management
- **E2E Tests**: End-to-end testing with Playwright (planned)

#### Backend Testing
- **Unit Tests**: Jest for individual functions and services
- **Integration Tests**: Testing API endpoints and database operations
- **ServiceNow Integration Tests**: Testing ServiceNow API communication
- **Performance Tests**: Load testing for API endpoints

### Running Tests

```bash
# Run all tests
npm run test

# Run frontend tests only
npm run test:frontend

# Run backend tests only
npm run test:backend

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

- **Frontend**: Target 80%+ coverage
- **Backend**: Target 85%+ coverage
- **Integration**: Target 90%+ coverage

## 🔧 Configuration

### Environment Variables

The application uses environment variables for configuration. Copy the example files and update them with your values.

#### Backend Configuration (.env)

```env
# =============================================================================
# Server Configuration
# =============================================================================
PORT=3001
NODE_ENV=development
LOG_LEVEL=debug

# =============================================================================
# Database Configuration
# =============================================================================
DATABASE_URL=postgresql://username:password@localhost:5432/ticket_automation
DATABASE_SSL=false
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# =============================================================================
# Okta Authentication Configuration
# =============================================================================
OKTA_ISSUER=https://your-domain.okta.com/oauth2/default
OKTA_AUDIENCE=api://default
OKTA_CLIENT_ID=your-okta-client-id
OKTA_CLIENT_SECRET=your-okta-client-secret

# =============================================================================
# ServiceNow Integration Configuration
# =============================================================================
SERVICENOW_INSTANCE=your-instance.service-now.com
SERVICENOW_USERNAME=your-username
SERVICENOW_PASSWORD=your-password
SERVICENOW_CLIENT_ID=your-client-id
SERVICENOW_CLIENT_SECRET=your-client-secret
SERVICENOW_API_VERSION=v2

# =============================================================================
# Security Configuration
# =============================================================================
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# =============================================================================
# External Services (Optional)
# =============================================================================
REDIS_URL=redis://localhost:6379
SENTRY_DSN=your-sentry-dsn
```

#### Frontend Configuration (.env)

```env
# =============================================================================
# API Configuration
# =============================================================================
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_API_TIMEOUT=30000

# =============================================================================
# Okta Configuration
# =============================================================================
REACT_APP_OKTA_ISSUER=https://your-domain.okta.com/oauth2/default
REACT_APP_OKTA_CLIENT_ID=your-okta-client-id
REACT_APP_OKTA_REDIRECT_URI=http://localhost:3000/callback

# =============================================================================
# Application Configuration
# =============================================================================
REACT_APP_APP_NAME=ServiceNow Ticket Automation
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development

# =============================================================================
# Feature Flags
# =============================================================================
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_DEBUG_MODE=true
```

### Configuration Files

- **Backend**: `backend/.env` (copy from `backend/.env.example`)
- **Frontend**: `frontend/.env` (copy from `frontend/.env.example`)
- **Docker**: `docker-compose.yml` for containerized development
- **Database**: `backend/src/config/database.ts` for database configuration

## 📚 Documentation

### Core Documentation

- 📋 [Project Overview](docs/Project_Overview.md) - Project goals, scope, and success criteria
- 🎯 [Functional Requirements](docs/Requirements-Functional.md) - Detailed functional specifications
- ⚡ [Non-Functional Requirements](docs/Requirements_non_functional.md) - Performance, security, and usability requirements
- 🏗️ [Technical Design](docs/Technical_Design.md) - System architecture and technical specifications
- 🧪 [Testing Strategy](docs/Testing_Strategy.md) - Testing approach and methodologies
- 📋 [Project Tasks](docs/Project_Tasks.md) - Comprehensive task breakdown and timeline

### Architecture Decision Records (ADRs)

- 📝 [ADR-001: Node.js Backend Technology](docs/adr/001-nodejs-backend-technology.md) - Backend technology selection

### Additional Resources

- 🔧 [API Documentation](http://localhost:3001/api-docs) - Interactive API documentation (when running)
- 📖 [ServiceNow Integration Guide](docs/ServiceNow_Integration.md) - ServiceNow integration details
- 🔐 [Security Implementation Guide](docs/Security_Implementation.md) - Security configuration and best practices
- 🚀 [Deployment Guide](docs/Deployment_Guide.md) - Production deployment instructions

## 🤝 Contributing

We welcome contributions from the community! Please read our contributing guidelines before submitting your changes.

### Getting Started

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/your-username/ticket-automation.git
   cd ticket-automation
   ```

2. **Set up development environment**
   ```bash
   # Install dependencies
   npm run install:all
   
   # Set up environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**
   - Follow the coding standards
   - Write tests for new functionality
   - Update documentation as needed

5. **Test your changes**
   ```bash
   # Run all tests
   npm run test
   
   # Run linting
   npm run lint
   ```

6. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

7. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Development Guidelines

- **Code Style**: Follow ESLint and Prettier configurations
- **Testing**: Write tests for all new functionality
- **Documentation**: Update relevant documentation
- **Commits**: Use conventional commit messages
- **Branch Naming**: Use descriptive branch names (e.g., `feature/user-authentication`)

### Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Add a description of your changes
4. Request review from maintainers
5. Address any feedback

### Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) to keep our community approachable and respectable.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check the [documentation section](#-documentation) above
- **Issues**: Create an issue in the repository for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and general help
- **Email**: Contact the development team at support@ticket-automation.com

### Common Issues

#### Development Setup Issues
- **Node.js version**: Ensure you're using Node.js 18+
- **Database connection**: Check your PostgreSQL connection and credentials
- **Environment variables**: Verify all required environment variables are set

#### ServiceNow Integration Issues
- **API credentials**: Verify ServiceNow API credentials are correct
- **Permissions**: Ensure ServiceNow user has appropriate permissions
- **Network**: Check network connectivity to ServiceNow instance

#### Authentication Issues
- **Okta configuration**: Verify Okta application settings
- **Redirect URIs**: Ensure redirect URIs are configured correctly
- **JWT validation**: Check JWT secret and validation settings

## 🗺️ Roadmap

### Current Phase (Q1 2024)
- [x] Project documentation and planning
- [x] Technology stack selection
- [ ] Database schema design
- [ ] API specifications
- [ ] ServiceNow integration guide

### Next Phase (Q2 2024)
- [ ] Backend development
- [ ] Frontend development
- [ ] Integration testing
- [ ] Security implementation

### Future Enhancements
- [ ] Mobile application
- [ ] Advanced reporting and analytics
- [ ] Multi-language support
- [ ] Advanced workflow automation

## 🙏 Acknowledgments

- **ServiceNow** for their comprehensive API documentation
- **Okta** for their authentication solutions
- **React** and **Node.js** communities for excellent tooling
- **Material UI** for the beautiful component library

---

**Made with ❤️ by the ServiceNow Ticket Automation Team**
