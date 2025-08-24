# ServiceNow Ticket Automation Project - Technical Design

## 1. Architecture Overview

The system will follow a multi-tier architecture:

Presentation Tier: React 18 frontend using Vite, Tailwind CSS, and Shadcn/ui for UI components and MobX for state management.

API Tier: A Node.js backend service with Express.js and TypeScript responsible for handling requests from the frontend, authenticating users via Okta, communicating with ServiceNow, and managing data storage.

Integration Tier: A custom Scripted REST API developed within ServiceNow to handle the creation of multiple tickets from a single backend request.

Data Tier: A PostgreSQL database with TypeORM for data storage and management.

## 2. Frontend Components

Authentication Module: Handles user login and token management using the Okta React SDK.

Dynamic Form Component: Renders forms based on configuration or metadata, supports adding multiple ticket forms.

Form Field Components: Reusable input field components with built-in validation (using Material UI components).

Submission Component: Handles form submission and communication with the backend API.

Status Display Component: Fetches and displays the status of submitted tickets.

MobX Stores:

AuthStore: Manages authentication state (user, tokens).

FormsStore: Manages the state of the dynamic form(s).

TicketStore: Manages the list of submitted tickets and their statuses.

API Service (apiClient, ticketService): Abstraction for making API calls to the backend.

## 3. Backend Components

API Endpoints:

/api/submit-requests: Accepts an array of ticket data for creation.

/api/requests: Returns a list of the authenticated user's submitted requests and their statuses.

Authentication Middleware: Validates Okta JWTs on incoming requests.

ServiceNow Integration Module: Handles communication with the ServiceNow API (specifically the custom Scripted REST API).

Data Access Layer: Handles database interactions.

Background Task (Scheduler/Worker): Periodically polls ServiceNow for status updates.

## 4. ServiceNow Implementation

Custom Scripted REST API:

Endpoint: /api/x_[your_namespace]/multiple_ticket_creation (example)

Accepts a JSON payload containing an array of ticket objects.

Iterates through the array and creates a ServiceNow Request ticket for each object using GlideRecord.

Returns an array of the newly created ticket numbers.

## 5. Technologies Used

Frontend: React 18, Vite, Tailwind CSS, Shadcn/ui, MobX, React Testing Library, Jest, ESLint, Prettier.

Backend: Node.js, Express.js, TypeScript, TypeORM, Axios, Jest, ESLint, Prettier.

Authentication: Okta OAuth 2.0, JWT.

Database: PostgreSQL with TypeORM.

ServiceNow: REST API, Scripted REST API.

CI/CD: GitHub Actions (for linting and testing).

Secrets Management: Environment variables with optional integration to cloud secrets management (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault).

## 6. Data Flow

User interacts with the React frontend, filling out the dynamic form for one or more tickets.

Upon submission, the frontend sends an HTTPS request with a JWT in the Authorization header to the backend's /api/submit-requests endpoint. The request body contains an array of ticket data.

The backend authenticates the request using the JWT.

The backend forwards the array of ticket data to the custom ServiceNow Scripted REST API endpoint.

The ServiceNow Scripted REST API processes the array, creating a ServiceNow Request ticket for each item.

ServiceNow returns a response (likely an array of ticket numbers) to the backend.

The backend stores the submission details and the ServiceNow ticket number(s) in the database.

The backend periodically polls ServiceNow's REST API to get the updated status of the submitted tickets and updates the database accordingly.

The frontend periodically polls the backend's /api/requests endpoint (with JWT authentication) to display the latest status of the user's submitted tickets.

## 7. Testing Strategy

See the testing_strategy.md file for details.