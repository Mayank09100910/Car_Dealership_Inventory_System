 # AI Prompt Log

## Project: Car Dealership Inventory Management System

This document records the prompts and AI-assisted discussions used during the development of the Car Dealership Inventory Management System.

AI was used as a development assistant for understanding requirements, discussing architecture, debugging, reviewing code, improving UI design, and understanding testing approaches. The generated suggestions were reviewed and adapted before being incorporated into the project.

---

## 1. Understanding the Assignment

### Prompt

I have received a software craftsmanship assignment to build a Car Dealership Inventory Management System.

The application needs authentication, vehicle inventory management, searching and filtering, purchasing vehicles, inventory restocking, role-based authorization, a frontend interface, persistent database storage, automated testing, and documentation.

Please help me break the assignment into smaller development tasks. I want to understand the expected functionality, identify the main entities, define responsibilities clearly, and determine a sensible order in which to implement the features.

The project should demonstrate clean code, SOLID principles, TDD, meaningful Git commits, and separation of concerns.

---

## 2. Choosing the Backend Architecture

### Prompt

I am primarily a Java backend developer and would like to implement the backend of the Car Dealership Inventory Management System using Spring Boot.

Help me design a clean backend architecture using:

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security
- PostgreSQL
- JWT authentication
- Maven
- JUnit 5
- Mockito

I want the application to follow a layered architecture with controllers, services, repositories, entities, DTOs, security configuration, validation, and exception handling.

Explain the responsibility of each layer and how requests should flow from the REST controller to the database.

---

## 3. Designing the Database Schema

### Prompt

Help me design a PostgreSQL database schema for a Car Dealership Inventory Management System.

The system needs users with USER and ADMIN roles, vehicles containing information such as make, model, category, price and available quantity, and functionality for purchasing vehicles and managing inventory.

Suggest the minimum set of tables required without overengineering the solution.

Explain:

- Primary keys
- Foreign keys
- Relationships between entities
- Unique constraints
- Appropriate data types
- How vehicle stock should be represented
- Whether purchase history should have its own table
- How the schema maps to Spring Data JPA entities

The design should be simple enough for an assignment but structured enough to demonstrate good database design.

---

## 4. Planning the REST API

### Prompt

Design REST API endpoints for my Spring Boot Car Dealership Inventory Management System.

The application should support:

- User registration
- User login
- JWT authentication
- Listing vehicles
- Getting a vehicle by ID
- Searching vehicles by make
- Searching vehicles by model
- Filtering by category
- Filtering by minimum and maximum price
- Adding vehicles
- Updating vehicles
- Deleting vehicles
- Purchasing vehicles
- Restocking inventory

USER accounts should be able to browse, search and purchase vehicles.

ADMIN accounts should additionally be able to add, edit, delete and restock vehicles.

Suggest RESTful endpoint names, HTTP methods, request bodies, response structures and appropriate HTTP status codes.

---

## 5. Planning Development Using TDD

### Prompt

I want to develop this project using Test Driven Development rather than implementing all functionality first and adding tests later.

Help me create a Red-Green-Refactor development sequence for the application.

For every major feature, explain:

1. What behavior should be tested first.
2. What failing test should be written.
3. What minimum production code should make the test pass.
4. What could be refactored after the test becomes green.
5. What edge cases should be tested next.

Cover registration, authentication, vehicle CRUD operations, searching/filtering, purchasing, inventory validation and restocking.

I also want the Git history to clearly demonstrate incremental TDD development.

---

## 6. Testing User Registration

### Prompt

Help me design JUnit 5 and Mockito unit tests for user registration in my Spring Boot application.

The registration service should:

- Accept a username and password.
- Reject invalid input.
- Prevent duplicate usernames.
- Encode passwords before storing them.
- Assign the correct default role.
- Save the user through UserRepository.

I want the tests to focus on behavior rather than Spring framework implementation details.

Explain what should be mocked, what should be asserted, and how to keep the tests readable using Arrange-Act-Assert.

---

## 7. Implementing JWT Authentication

### Prompt

Explain how to implement stateless JWT authentication in a Spring Boot application using Spring Security.

My authentication flow should be:

1. User submits username and password.
2. Spring Security verifies the credentials.
3. The server generates a JWT after successful authentication.
4. The frontend stores the authentication information.
5. Protected API requests send the JWT using the Authorization header.
6. A JWT filter validates the token.
7. Spring Security establishes the authenticated user and their role.

Explain the responsibilities of:

- SecurityFilterChain
- AuthenticationManager
- PasswordEncoder
- UserDetailsService
- JWT utility/service
- JWT authentication filter

I want to understand the implementation instead of treating JWT configuration as boilerplate.

---

## 8. Role-Based Authorization

### Prompt

Help me design role-based authorization for my Spring Boot dealership application.

There are two roles:

USER:
- View vehicles
- Search/filter vehicles
- Purchase vehicles

