## 1. User Interface

FR01: Dynamic Form Generation: The system shall dynamically generate forms based on the type of business task selected by the user, displaying all required fields for the corresponding ServiceNow Request ticket.

FR02: Multi-Ticket Input: The system shall allow users to input data for multiple ServiceNow tickets within a single form submission.

FR02.01: Add New Ticket: The UI shall provide a mechanism (e.g., a button) for users to add additional sets of form fields for creating multiple tickets.

FR02.02: Remove Ticket: The UI shall provide a mechanism for users to remove dynamically added ticket forms.

FR03: Data Validation: The frontend shall perform client-side validation on all required form fields before submission.

FR04: Submission: Users shall be able to submit the completed form(s) to initiate the ServiceNow ticket creation process.

FR05: Submission Confirmation: Upon successful submission, the system shall display a confirmation message to the user, including the reference number(s) of the newly created ServiceNow ticket(s).

FR06: Status Tracking: Users shall be able to view a list of their submitted requests and the current status of the corresponding ServiceNow tickets.

FR06.01: Status Display: The system shall display the current status (e.g., New, In Progress, Resolved, Closed) of each submitted ticket.

FR06.02: Ticket Details: Users should be able to view basic details of their submitted requests (e.g., submission date, ServiceNow ticket number).

FR07: Authentication: Users shall be required to authenticate using Okta before they can access the ticket submission form or view their submitted requests.

FR08: Authorization: The system shall ensure that users can only view the status of tickets they have submitted.

## 2. Backend Processing

FR09: API Endpoint Reception: The backend API shall provide an endpoint to receive ticket creation requests from the frontend, including an array of ticket data.

FR10: Authentication and Authorization: The backend shall validate the Okta-provided JWT to authenticate and authorize the incoming request.

FR11: ServiceNow API Communication: The backend shall communicate with a custom Scripted REST API endpoint in ServiceNow to create multiple tickets based on the received data array.

FR12: Data Storage: The backend shall store a record of each submitted request in the database, including user information, submission details, and the corresponding ServiceNow ticket number(s) and status.

FR13: Status Polling: A backend process shall periodically poll the ServiceNow API to check the current status of the submitted tickets.

FR14: Status Update: The backend shall update the status of the corresponding requests in the database based on the information retrieved from ServiceNow.

FR15: Logging: The backend shall log all critical events, including successful ticket creations, errors during API communication, and status updates.

## 3. ServiceNow Integration

FR16: Ticket Creation: The system shall successfully create ServiceNow Request tickets using the data provided in the user submission.

FR17: Status Retrieval: The system shall be able to retrieve the current status of ServiceNow tickets using their unique identifiers.

FR18: Secure Communication: All communication with the ServiceNow API shall be secure.

## 4. Multi-Ticket Creation

FR19: Array Processing: The backend (via the custom ServiceNow Scripted REST API) shall be capable of processing an array of ticket data and creating a ServiceNow ticket for each item in the array.

FR20: Individual Ticket Responses: The system should ideally handle responses from ServiceNow for each individual ticket created in the batch.

FR21: Error Handling (Multi-Ticket): If the creation of one or more tickets in a batch fails, the system should log the errors and, if possible, inform the user about which tickets were not created.