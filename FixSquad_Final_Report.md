# FixSquad: Final Project Report

**Course:** CSE470 (Software Engineering)  
**Team Members:** Rohan, Naim, Wasik, Shan  
**Project:** FixSquad — Home Service Platform  

---

## 1. Motivation
The rapid digitalization of modern commerce has streamlined many sectors, yet finding reliable, small-scale household service providers—such as electricians, plumbers, and carpenters—remains largely inefficient. Traditional methods rely heavily on word-of-mouth or fragmented social media groups, leading to inconsistent pricing, lack of accountability, and scheduling conflicts. 

**FixSquad** was motivated by the need to bridge this gap. Our goal was to engineer a centralized, trust-based marketplace where Customers can seamlessly discover and book vetted professionals, while empowering Providers with digital tools to manage their portfolios, schedules, and earnings. By eliminating the middleman and providing a structured ecosystem for booking, messaging, and dispute resolution, FixSquad aims to modernize the local gig economy.

---

## 2. Agile Methodology: Why and How We Used Sprints
To manage the complexity of building a multi-role marketplace with 20 distinct features under strict academic deadlines, we adopted an **Agile Scrum Methodology**.

**Why Sprints?**
* **Risk Mitigation:** By developing iteratively, we avoided the "big bang" integration nightmare at the end of the semester.
* **Adaptability:** Sprints allowed us to test features early and pivot. For example, testing the booking flow in Sprint 2 allowed us to refine the messaging requirements for Sprint 3.
* **Accountability:** With a requirement of 5 features per member, Sprints provided a transparent framework to distribute the workload evenly and track progress via Burndown Charts.

**How We Executed Sprints:**
We divided the project into 4 structured Sprints, utilizing GitHub for version control and branching (`feature/` branches merging into `sprint-X-staging`):
* **Sprint 1 (Infrastructure & Foundations):** Focused on setting up the Node.js/React environments, Raw MySQL connections, Authentication, and core database models (Service Portfolios and Category Management).
* **Sprint 2 (Core Operations):** Focused on the primary transactional loop: Dynamic Search, Interactive Booking, Provider Request Handling, and dashboards.
* **Sprint 3 (Advanced Features & Security):** Implemented complex cross-functional features like In-Platform Messaging, Automated Invoicing, Ratings, and Admin Dispute Resolution.
* **Sprint 4 (QA & Final Polish):** Focused on geographic filtering (Service Zone Mapping), detailed text reviews, and comprehensive system integration, ensuring security (XSS, IDOR, Rate Limiting) across the platform.

---

## 3. Architecture: Implementing the MVC Pattern
Despite strict constraints against using Object-Relational Mappers (ORMs) or high-level frameworks like Django, we strictly adhered to the **Model-View-Controller (MVC)** architectural pattern to ensure codebase maintainability and separation of concerns.

* **Model (Database & Data Logic):** We utilized a raw MySQL driver (`mysql2`) to interact directly with the database. Our models were represented by structured SQL queries isolating data creation, retrieval, and updates (e.g., parameterized queries for `SELECT * FROM bookings WHERE customer_id = ?`).
* **View (React Frontend):** The View layer was completely decoupled from the backend, implemented as a Single Page Application (SPA) using React. Components like `ServicesPage.jsx` and `MessagingModal.jsx` handle the presentation logic and state management, fetching data asynchronously.
* **Controller (Express API Routes):** The Node.js/Express backend served as the Controller. Files like `messageController.js` and `invoiceController.js` intercepted HTTP requests from the View, enforced business logic and security protocols (Rate Limiting, JWT Authorization), executed the raw SQL Models, and returned JSON responses to the View.

---

## 4. User Guide & Feature Showcase

### 4.1 Authentication & System Infrastructure
* **Login & Registration:** Users can register as a Customer or a Provider. The system securely hashes passwords and issues JSON Web Tokens (JWT) for session management.
* *[Insert Screenshot: Login/Registration Screen]*

### 4.2 Customer Operations
* **Dynamic Service Search & Filter (Feature 1):** Customers can use the search bar on the homepage or the filter panel on the catalog page to find services by keyword or category.
* *[Insert Screenshot: Search & Filter Interface]*
* **Interactive Booking Engine (Feature 2):** After selecting a service, customers select a date and time, provide an issue description, and submit a booking. The system checks against the provider's blocked dates to prevent overlaps.
* *[Insert Screenshot: Booking Modal]*
* **Customer Booking Dashboard (Feature 3):** Customers track their jobs through various states (Pending, Accepted, In-Progress, Completed).
* *[Insert Screenshot: Customer Dashboard]*
* **Rating & Feedback System (Features 4 & 5):** Upon job completion, customers can leave a 1-5 star rating and text review. If issues arise, they can cancel a pending request or open a Dispute Ticket.
* *[Insert Screenshot: Rating Modal & Dispute Ticket]*

### 4.3 Provider Operations
* **Service Portfolio Manager (Feature 6):** Providers define their storefront by adding new services, setting base prices, and assigning categories.
* *[Insert Screenshot: Provider Portfolio Manager]*
* **Booking Requests & Job Workflow (Features 7 & 9):** Providers receive incoming requests, which they can Accept or Reject. Accepted jobs are managed in the Workflow dashboard, where statuses are manually transitioned to "In-Progress" and "Completed."
* *[Insert Screenshot: Provider Job Workflow]*
* **Availability Calendar (Feature 8):** Providers can block out specific dates and times to prevent bookings during their off-hours.
* *[Insert Screenshot: Availability Calendar]*
* **Earnings Report & Service Zones (Features 10 & 20):** Providers can track historical completed jobs and total earnings, and define specific geographic zones where they operate.
* *[Insert Screenshot: Earnings Dashboard]*

### 4.4 Administrator Operations
* **Global Category Manager (Feature 12):** Admins dynamically insert, update, or delete the platform's service categories.
* *[Insert Screenshot: Admin Category Dashboard]*
* **Verification & Access Control (Features 11 & 14):** Admins review new provider registrations to verify them. They also have the power to suspend or reactivate any user account.
* *[Insert Screenshot: Admin Access Control Panel]*
* **Dispute Resolution Desk (Feature 13):** Admins view escalated tickets and can forcefully update job statuses or issue refunds.
* *[Insert Screenshot: Dispute Resolution Desk]*

### 4.5 Cross-Functional Features
* **In-Platform Messaging (Feature 16):** Secure, real-time chat modal tied to specific booking IDs, allowing Customers and Providers to communicate. Protected against XSS and IDOR.
* *[Insert Screenshot: Chat Modal]*
* **Automated Invoicing (Feature 18):** Upon job completion, the system compiles booking data into a downloadable PDF receipt.
* *[Insert Screenshot: PDF Invoice Example]*
* **System Notification Feed (Feature 19):** Trigger-based alerts appear in the navigation bar when database states change (e.g., "Your booking was accepted!").
* *[Insert Screenshot: Notification Dropdown]*

---

## 5. Sprint Burndown Charts
*The following charts demonstrate our team's velocity and task completion rate across the 4 sprints.*

* *[Insert Screenshot: Sprint 1 Burndown Chart]*
* *[Insert Screenshot: Sprint 2 Burndown Chart]*
* *[Insert Screenshot: Sprint 3 Burndown Chart]*
* *[Insert Screenshot: Sprint 4 Burndown Chart]*

---
*End of Report*
