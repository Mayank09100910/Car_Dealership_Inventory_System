# Aura Drive | Car Dealership Inventory System

Aura Drive is a full-stack, responsive Car Dealership Inventory System designed to manage, browse, and track vehicle listings. The project is constructed using a robust **Spring Boot** REST backend secured with stateless **JWT Authentication**, coupled with a sleek **React** Single-Page Application (SPA) styled with **Tailwind CSS v4** and powered by **PostgreSQL**.

---

## Technical Architecture

### 1. Backend REST API (Spring Boot)
- **Framework**: Spring Boot 4.1.0 (with Java 21)
- **Security**: Spring Security with Custom Stateless JWT Filters
- **Database Access**: Spring Data JPA & Hibernate
- **Database**: PostgreSQL 18.4
- **Testing**: JUnit Jupiter, MockMvc, and Spring Boot Test Integration Suite

### 2. Frontend Application (React SPA)
- **Build Tool**: Vite v8
- **Framework**: React v19
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React Icons
- **HTTP Routing**: State-based client router with proxy middleware to prevent CORS issues

---

## Features

- **Token-based JWT Authentication**:
  - `POST /api/auth/register`: Allows registering users with explicit role definition (either `USER` or `ADMIN`).
  - `POST /api/auth/login`: Verifies credentials and returns a signed JWT token containing user details and roles.
- **Vehicle Catalog (Protected)**:
  - `GET /api/vehicles`: Retrieves a list of all available vehicles (accessible to both `USER` and `ADMIN`).
  - `GET /api/vehicles/search`: Performs dynamic, case-insensitive substring search and price bounding on inventory (accessible to both `USER` and `ADMIN`).
  - `POST /api/vehicles`: Adds a new vehicle (Restricted to `ADMIN`).
  - `PUT /api/vehicles/:id`: Modifies details of an existing vehicle (Restricted to `ADMIN`).
  - `DELETE /api/vehicles/:id`: Deletes a vehicle from inventory (Restricted to `ADMIN`).
- **Inventory Actions (Protected)**:
  - `POST /api/vehicles/:id/purchase`: Purchases a vehicle, reducing its stock quantity by 1. Automatically throws error if stock is 0.
  - `POST /api/vehicles/:id/restock`: Restocks a vehicle, adding a specified quantity to inventory (Restricted to `ADMIN`).

---

## Local Setup & Run Instructions

### 1. Database Configuration
Ensure PostgreSQL is running locally on port `5432` with a database named `car_dealership`.
Verify or update the connection credentials in [application.properties](file:///Users/mayank/Downloads/car_dealership/src/main/resources/application.properties):
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/car_dealership
spring.datasource.username=postgres
spring.datasource.password=REMOVED_DB_PASSWORD
```

### 2. Run Backend
Navigate to the root directory and start the Spring Boot application using Maven wrapper:
```bash
./mvnw spring-boot:run
```
The server will run on [http://localhost:8080](http://localhost:8080).

### 3. Run Frontend
Navigate to the `frontend` folder, install npm packages, and run the Vite server:
```bash
cd frontend
npm install
npm run dev
```
The client app will run on [http://localhost:5173](http://localhost:5173) and automatically proxy all api calls to port `8080`.

---

## Test Report

The project follows a **Test-Driven Development (TDD)** lifecycle. Integration and unit tests are run via:
```bash
./mvnw test
```

### Results Summary
All 9 test cases passed successfully:
```text
[INFO] Running com.incubyte.car_dealership.controller.VehicleControllerTest
[INFO] Tests run: 7, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.incubyte.car_dealership.controller.AuthControllerTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.incubyte.car_dealership.CarDealershipApplicationTests
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

---

## My AI Usage

### 1. Tools Used
- **Gemini**: Used as the primary agent assistant to plan, structure, and construct the application from start to finish.

### 2. Implementation Methodology
- **TDD Workflow**: Pro-actively generated test suites before writing actual business logic. Commited changes in distinct Red and Green cycles to demonstrate the development trajectory:
  1. Scaffolding Red commits: `AuthControllerTest` and `VehicleControllerTest`.
  2. Resolving compilation issues (finding packages for `AutoConfigureMockMvc` inside custom `webmvc-test` jars).
  3. Green commits: implementing logic for services, controllers, entities, and security filter chains.
  4. Debugging type cast bounds in JPQL filters (`CAST(? AS string)` resolution for PostgreSQL null safety).
- **Vite Proxy Middleware**: Configured Vite server proxy rule inside `vite.config.js` to automatically stream API queries locally, eliminating CORS challenges.

### 3. Reflection & Impact
Using Gemini accelerated the delivery process by managing local Maven verification and resolving minor environment inconsistencies (e.g. locating specific JUnit modules inside custom Spring dependency scopes). The agent ensured full test coverage while building a high-fidelity dashboard that provides a cohesive user experience.
