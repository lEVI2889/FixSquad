# Sprint 2: Provider Operations (Features 7 & 8) - API & DB Contract
**Author:** Rohan
**Status:** Completed & Pushed

This document serves as a strict technical contract for the remaining Sprint backlog. All subsequent features built by other team members MUST adhere to these exact database structures and API schemas.

## 1. Database Schema Specifications

### `provider_availability` Table (Feature 8)
Used by providers to block out dates/times. Customers MUST NOT be able to book providers during these intervals.

```sql
CREATE TABLE provider_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT NOT NULL,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_blocked BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### `bookings` Table (Feature 7)
The central transaction table linking customers to providers for specific services.

```sql
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    provider_id INT NOT NULL,
    service_id INT NOT NULL,
    status ENUM('Pending', 'Accepted', 'Rejected', 'In-Progress', 'Completed', 'Cancelled', 'Disputed') DEFAULT 'Pending',
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    total_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);
```

---

## 2. API Endpoints

All endpoints are prefixed with `/api` and require a valid Bearer JWT token in the `Authorization` header. Provider-specific routes automatically extract `provider_id` from `req.user.id`.

### Booking Request Handler (Feature 7)

#### **GET** `/api/bookings/provider/pending`
*   **Description:** Fetches all 'Pending' bookings for the currently authenticated provider.
*   **Headers:** `Authorization: Bearer <token>`
*   **Response Structure (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "customer_id": 2,
          "provider_id": 1,
          "service_id": 1,
          "status": "Pending",
          "scheduled_date": "2026-10-20T00:00:00.000Z",
          "scheduled_time": "14:00:00",
          "total_price": "500.00",
          "customer_name": "John Doe",
          "service_name": "Pipe fixing",
          "created_at": "...",
          "updated_at": "..."
        }
      ]
    }
    ```

#### **PUT** `/api/bookings/:id/status`
*   **Description:** Updates the status of a specific booking (e.g., Accepting or Rejecting a pending request).
*   **Headers:** `Authorization: Bearer <token>`
*   **Request Body (JSON):**
    ```json
    {
      "status": "Accepted" // Or "Rejected"
    }
    ```
*   **Response Structure (200 OK):**
    ```json
    {
      "success": true,
      "message": "Booking accepted successfully"
    }
    ```

### Availability Calendar (Feature 8)

#### **GET** `/api/availability`
*   **Description:** Fetches all blocked availability records for the authenticated provider.
*   **Headers:** `Authorization: Bearer <token>`
*   **Response Structure (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "provider_id": 1,
          "date": "2026-10-15T00:00:00.000Z",
          "start_time": "09:00:00",
          "end_time": "12:00:00",
          "is_blocked": 1,
          "created_at": "..."
        }
      ]
    }
    ```

#### **POST** `/api/availability`
*   **Description:** Inserts a new block-out date and time range for the authenticated provider.
*   **Headers:** `Authorization: Bearer <token>`
*   **Request Body (JSON):**
    ```json
    {
      "date": "2026-10-15",
      "start_time": "09:00",
      "end_time": "12:00"
    }
    ```
*   **Response Structure (201 Created):**
    ```json
    {
      "success": true,
      "message": "Availability block added",
      "data": { "id": 2 }
    }
    ```

#### **DELETE** `/api/availability/:id`
*   **Description:** Deletes a specific block-out record.
*   **Headers:** `Authorization: Bearer <token>`
*   **Response Structure (200 OK):**
    ```json
    {
      "success": true,
      "message": "Availability block removed"
    }
    ```
