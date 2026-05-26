# Dedikodu — API Specification

Base URL: `/api`

All authenticated endpoints require `Authorization: Bearer <token>` header. 401 returned if invalid/missing.

## Auth Endpoints

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| POST | /api/signup | {nickname: string (required), fullName: string (required), email: email (required), password: string (required, min 6), phone: string (required)} | {token: string, user: {id: UUID, email: string, name: string, nickname: string, subscriptionLevel: string, isSuperuser: boolean, emailVerified: boolean}} | No |
| POST | /api/auth/login | {email: string (required), password: string (required)} | {token: string, user: {id: UUID, email: string, name: string, nickname: string, subscriptionLevel: string, isSuperuser: boolean, emailVerified: boolean}} | No |
| GET | /api/auth/me | — | {user: {id: UUID, email: string, name: string, nickname: string, subscriptionLevel: string, isSuperuser: boolean, emailVerified: boolean, phone: string, createdAt: ISO8601, gossipCount: integer, approvedGossipCount: integer}} | Bearer |

Note: `name` maps to `fullName` in DB. The signup creates a User with `subscriptionLevel: "basic"`, `emailVerified: false`, `isSuperuser: false`.

## Email Verification

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| POST | /api/auth/send-verification | — | {success: boolean, message: string} | Bearer |
| POST | /api/auth/verify-email | {code: string (required)} | {success: boolean, message: string} | Bearer |

Backend generates a 6-digit code, stores it on the user record (with expiry), and sends it via email (or logs to console for dev). User submits the code to verify.

## Subscription

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| PATCH | /api/users/me/subscription | {subscriptionLevel: string (required, enum: basic/gold/platinum)} | {id: UUID, subscriptionLevel: string} | Bearer |

## Location Endpoints

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| GET | /api/provinces | — | {items: {id: UUID, name: string}[]} | Bearer |
| GET | /api/provinces/:provinceId/districts | — | {items: {id: UUID, name: string, provinceId: UUID}[]} | Bearer |
| GET | /api/districts/:districtId/neighborhoods | — | {items: {id: UUID, name: string, districtId: UUID}[]} | Bearer |

## Gossip Endpoints

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| POST | /api/gossips | {neighborhoodId: UUID (required), content: string (required, max 300)} | {id: UUID, content: string, status: string, neighborhoodId: UUID, neighborhoodName: string, districtName: string, provinceName: string, authorNickname: string, createdAt: ISO8601} | Bearer (Gold/Platinum + emailVerified) |
| GET | /api/gossips | query: ?provinceId=UUID&districtId=UUID&neighborhoodId=UUID&page=integer&limit=integer | {items: Gossip[], total: integer, page: integer, totalPages: integer} | Bearer |
| GET | /api/gossips/pending | query: ?page=integer&limit=integer | {items: PendingGossip[], total: integer, page: integer, totalPages: integer} | Bearer (Platinum only) |
| PATCH | /api/gossips/:id/moderate | {action: string (required, enum: approve/reject)} | {id: UUID, status: string, approvedAt: ISO8601 \| null} | Bearer (Platinum only) |

**Gossip object** (in GET /api/gossips response):
```
{
  id: UUID,
  content: string,
  status: string,
  neighborhoodName: string,
  districtName: string,
  provinceName: string,
  authorNickname: string,
  createdAt: ISO8601,
  approveCount: integer,
  disapproveCount: integer,
  userReaction: "approve" | "disapprove" | null
}
```

GET /api/gossips returns ONLY gossips with status "approved". The `userReaction` field indicates the current user's reaction (null if none).

**PendingGossip object** (in GET /api/gossips/pending response):
```
{
  id: UUID,
  content: string,
  status: "pending",
  neighborhoodName: string,
  districtName: string,
  provinceName: string,
  authorNickname: string,
  createdAt: ISO8601
}
```

## Reaction Endpoints

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| POST | /api/gossips/:id/react | {reactionType: string (required, enum: approve/disapprove)} | {approveCount: integer, disapproveCount: integer, userReaction: string, removed: boolean} | Bearer |
| DELETE | /api/gossips/:id/react | — | {approveCount: integer, disapproveCount: integer, userReaction: null} | Bearer |

POST creates or updates the user's reaction. If the gossip reaches 20+ disapprove reactions, backend auto-sets status to "removed" and returns `removed: true`. DELETE removes the user's reaction.

## Admin Endpoints

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| GET | /api/admin/stats | — | {totalUsers: integer, totalGossips: integer, pendingGossips: integer, approvedGossips: integer, rejectedGossips: integer, removedGossips: integer} | Bearer (Superuser) |
| GET | /api/admin/users | query: ?search=string&page=integer&limit=integer | {items: AdminUser[], total: integer, page: integer, totalPages: integer} | Bearer (Superuser) |
| GET | /api/admin/users/:userId | — | {id: UUID, nickname: string, fullName: string, email: string, phone: string, subscriptionLevel: string, emailVerified: boolean, isSuperuser: boolean, createdAt: ISO8601} | Bearer (Superuser) |
| PATCH | /api/admin/users/:userId | {subscriptionLevel: string (required, enum: basic/gold/platinum)} | {id: UUID, nickname: string, subscriptionLevel: string} | Bearer (Superuser) |

**AdminUser object** (in list):
```
{
  id: UUID,
  nickname: string,
  email: string,
  subscriptionLevel: string,
  emailVerified: boolean,
  createdAt: ISO8601
}
```

## Authorization Rules Summary

- POST /api/gossips: requires Gold or Platinum subscription AND emailVerified = true. Return 403 with message otherwise.
- GET /api/gossips/pending, PATCH /api/gossips/:id/moderate: requires Platinum subscription. Return 403 otherwise.
- GET/PATCH /api/admin/*: requires isSuperuser = true. Return 403 otherwise.
- All other authenticated endpoints: any subscription level.

## Seed Data

On first run, seed a superuser: email `admin@dedikodu.app`, password `Admin123!`, nickname `admin`, fullName `Admin`, phone `+900000000000`, subscriptionLevel `platinum`, isSuperuser `true`, emailVerified `true`.
