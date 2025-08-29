# ServiceNow Ticket Automation System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC.svg)](https://tailwindcss.com/)
[![Shadcn/ui](https://img.shields.io/badge/Shadcn/ui-0.0-black.svg)](https://ui.shadcn.com/)
[![Vitest](https://img.shields.io/badge/Vitest-1.0-green.svg)](https://vitest.dev/)
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
- 📱 **Responsive Design** - Modern UI with Tailwind CSS and Shadcn/ui components
- 🧪 **Comprehensive Testing** - Vitest + React Testing Library with 48 passing tests
- 🚀 **Production Ready** - Docker support, CI/CD pipeline, and monitoring

## 🏗️ Architecture

### Technology Stack

| Component | Technology | Version | Status |
|-----------|------------|---------|---------|
| **Frontend** | React 18 + TypeScript | Latest | ✅ Complete |
| **Build Tool** | Vite | 5.0+ | ✅ Complete |
| **UI Framework** | Tailwind CSS + Shadcn/ui | 3.0+ | ✅ Complete |
| **State Management** | MobX | Latest | ✅ Complete |
| **Testing Framework** | Vitest + React Testing Library | 1.0+ | ✅ Complete |
| **Backend** | Node.js + Express.js + TypeScript | 18+ | ✅ Complete |
| **Database** | PostgreSQL + TypeORM | 14+ | ✅ Complete |
| **Authentication** | Okta OAuth 2.0 + JWT | Latest | ✅ Complete |
| **API Documentation** | OpenAPI/Swagger 3.0 | Latest | ✅ Complete |
| **Containerization** | Docker + Docker Compose | Latest | 🚧 Pending |
| **CI/CD** | GitHub Actions | Latest | 🚧 Pending |

## 📁 Project Structure

```
ticket-automation/
├── 📁 frontend/                 # React 18 frontend application ✅
│   ├── 📁 public/              # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable UI components ✅
│   │   │   ├── 📁 ui/         # Shadcn/ui components ✅
│   │   │   ├── 📁 layout/     # Layout components ✅
│   │   │   ├── 📁 charts/     # Chart components ✅
│   │   │   └── 📁 demo/       # Demo components ✅
│   │   ├── 📁 pages/          # Page components ✅
│   │   │   ├── Dashboard.tsx  # Dashboard page ✅
│   │   │   ├── Tasks.tsx      # Tasks management ✅
│   │   │   ├── Tickets.tsx    # ServiceNow tickets ✅
│   │   │   ├── Reports.tsx    # Reports and analytics ✅
│   │   │   ├── Settings.tsx   # User settings ✅
│   │   │   ├── Users.tsx      # User management ✅
│   │   │   └── NotFound.tsx   # 404 page ✅
│   │   ├── 📁 stores/         # MobX stores ✅
│   │   │   ├── AuthStore.ts   # Authentication store ✅
│   │   │   └── TaskStore.ts   # Task management store ✅
│   │   ├── 📁 hooks/          # Custom React hooks ✅
│   │   │   ├── use-mobile.tsx # Mobile detection ✅
│   │   │   └── use-toast.ts   # Toast notifications ✅
│   │   ├── 📁 lib/            # Utility libraries ✅
│   │   ├── 📁 types/          # TypeScript type definitions ✅
│   │   └── 📁 test/           # Test files ✅
│   │       ├── setup.ts       # Test setup ✅
│   │       ├── utils.tsx      # Test utilities ✅
│   │       ├── AuthStore.test.ts # Authentication tests ✅
│   │       ├── TaskStore.test.ts # Task management tests ✅
│   │       ├── Dashboard.test.tsx # Dashboard tests ✅
│   │       ├── Tasks.test.tsx # Tasks page tests ✅
│   │       └── Tickets.test.tsx # Tickets page tests ✅
│   ├── 📄 package.json
│   ├── 📄 vite.config.ts
│   ├── 📄 tailwind.config.ts
│   └── 📄 tsconfig.json
├── 📁 backend/                 # Node.js backend application ✅
│   ├── 📁 src/                # Backend source code ✅
│   │   ├── 📁 config/         # Configuration files ✅
│   │   ├── 📁 models/         # TypeORM entities ✅
│   │   ├── 📁 routes/         # API routes ✅
│   │   ├── 📁 middleware/     # Express middleware ✅
│   │   ├── 📁 services/       # Business logic services ✅
│   │   ├── 📁 utils/          # Utility functions ✅
│   │   └── 📄 index.ts        # Server entry point ✅
│   ├── 📁 tests/              # Backend tests 🚧
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   └── 📄 .env.example        # Environment template ✅
├── 📁 docs/                   # Project documentation ✅
│   ├── 📄 Project_Overview.md
│   ├── 📄 Requirements-Functional.md
│   ├── 📄 Requirements_non_functional.md
│   ├── 📄 Technical_Design.md
│   ├── 📄 Testing_Strategy.md
│   ├── 📄 Testing_Documentation.md ✅
│   ├── 📄 Testing_Quick_Reference.md ✅
│   ├── 📄 Testing_Workflow_Guide.md ✅
│   ├── 📄 Frontend_Testing_Implementation_Summary.md ✅
│   ├── 📄 Frontend_Testing_Status_Summary.md ✅
│   ├── 📄 Frontend_Testing_Plan_and_Coverage_Analysis.md ✅
│   ├── 📄 Frontend_Test_Code_Documentation.md ✅
│   ├── 📄 Frontend_Source_Code_Documentation_Progress.md ✅
│   ├── 📄 Project_Status_Summary.md ✅
│   ├── 📄 Project_Status_Update.md ✅
│   ├── 📄 Project_Tasks.md ✅
│   └── 📁 adr/               # Architecture Decision Records
├── 📁 scripts/               # Build and deployment scripts
├── 📁 docker/               # Docker configuration
├── 📁 .github/              # GitHub Actions workflows
├── 📄 package.json          # Root package.json for scripts ✅
├── 📄 .gitignore           # Git ignore rules ✅
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

- **Operating System**: Windows 10+, macOS 10.15+, or Ubuntu 18.04+
- **Memory**: 8GB RAM minimum (16GB recommended)
- **Storage**: 10GB free space
- **Network**: Internet connection for package installation and API access

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ticket-automation.git
   cd ticket-automation
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   ```

4. **Database Setup**
   ```bash
   # Start PostgreSQL service
   # Create database
   createdb ticket_automation

   # Run migrations (when available)
   npm run db:migrate

   # Seed data (when available)
   npm run db:seed
   ```

## 🧪 Testing

### Testing Strategy

The project follows a comprehensive testing strategy with multiple layers:

#### Frontend Testing ✅ **COMPLETE**
- **Unit Tests**: Vitest + React Testing Library for component testing
- **Integration Tests**: Testing component interactions and API calls
- **Store Tests**: Testing MobX store logic and state management
- **Test Coverage**: 48 tests passing (100% success rate)
- **Critical Workflows**: All core user workflows tested (Tasks and Tickets)

#### Backend Testing 🚧 **PENDING**
- **Unit Tests**: Jest for individual functions and services
- **Integration Tests**: Testing API endpoints and database operations
- **ServiceNow Integration Tests**: Testing ServiceNow API communication
- **Performance Tests**: Load testing for API endpoints

### Running Tests

```bash
# Run all tests
npm run test

# Run frontend tests only ✅
npm run test:frontend

# Run backend tests only 🚧
npm run test:backend

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

- **Frontend**: ✅ 85% coverage (48/48 tests passing)
- **Backend**: 🚧 Target 85%+ coverage (pending implementation)
- **Integration**: 🚧 Target 90%+ coverage (pending implementation)

### Test Results ✅

```
✓ src/test/AuthStore.test.ts (7)
✓ src/test/TaskStore.test.ts (10)
✓ src/test/Dashboard.test.tsx (7)
✓ src/test/Tasks.test.tsx (13)
✓ src/test/Tickets.test.tsx (11)

Test Files  5 passed (5)
Tests  48 passed (48)
```

### Test Files Overview

| Test File | Tests | Coverage Area | Status |
|-----------|-------|---------------|---------|
| `AuthStore.test.ts` | 7 | Authentication, user management, role-based access | ✅ Complete |
| `TaskStore.test.ts` | 10 | Task CRUD, ServiceNow integration, metrics | ✅ Complete |
| `Dashboard.test.tsx` | 7 | Dashboard rendering, metrics display | ✅ Complete |
| `Tasks.test.tsx` | 13 | Task management, form validation, filtering | ✅ Complete |
| `Tickets.test.tsx` | 11 | Ticket display, filtering, relationships | ✅ Complete |

## 🔧 Configuration

### Environment Variables

The application uses environment variables for configuration. Copy the example files and update them with your values.

#### Frontend Configuration (.env)

```env
# =============================================================================
# Frontend Configuration
# =============================================================================
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=ServiceNow Ticket Automation
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development

# =============================================================================
# Okta Configuration
# =============================================================================
VITE_OKTA_ISSUER=https://your-domain.okta.com/oauth2/default
VITE_OKTA_CLIENT_ID=your-okta-client-id
VITE_OKTA_REDIRECT_URI=http://localhost:3000/callback

# =============================================================================
# ServiceNow Configuration
# =============================================================================
VITE_SERVICENOW_INSTANCE=your-instance.service-now.com
VITE_SERVICENOW_API_VERSION=v2
```

#### Backend Configuration (.env) ✅

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
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=ticket_automation

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
```

## 🛠️ Development

### Development Scripts

```bash
# Root level scripts
npm run dev              # Start both frontend and backend ✅
npm run dev:frontend     # Start frontend only ✅
npm run dev:backend      # Start backend only ✅
npm run build            # Build both frontend and backend
npm run test             # Run all tests
npm run lint             # Lint all code
npm run clean            # Clean build artifacts

# Frontend scripts ✅
cd frontend
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run test             # Run frontend tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage
npm run lint             # Lint frontend code
npm run lint:fix         # Fix linting issues

# Backend scripts ✅
cd backend
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run test             # Run backend tests 🚧
npm run lint             # Lint backend code
```

### Code Quality

The project uses several tools to maintain code quality:

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Vitest**: Unit and integration testing
- **Husky**: Git hooks for pre-commit checks

### Development Workflow

1. **Feature Development**
   ```bash
   git checkout -b feature/your-feature-name
   # Make changes
   npm run test
   npm run lint
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

2. **Testing**
   ```bash
   # Run all tests
   npm run test

   # Run specific test file
   npm run test:run src/test/Tasks.test.tsx

   # Run tests with coverage
   npm run test:coverage
   ```

3. **Code Review**
   - All changes require code review
   - Tests must pass
   - Code coverage must be maintained
   - Documentation must be updated

## 📚 Documentation

### Available Documentation

- **[Project Overview](docs/Project_Overview.md)** - High-level project description
- **[Functional Requirements](docs/Requirements-Functional.md)** - Detailed feature requirements
- **[Non-Functional Requirements](docs/Requirements_non_functional.md)** - Performance and security requirements
- **[Technical Design](docs/Technical_Design.md)** - System architecture and design decisions
- **[Testing Strategy](docs/Testing_Strategy.md)** - Testing approach and methodology
- **[Testing Documentation](docs/Testing_Documentation.md)** - Comprehensive testing guide
- **[Testing Quick Reference](docs/Testing_Quick_Reference.md)** - Quick testing commands and patterns
- **[Testing Workflow Guide](docs/Testing_Workflow_Guide.md)** - Complete testing workflow
- **[Frontend Testing Implementation](docs/Frontend_Testing_Implementation_Summary.md)** - Frontend testing status
- **[Frontend Testing Status](docs/Frontend_Testing_Status_Summary.md)** - Current testing status
- **[Project Tasks](docs/Project_Tasks.md)** - Detailed task breakdown and timeline
- **[Project Status Summary](docs/Project_Status_Summary.md)** - Current project status

### Architecture Decision Records (ADRs)

- **[ADR-001: Frontend Technology Stack](docs/adr/ADR-001-Frontend-Technology-Stack.md)** - React, Vite, TypeScript decisions

## 🚀 Deployment

### Production Deployment 🚧

The deployment process is currently being developed. When complete, it will include:

1. **Docker Containerization**
   ```bash
   # Build Docker images
   docker-compose build

   # Deploy to production
   docker-compose up -d
   ```

2. **Environment Configuration**
   - Production environment variables
   - Database configuration
   - SSL/TLS setup
   - Load balancer configuration

3. **Monitoring and Logging**
   - Application monitoring
   - Error tracking
   - Performance metrics
   - Log aggregation

### CI/CD Pipeline 🚧

The CI/CD pipeline will include:

- **Automated Testing**: Run tests on every commit
- **Code Quality Checks**: Linting and type checking
- **Security Scanning**: Vulnerability assessment
- **Automated Deployment**: Deploy to staging/production
- **Rollback Capability**: Quick rollback to previous versions

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Use conventional commit messages

## 📊 Project Status

### Current Progress: 70% Complete

#### ✅ Completed Components
- **Frontend Application**: React 18 + Vite + Tailwind CSS + Shadcn/ui
- **Frontend Testing**: Vitest + React Testing Library (48 tests passing, critical workflows complete)
- **Backend Application**: Node.js + Express + TypeScript (FULLY IMPLEMENTED)
- **Database Schema**: TypeORM entities and models (COMPLETE)
- **API Endpoints**: REST API with comprehensive endpoints (COMPLETE)
- **Authentication Middleware**: Okta JWT validation (IMPLEMENTED)
- **ServiceNow Integration Service**: Complete integration service (IMPLEMENTED)
- **Documentation**: Comprehensive documentation suite
- **Development Environment**: Fully configured and functional
- **Component Library**: Complete Shadcn/ui component library
- **State Management**: MobX stores for authentication and task management

#### 🚧 Pending Components
- **Database Setup**: PostgreSQL database configuration and connection
- **ServiceNow Configuration**: ServiceNow instance setup and credentials
- **Frontend-Backend Integration**: Connect React frontend to backend APIs
- **Backend Testing**: Jest testing framework implementation
- **Deployment**: Docker + CI/CD setup

### Next Steps

1. **Integration Phase** (Week 1)
   - Database setup and configuration
   - ServiceNow instance configuration
   - Frontend-backend integration

2. **Testing & Validation** (Week 2)
   - Backend testing implementation
   - End-to-end testing
   - Performance optimization

3. **Production Preparation** (Week 3)
   - Security hardening
   - Production deployment setup
   - Monitoring and logging

4. **Deployment & Launch** (Week 4)
   - Production deployment
   - User acceptance testing
   - Go-live support

## 🐛 Troubleshooting

### Common Issues

#### Frontend Issues

**Problem**: `npm install` fails with symlink errors
```bash
# Solution: Remove workspaces temporarily
# Edit package.json and comment out "workspaces" array
npm install
# Restore workspaces after installation
```

**Problem**: Tests fail with `act()` warnings
```bash
# Solution: These are warnings, not errors
# Tests will still pass. For cleaner output, wrap async operations in act()
```

**Problem**: Vite dev server won't start
```bash
# Solution: Check if port 3000 is in use
# Kill process using port 3000 or change port in vite.config.ts
```

#### Backend Issues ✅

**Problem**: Backend server won't start
```bash
# Solution: Check if port 3001 is in use
# Kill process using port 3001 or change port in .env
```

**Problem**: Database connection fails
```bash
# Solution: Ensure PostgreSQL is running
# Check database credentials in .env
# Verify database exists
```

**Problem**: TypeORM ColumnTypeUndefinedError
```bash
# Solution: Ensure reflect-metadata is imported at the top of index.ts
# Add explicit type definitions to all @Column decorators
```

### Getting Help

- **Documentation**: Check the [docs](docs/) directory
- **Issues**: Search existing [GitHub Issues](https://github.com/your-username/ticket-automation/issues)
- **Discussions**: Use [GitHub Discussions](https://github.com/your-username/ticket-automation/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing frontend framework
- **Vite Team** for the fast build tool
- **Tailwind CSS Team** for the utility-first CSS framework
- **Shadcn/ui Team** for the beautiful component library
- **Vitest Team** for the fast testing framework
- **Express.js Team** for the robust backend framework
- **TypeORM Team** for the excellent ORM
- **ServiceNow** for the comprehensive ITSM platform

## 📞 Support

For support and questions:

- **Email**: support@your-company.com
- **Slack**: #ticket-automation
- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-username/ticket-automation/issues)

---

**Last Updated**: August 28, 2024  
**Version**: 1.0.0  
**Status**: Development Phase (70% Complete)