ADMIN:
- All USER permissions
- Add vehicles
- Update vehicles
- Delete vehicles
- Restock inventory

Explain how these restrictions should be enforced in Spring Security.

The frontend may hide ADMIN buttons from normal users, but backend authorization must remain the actual security boundary.

Also identify potential security problems if users are allowed to choose ADMIN themselves during public registration.

---

## 9. Vehicle Entity and Inventory Design

### Prompt

Help me design the Vehicle entity for the dealership application.

Each vehicle should contain:

- ID
- Make
- Model
- Category
- Price
- Quantity
- Creation/update timestamps where appropriate

Recommend suitable Java and PostgreSQL data types.

Also explain validation rules such as:

- Make cannot be blank.
- Model cannot be blank.
- Category cannot be blank.
- Price must be positive.
- Quantity cannot be negative.

Explain whether validation belongs in the entity, DTO, service layer, or a combination of these.

---

## 10. Vehicle CRUD Operations

### Prompt

Help me structure CRUD operations for vehicles using Controller -> Service -> Repository architecture in Spring Boot.

I need operations for:

- Creating a vehicle
- Getting all vehicles
- Getting a vehicle by ID
- Updating a vehicle
- Deleting a vehicle

ADMIN users should control create/update/delete operations.

Show how responsibilities should be separated so that business logic does not end up inside controllers.

Also suggest useful unit tests and edge cases for each operation.

---

## 11. Search and Filtering

### Prompt

My dealership application needs vehicle search and filtering.

Users should be able to filter vehicles using optional criteria such as:

- Make
- Model
- Category
- Minimum price
- Maximum price

I do not want to create a large number of repository methods for every possible filter combination.

Suggest a clean Spring Data JPA approach for dynamic filtering, such as Specifications or another suitable technique.

Explain how optional query parameters should flow from the controller to the repository and how this functionality should be tested.

---

## 12. Vehicle Purchase Logic

### Prompt

Help me design the vehicle purchasing business logic.

When a user purchases a vehicle:

- The vehicle must exist.
- Available quantity must be greater than zero.
- Quantity should decrease after a successful purchase.
- Quantity must never become negative.
- The updated inventory should be persisted.
- An appropriate error should be returned when the vehicle is out of stock.

Explain which parts belong in the service layer and identify important unit tests and edge cases.

Also discuss transaction handling so concurrent purchases do not leave inventory in an inconsistent state.

---

## 13. Restocking Inventory

### Prompt

Design the inventory restocking functionality for the dealership application.

Only ADMIN users should be allowed to restock vehicles.

The API should accept a positive restock quantity and add it to the current available stock.

Consider:

- Vehicle not found
- Zero quantity
- Negative quantity
- Successful restocking
- Authorization failure

Suggest a clean service method and the tests that should be written before implementing it.

---

## 14. Global Exception Handling

### Prompt

Help me improve error handling in my Spring Boot REST API.

Instead of putting try/catch blocks in every controller, I want centralized exception handling using @RestControllerAdvice.

Suggest custom exceptions for situations such as:

- User already exists
- Invalid credentials
- Vehicle not found
- Vehicle out of stock
- Invalid inventory quantity
- Unauthorized operation

Design a consistent JSON error response containing useful information such as message, HTTP status and timestamp.

Explain why centralized exception handling improves maintainability.

---

## 15. React Frontend Architecture

### Prompt

I have completed the main Spring Boot REST APIs and now want to create a React frontend for the Car Dealership Inventory Management System.

The frontend needs:

- Login
- Registration
- Vehicle inventory dashboard
- Search and filtering
- Purchase action
- ADMIN-only add vehicle action
- ADMIN-only edit action
- ADMIN-only delete action
- ADMIN-only restock action
- Logout
- Success/error notifications

Help me structure the React state and API calls without changing the backend API contract.

The frontend should send JWT tokens through the Authorization Bearer header for protected requests.

---

## 16. Connecting React with Spring Boot

### Prompt

Help me connect my React frontend with my Spring Boot REST API.

My frontend calls endpoints under /api/auth and /api/vehicles.

Explain:

- How fetch requests should send JSON.
- How the JWT should be attached to protected requests.
- How development proxy configuration can be used.
- How authentication state can be maintained.
- How logout should clear authentication information.
- How 401 and 403 responses should be handled.

I want the frontend/backend integration to remain simple and easy to explain during a code review.

---

## 17. Debugging Unsupported HTTP Method

### Prompt

My Spring Boot application starts successfully and connects to PostgreSQL, but when I open an API URL directly in the browser I receive:

"Request method 'GET' is not supported."

Explain why this happens when an endpoint is defined using POST and why opening the URL in a browser sends a GET request.

Explain how I should correctly test POST, PUT, PATCH and DELETE REST endpoints using an API client.

---

## 18. Reviewing PostgreSQL Connectivity

### Prompt

Review my Spring Boot startup logs and help me determine whether PostgreSQL is connected successfully.

