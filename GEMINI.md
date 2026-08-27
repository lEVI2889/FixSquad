# FixSquad Project Instructions

## Project Overview & Tech Stack
**Project Name:** FixSquad
**Context:** CSE470 Semester Project (House-service platform for small-scale household service providers such as electricians, plumbers, etc.)
**Team Members:** Rohan, Naim, Wasik, Shan.

**Technology Stack:**
*   **Frontend:** React
*   **Backend:** Node.js with Express
*   **Database:** MySQL
*   **Strict Constraints:** 
    *   ORM-based projects are strictly prohibited. The backend MUST use a basic database driver and execute raw SQL queries.
    *   Django and Flask are strictly prohibited.
    *   Libraries/packages may be used only if they do not implement a major feature of the project.

## Master Product Backlog
The project requires 20 distinct features in total (so each of the 4 members completes at least 5 features by the end of the semester). Login and Registration are required infrastructure but do not count toward the 20 features. Features are pulled dynamically into the Sprint Backlog rather than pre-assigned permanently.

1. **Dynamic Service Search & Filter:** Search and filter providers by keyword, category, and price.
2. **Interactive Booking Engine:** View provider availability and submit service requests.
3. **Customer Booking Dashboard:** Track real-time status of past and active bookings.
4. **Review & Rating System:** Leave 1-5 star reviews on completed jobs; recalculate aggregate scores.
5. **Dispute & Cancellation:** Cancel pending requests or open dispute tickets on completed jobs.
6. **Service Portfolio Manager:** Providers add, edit, or delete specific services and base prices.
7. **Booking Request Handler:** Providers accept or reject incoming customer booking requests.
8. **Availability Calendar:** Providers block out specific dates/times in the database.
9. **Job Workflow Controller:** Providers manually transition accepted jobs to "In-Progress" and "Completed."
10. **Earnings Report:** Dashboard aggregating historical completed jobs and calculating total earnings.
11. **Provider Verification:** Admins review new provider registrations and update status to "Approved."
12. **Global Category Manager:** Admins dynamically insert, update, or delete core service categories.
13. **Dispute Resolution Desk:** Admins view dispute tickets and forcefully update job statuses/issue refunds.
14. **Access Control:** Admins suspend or reactivate user accounts in the database.
15. **Analytics Overview:** System-wide statistics (transaction volume, total active jobs) via complex SQL joins.
16. **In-Platform Messaging:** Text messaging tied to active booking IDs for secure communication.
17. **Quote Negotiation:** Providers update pending booking prices; requires explicit customer acceptance.
18. **Automated Invoicing:** System compiles booking data into downloadable invoices upon job completion.
19. **Notification Feed:** Feed of system alerts triggered by database state changes.
20. **Service Zone Mapping:** Providers define working regions to restrict search visibility.

## Architecture & Implementation Rules
*   **Architecture Pattern:** Decoupled architecture. React handles UI and routing; Node.js/Express handles business logic and acts as a REST API.
*   **Database Interactions:** All interactions with the MySQL database must be written as raw SQL string queries within the Node.js functions. No ORMs (like Sequelize or Prisma) are allowed.
*   **Foundational Database Schema:** Development revolves around four core tables:
    *   `users`: Stores Customers, Providers, and Admins (requires a role column).
    *   `categories`: Stores the types of services available.
    *   `services`: Stores the specific offerings created by Providers.
    *   `bookings`: The central transaction table linking a Customer, a Provider, a Service, and a Status (Pending, Accepted, In-Progress, Completed).

## Agent Scope & Git Workflow

### Scope
*   **Strict Assignment Focus:** The agent is ONLY permitted to implement tasks specifically assigned to me (Rohan). 
*   **No Autonomous Backlog Execution:** The agent must never attempt to code the entire master backlog or generate unassigned features autonomously.

### Git Workflow
*   **Isolated Feature Branches:** The agent must work exclusively on isolated feature branches off the `main` branch.
*   **Mandatory Manual Review:** Because the codebase is being actively synced with 3 other team members via GitHub, the agent must request my manual review and explicit approval before executing any `git commit`, `git push`, or performing any destructive file changes. Do not execute Git commands automatically.