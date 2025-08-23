## 1. Performance

NFR01: Responsiveness: The frontend application should load quickly and provide a responsive user experience. Form submissions should be processed without significant delays.

NFR02: Scalability: The backend system should be scalable to handle a growing number of users and ticket requests. The use of a message queue (optional but recommended) should be considered for handling high volumes.

NFR03: ServiceNow API Limits: The system must be designed to respect the rate limits imposed by the ServiceNow API. The backend should implement appropriate throttling or queuing mechanisms if necessary.

## 2. Security

NFR04: Authentication Security: User authentication must be secure, leveraging Okta's OAuth 2.0 framework and JWTs.

NFR05: Authorization Security: The system must ensure that users can only access their own submitted ticket information.

NFR06: Data Security: Sensitive data, such as API keys and Okta credentials, must be securely managed using a secrets management service.

NFR07: Input Validation: Both frontend and backend must implement robust input validation to prevent common security vulnerabilities (e.g., cross-site scripting, injection attacks).

NFR08: Secure Communication: All communication between the frontend, backend, and ServiceNow must be encrypted using HTTPS/TLS.

## 3. Usability

NFR09: Intuitive Interface: The user interface should be intuitive and easy to navigate, allowing users to quickly understand and complete the ticket submission form.

NFR10: Clear Feedback: The system should provide clear and timely feedback to users regarding the success or failure of their submissions and the status of their tickets.

NFR11: Accessibility: The application should strive to meet accessibility standards (e.g., WCAG) to ensure usability for all users.

## 4. Maintainability

NFR12: Modular Design: The codebase should follow a modular and component-based architecture, making it easier to understand, modify, and maintain.

NFR13: Code Readability: Code should be well-documented and follow consistent coding standards.

NFR14: Testability: The system should be designed to facilitate unit, integration, and end-to-end testing.

## 5. Reliability

NFR15: Error Handling: The system should gracefully handle errors and provide informative messages.

NFR16: Logging: Comprehensive logging should be implemented to aid in debugging and monitoring the system.

## 6. Deployment

NFR17: Deployment: The application should be deployable to a standard cloud hosting environment. Basic deployment instructions should be provided.