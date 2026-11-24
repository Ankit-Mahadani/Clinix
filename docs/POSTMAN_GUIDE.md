# Postman Collection & Testing Guide for MediTrack

This repository includes a production-ready Postman collection (`postman/MediTrack.postman_collection.json`) and environment configuration (`postman/MediTrack.postman_environment.json`) covering all 17+ core and extended API endpoints, including positive flows and negative security/validation assertions.

---

## 1. Quick Import

1. Open **Postman** (Desktop or Web).
2. Click **Import** in the upper-left corner.
3. Drag and drop or select the two files from the repository:
   - `postman/MediTrack.postman_collection.json`
   - `postman/MediTrack.postman_environment.json`
4. Select the active environment in the top-right environment selector: **"MediTrack Environment (Local / Docker)"**.

---

## 2. Environment Variables

The collection relies on the following environment variables (pre-configured):

| Variable | Default Value | Description |
|---|---|---|
| `base_url` | `http://localhost:8000` | Target backend host address |
| `demo_email` | `demo@meditrack.com` | Demo account email for authentication |
| `demo_password` | `Password123!` | Demo account password |
| `jwt_access_token` | *(Auto-populated)* | Injected into `Authorization: Bearer {{jwt_access_token}}` |
| `jwt_refresh_token` | *(Auto-populated)* | Used by `/api/auth/token/refresh/` |
| `patient_id` | `1` | Dynamically assigned during collection runs |
| `doctor_id` | `1` | Dynamically assigned during collection runs |
| `mapping_id` | `1` | Dynamically assigned during collection runs |

---

## 3. Automated Token Persistence

When you execute **POST Login Demo User**, the test script automatically extracts the cryptographic tokens from the response envelope and saves them into your Postman environment:

```javascript
var jsonData = pm.response.json();
if (jsonData.success && jsonData.data.access) {
    pm.environment.set("jwt_access_token", jsonData.data.access);
    pm.environment.set("jwt_refresh_token", jsonData.data.refresh);
}
```

All subsequent requests in the **Patients**, **Doctors**, **Mappings**, and **Dashboard** folders automatically inherit the `Bearer {{jwt_access_token}}` authorization header.

---

## 4. End-to-End Automated Test Run (Collection Runner)

You can run the entire test suite end-to-end with Postman's Collection Runner:

1. Click on **MediTrack Healthcare API** collection in the left sidebar.
2. Click **Run Collection**.
3. Ensure the environment is set to **MediTrack Environment (Local / Docker)**.
4. Click **Run MediTrack Healthcare API**.
5. All assertions will execute green:
   - Status code assertions (200, 201, 400, 401, 403, 404).
   - Unified error envelope checks (`{ success: false, error: { code, message, details } }`).
   - Duplicate doctor assignment rejection (`DUPLICATE_ENTRY` 400).
   - Multi-tenant boundary isolation.
