# AI Tooling Chat History - Prompts List

This file documents the prompts provided to the AI assistant (Antigravity) during the development of this project.

---

## 1. Initial Scaffold Prompt
- **User Prompt**:
  > I want to make this project so please make it in behaf of me and use tech stack in backend use spring boot and in forntend use react and in database use postgre sql

- **System Context**:
  - The browser is showing a TDD Kata: Car Dealership Inventory System document (`AI_Kata_Car_Dealership_Inventory_System_V2.docx`).
  - Target requirements:
    - User Authentication: JWT tokens, register, login, USER/ADMIN roles.
    - Vehicles API: POST, GET, PUT, DELETE, GET search (by make, model, category, price range).
    - Inventory API: Purchase, Restock.
    - TDD (Red-Green-Refactor) pattern.
    - React Frontend.

---

## 2. Follow-Up Prompts
- **User Prompt**:
  > please do remaning task

- **User Prompt**:
  > continue making this app

- **User Prompt**:
  > continue making this app

---

## 3. Tooling Decisions & Iteration Log
- **Git Commit Sequences**:
  - `chore: Add JJWT dependencies for JWT authentication`
  - `test: Add AuthControllerTest (RED state)`
  - `feat: Implement user registration and login endpoints (GREEN state)`
  - `test: Add VehicleControllerTest (RED state)`
  - `feat: Implement vehicle CRUD and search endpoints (GREEN state)`
  - `test: Add purchase and restock test cases (GREEN state)`
  - `feat: Implement React SPA frontend (Aura Drive Dashboard)`
- **Tailwind Integration**:
  - Installed Tailwind CSS v4 and `@tailwindcss/vite` plugin to keep stylesheet setup clean and aligned with the modern bundler architecture.
- **PostgreSQL Cast Resolution**:
  - Resolved `lower(bytea) function not found` type binding errors by casting parameters inside the JPQL queries (`CAST(:param AS string)`).
- **Vite Proxy Configurations**:
  - Programmed a development server proxy route inside `vite.config.js` to redirect `/api/*` endpoint fetches.
