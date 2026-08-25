# Integration Contract: Frontend Shell, Routing & Authentication

**AUTHOR:** Wasik  
**FEATURE BRANCH:** `feature/frontend-shell-auth`

> [!IMPORTANT]
> This document defines the frontend paths and authentication state that other FixSquad features must use. Keep these names stable during integration.

---

## 1. Routing Contract

The root application is wrapped by `BrowserRouter` and `AuthProvider`. `AppLayout` supplies the persistent navigation bar, page outlet, and footer.

| Path | Component | Access | Purpose |
| --- | --- | --- | --- |
| `/` | `HomePage` | Public | Landing page |
| `/home` | Redirect to `/` | Public | Backward-compatible home alias |
| `/login` | `LoginPage` | Public / guest | User login form |
| `/register` | `RegisterPage` | Public / guest | Customer/provider registration form |
| `/dashboard` | `DashboardPage` | Authenticated | Role-aware account landing page |
| `/provider/portfolio` | `ProviderPortfolio` | Authenticated | Rohan's Service Portfolio Manager |
| `*` | `NotFoundPage` | Public | 404 fallback |

### Mandatory Provider Portfolio Integration

- Exact file path: `frontend/src/pages/ProviderPortfolio.jsx`
- Exact component/default export name: `ProviderPortfolio`
- Exact route: `/provider/portfolio`
- Required props: none

The current file is an integration placeholder. Rohan's final `ProviderPortfolio.jsx` replaces it without requiring any router changes.

### Protected Route Behavior

Unauthenticated visits to `/dashboard` or `/provider/portfolio` redirect to `/login`. The originally requested location is retained in React Router location state and restored after a successful login.

---

## 2. Global Authentication State Contract

Authentication state is exposed by `useAuth()` from `frontend/src/context/useAuth.js`. Components that call `useAuth()` must render below `AuthProvider`.

| State / Function | Type | Contract |
| --- | --- | --- |
| `user` | `object \| null` | Authenticated user. Expected fields used by the shell are `name`, `email`, and `role`. |
| `token` | `string \| null` | Bearer access token returned by Shan's authentication API. |
| `isAuthenticated` | `boolean` | `true` when a token or authenticated user exists. |
| `isAuthLoading` | `boolean` | `true` while login or registration is being submitted. |
| `login(credentials)` | `async function` | Calls the login endpoint and stores the returned session. |
| `register(userData)` | `async function` | Calls the registration endpoint and stores the returned session. |
| `logout()` | `function` | Clears authentication state and browser persistence. |

### Browser Persistence Keys

- Access token: `localStorage.getItem('token')`
- Serialized user: `localStorage.getItem('user')`

The `token` key is mandatory because Rohan's Service Portfolio API wrapper reads this exact key.

### Roles Used by the Frontend

- `customer`
- `provider`

The provider-only navigation link is displayed when `user.role === 'provider'`. Route protection currently requires authentication; backend authorization remains authoritative.

---

## 3. Axios/API Contract

The shared Axios instance is the default export from `frontend/src/services/api.js`.

- Browser-facing base URL: `VITE_API_BASE_URL`, defaulting to `/api`
- Development proxy target: `VITE_API_PROXY_TARGET`, documented in `frontend/.env.example`
- `withCredentials: true` supports Shan's cookie-based sessions if used.
- When `localStorage['token']` exists, every request sends `Authorization: Bearer <token>`.
- A `401 Unauthorized` response clears the stored session and updates global authentication state.

### Authentication Endpoints

- `POST /api/auth/login`
- `POST /api/auth/register`

These endpoint suffixes are centralized in `frontend/src/services/authService.js`. If Shan's final contract uses different suffixes, only `AUTH_ROUTES` in that file must change.

### Authentication Payloads

Login request:

```json
{
  "email": "string",
  "password": "string"
}
```

Registration request:

```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "role": "customer | provider",
  "password": "string"
}
```

Supported authentication response shapes may expose `token`/`accessToken` and `user` either at the top level or inside `data`.

---

## 4. Service Portfolio Compatibility

Rohan's contracted relative URL `/api/services` is preserved. Feature modules should import the shared Axios client and use service-relative paths such as `/services`; the client adds the `/api` base prefix and authorization header.

No production component hardcodes a backend host or port.