Explain what messages from HikariCP, Hibernate and the PostgreSQL JDBC driver indicate a successful database connection.

Also explain common errors that would appear if the database name, username, password, port or PostgreSQL server configuration were incorrect.

---

## 19. Designing the Initial UI Theme

### Prompt

Review the React UI for my dealership application.

The initial design uses a very dark background with purple and indigo gradients.

I want the interface to feel more like a professional automotive inventory management application and less like a gaming or AI dashboard.

Suggest improvements to:

- Background colors
- Cards
- Typography
- Buttons
- Input fields
- Navigation
- Vehicle cards
- Inventory badges
- ADMIN actions
- Modals
- Error/success states

Do not change the application's functionality or API calls.

---

## 20. Converting the UI to a White Theme

### Prompt

I want to redesign my React dealership application using a clean white theme.

Use a visual system approximately based on:

- Light gray page background
- White cards
- Dark slate headings
- Gray secondary text
- Light gray borders
- Blue primary actions
- Green success/in-stock indicators
- Red destructive/error actions
- Amber ADMIN indicators

Remove unnecessary purple gradients and glowing effects.

Keep the existing React functionality unchanged, including authentication, JWT handling, search, vehicle CRUD operations, purchase, restocking and role-based UI controls.

The result should look professional, simple, responsive and suitable for a software engineering assignment.

---

## 21. Reviewing Frontend Security

### Prompt

Review the authentication and authorization behavior of my React + Spring Boot application for obvious security mistakes.

In particular, check whether allowing users to select USER or ADMIN during registration could allow privilege escalation.

Explain why hiding ADMIN controls in React is not sufficient security and why authorization must also be enforced by Spring Security on the backend.

Suggest a safer registration flow while keeping the project simple.

---

## 22. Clean Code Review

### Prompt

Review the project from a software craftsmanship perspective.

Look for:

- Large methods
- Duplicate code
- Unused imports
- Poor naming
- Business logic inside controllers
- Repeated API/error-handling logic
- Missing validation
- Inconsistent HTTP responses
- Tight coupling
- Security concerns
- Difficult-to-test code

Suggest refactorings only where they meaningfully improve readability, maintainability or testability. Avoid introducing unnecessary abstractions just for the sake of using design patterns.

---

## 23. SOLID Principles Review

### Prompt

Review the architecture of my Spring Boot project against SOLID principles.

Explain where the project demonstrates:

- Single Responsibility Principle
- Open/Closed Principle
- Liskov Substitution Principle where applicable
- Interface Segregation Principle where applicable
- Dependency Inversion Principle

Do not force every SOLID principle into the project if it does not naturally apply.

Identify practical improvements that would make the code easier to maintain and test.

---

## 24. Test Coverage Review

### Prompt

Review the automated testing strategy for the dealership application.

Identify important scenarios that should have tests, including:

- Successful registration
- Duplicate registration
- Successful login
- Invalid credentials
- JWT protected endpoints
- ADMIN authorization
- USER authorization
- Vehicle creation
- Vehicle update
- Vehicle deletion
- Vehicle not found
- Search/filter behavior
- Successful purchase
- Out-of-stock purchase
- Successful restock
- Invalid restock quantity

Help me distinguish between unit tests and integration tests so that I avoid testing the same behavior unnecessarily at multiple levels.

---

## 25. README Review

### Prompt

Help me structure a professional README for the Car Dealership Inventory Management System.

It should explain:

- Project overview
- Features
- Technology stack
- Architecture
- Database setup
- Backend setup
- Frontend setup
- Environment configuration
- Running tests
- Authentication and authorization
- REST API overview
- TDD approach
- Screenshots
- Assumptions/design decisions
- AI usage disclosure

The README should help another developer clone the repository and run the project without needing additional instructions.

---

## 26. Final Submission Review

### Prompt

Perform a final software craftsmanship review of my Car Dealership Inventory Management System before submission.

Evaluate the project for:

- Correctness
- Code readability
- Naming
- Separation of concerns
- SOLID principles
- TDD evidence
- Test quality
- Git commit quality
- Error handling
- Validation
- Authentication
- Authorization
- Database design
- REST API design
- Frontend usability
- Documentation
- Security basics

Prioritize issues that would matter during a technical code review rather than suggesting unnecessary features.

Do not rewrite the entire project. Identify problems, explain why they matter, and suggest focused improvements.

---

## AI Usage Summary

AI assistance was primarily used for:

- Breaking down assignment requirements
- Discussing architecture and database design
- Understanding TDD and test cases
- Reviewing Spring Boot and Spring Security concepts
- Understanding JWT authentication
- Debugging development issues
- Reviewing REST API design
- Reviewing React UI structure
- Improving the visual theme
- Identifying security and clean-code concerns
- Reviewing documentation and submission readiness

All suggestions were reviewed before being incorporated into the project. Implementation decisions, integration, testing, debugging, and final verification remained part of the development process.