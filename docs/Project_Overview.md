## 1. Introduction

This document outlines the project for creating a system that automates the creation of ServiceNow Request tickets based on user-submitted business tasks. The system will provide a user-friendly web form, automatically submit ticket requests via the ServiceNow API, and allow users to track the status of their submitted tickets. This updated version includes the capability to create multiple ServiceNow tickets from a single user request.

## 2. Goals

Automate the ServiceNow ticket creation process for defined business tasks.

Provide a user-friendly interface for submitting ticket requests.

Enable users to track the status of their submitted ServiceNow tickets.

Support the creation of multiple ServiceNow tickets from a single user request.

Ensure a secure and reliable integration with the ServiceNow platform.

Build a modular and reusable front-end solution.

Implement comprehensive testing and maintainable code.

## 3. Scope

The project includes:

Development of a React 18-based web frontend with Material UI and Balance UI.

Implementation of state management using MobX.

Integration with Okta for user authentication and authorization (OAuth 2.0 with JWT).

Development of a Node.js backend service with Express.js and TypeScript to handle API communication and business logic.

Integration with the ServiceNow REST API for ticket creation and status retrieval.

Support for creating multiple ServiceNow tickets from a single user request via a custom ServiceNow Scripted REST API.

Implementation of front-end unit and integration tests using Jest and React Testing Library.

Implementation of back-end unit tests using Jest.

Implementation of code linting using ESLint and Prettier.

Basic deployment documentation.

The project excludes:

Detailed ServiceNow workflow customizations beyond API interaction.

Integration with other systems beyond Okta and ServiceNow.

Mobile application development.

Advanced reporting or analytics.

## 4. Stakeholders

End Users: Individuals who need to submit requests requiring ServiceNow tickets.

IT Department: Responsible for maintaining the ServiceNow instance and potentially the backend infrastructure.

Development Team: Responsible for designing, building, and testing the application.

Project Manager: Overseeing the project execution.

## 5. Success Criteria

Users can easily submit requests that automatically create ServiceNow tickets.

Users can effectively track the status of their submitted tickets.

The system is reliable, secure, and performs efficiently.

The codebase is well-tested, maintainable, and follows coding best practices.

The multi-ticket creation functionality works as expected.