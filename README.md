# DO Coupon System

A lightweight coupon creation and management UI backed by Strapi. The project provides a responsive front end for issuing and browsing coupons and a minimal backend API for programmatic coupon creation that returns QR-ready data.

> Status: Internal project documentation draft. Adjust field names to match your Strapi schema if it differs.

---

## Table of Contents

* [Overview](#overview)
* [Frontend at a Glance](#frontend-at-a-glance)
* [Tech Stack](#tech-stack)
* Backend API

  * [/create-active-coupon](#create-active-coupon)
  * [Environment Variables](#environment-variables)
  * [Request & Response Examples](#request--response-examples)
  * [Validation Rules & Errors](#validation-rules--errors)
* [How the Frontend uses `QRdata`](#how-the-frontend-uses-qrdata)
* [Local Development](#local-development)
* [Security Notes](#security-notes)

---

## Overview

**DO Coupon System** is a small web application used to issue member coupons, toggle their active status, and export QR codes for redemption. The system integrates with **Strapi** as the source of truth for coupon records. A tiny Node/Express endpoint is provided to create an **active coupon** from internal or external systems and returns the **hash** used to render a QR code.

## Frontend at a Glance

The UI focuses on operational efficiency and clarity.

* **Responsive Navbar**

  * Brand logo + **DO Coupon System** title.
  * **New/新增** (black button): opens Strapi create page in a new tab.
  * **Logout/登出** (red button): clears `username` & `role` cookies and redirects to `/`.
  * **Mobile**: collapses non-essential items into a dropdown; desktop layout remains unchanged.

* **Coupon List**

  * **Active/Inactive** toggle displayed on each coupon.
  * **QR Download** button (Bootstrap Icon: `bi-cloud-download`) that exports a **PNG** QR image generated from the coupon’s `Hash`.
  * Tooltip on hover with short instructions.

* **Detail & Usability**

  * Clear display of **Title**, **Description**, **Expiry**, **UsesLeft**.
  * Layout optimized for desktop, gracefully adapts to mobile.

> **Note:** Exact fields and filters can be adapted to your current Strapi model (e.g., `Title`, `Description`, `Expiry`, `Active`, `UsesLeft`, `Hash`, `AssignedFrom`, `AssignedTo`, `Type`, `Email`, `Contact`, `users_permissions_user`).

## Tech Stack

* **Frontend:** React, React-Bootstrap, Bootstrap Icons
* **Backend (integration):** Node.js + Express (proxying to **Strapi**)
* **Data:** Strapi (v5 collection type: `coupons`)

## Backend API (Public use)

This repository exposes a single integration endpoint that **creates an active coupon** in Strapi and returns the **QR hash**.

### `/create-active-coupon`

**Method:** `POST`
**Auth:** This route itself can be protected behind your gateway/firewall. It authenticates to Strapi using a server-side **Admin/API token** (`STRAPI_KEY`).
**Purpose:** Create a coupon in Strapi and immediately activate it.

**Body Parameters**

| Field           | Type                | Required | Notes                                                           |
| --------------- | ------------------- | -------- | --------------------------------------------------------------- |
| `title`         | string              | ✅        | Coupon title → maps to `Title`                                  |
| `description`   | string              | ❌        | Short description → maps to `Description`                       |
| `expiry`        | string (yyyy-MM-dd) | ✅        | Expiration date → maps to `Expiry`                              |
| `uses_left`     | number              | ❌        | Times this coupon can be used, default `1` → maps to `UsesLeft` |
| `type`          | string (enum)       | ❌        | E.g. `NetRed` → maps to `Type`                                  |
| `assigned_from` | string              | ✅        | Provider Document ID → maps to `AssignedFrom`, Also a Name (from coupon-sys-account) could be passed in |
| `assigned_to`   | string              | ✅        | Displayed owner name → maps to `AssignedTo`                     |
| `email`         | string              | ❌        | Owner email → maps to `Email`                                   |
| `contact`       | string              | ❌        | Owner contact → maps to `Contact`                               |
| `user`          | string              | ✅        | Strapi `users_permissions_user` document ID (relationship only)  |

**Success Response**

* `201 Created`

```json
{
  "couponStatus": "active",
  "QRdata": "<hash>",
  "message": "Coupon created successfully."
}
```

**Failure Response**

* `400 Bad Request` (missing params)
* `4xx/5xx` (propagated from Strapi)
* `500 Server Error` (internal error)

### Environment Variables

Set the following **server-side** variables for the integration service:

```
VITE_API_ENDPOINT=https://api.example.com/api - Strapi
VITE_API_KEY=<api key>
VITE_BACKEND_API=http://localhost:3003
```

### Request & Response Examples

#### cURL

```bash
curl -X POST https://<your-host>/create-active-coupon \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Welcome Gift",
    "description": "10% off any item",
    "expiry": "2025-12-31",
    "uses_left": 1,
    "type": "NetRed",
    "assigned_from": <document_id> | "ExampleName",
    "assigned_to": "Alice Zhang",
    "email": "alice@example.com",
    "contact": "+61 400 000 000",
    "user": <document_id>
  }'
```

**201**

```json
{
  "couponStatus": "active",
  "QRdata": "<hash>",
  "message": "Coupon created successfully."
}
```

**400** (example)

```json
{
  "couponStatus": "fail",
  "message": "Title, Expiry Date, assigning info （including display and relations） are nessesary."
}
```

#### fetch (browser/server)

```js
const resp = await fetch("/create-active-coupon", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "Welcome Gift",
    expiry: "2025-12-31",
    assigned_from: "balabalabalabala123123",
    assigned_to: "Alice Zhang",
    user: "balabalabalabala123124",
  }),
});
const data = await resp.json();
// data.QRdata contains the hash for QR code rendering
```

### Validation Rules & Errors

* **Required:** `title`, `expiry` (format `yyyy-MM-dd`), `assigned_from`, `assigned_to`, `user`.
* **Optional defaults:** `uses_left` → `1`. Unspecified fields are stored as empty string or omitted per Strapi model. Please set to your desired value.
* **Pass-through errors:** Strapi validation or permission issues will be surfaced with Strapi’s status code and message when available.

## How the Frontend uses `QRdata`

The API returns `QRdata` (the `Hash` stored in Strapi). Frontend can render a downloadable PNG with any QR library. Example with \[`qrcode` NPM]:

```bash
npm i qrcode
```

```js
import QRCode from "qrcode";

async function downloadQR(hash) {
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, hash, { width: 512, margin: 1 });

  const link = document.createElement("a");
  link.download = `coupon-${hash}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// In a button click handler:
// downloadQR(data.QRdata)
```

## Local Development

> Adjust paths/scripts to match your repository structure.

1. **Clone**

```bash
git clone https://github.com/DreamOverseas/DO-Coupon-System.git
cd DO-Coupon-System
```

2. **Install**

```bash
npm install
# or yarn, pnpm, as your like
```

3. **Configure** `.env`

```
VITE_API_ENDPOINT=https://api.example.com/api
VITE_API_KEY=<your key>
VITE_BACKEND_API=http://localhost:3003
```

4. **Run**

```bash
npm run dev   # start frontend and/or express integration
```

## Security Notes

* Keep **`STRAPI KEY` server-side** only. Try **not** expose in client bundles.
* Prefer **HTTPS** end-to-end.
* Consider adding **rate limiting** and **input validation** at the Express layer.
* Audit CORS to only allow trusted origins for the integration route.
* Log request IDs and Strapi response IDs for traceability.

### Acknowledgement
Algorithms are FUN!
