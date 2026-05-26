# Dedikodu — Database Schema

## Entity: User

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| nickname | String | Unique, required, min 3 chars |
| fullName | String | Required |
| email | String | Unique, required |
| password | String | Required, bcrypt hashed |
| phone | String | Required |
| subscriptionLevel | Enum (basic, gold, platinum) | Default: basic |
| isSuperuser | Boolean | Default: false |
| emailVerified | Boolean | Default: false |
| verificationCode | String | Nullable, 6-digit code |
| verificationCodeExpiresAt | DateTime | Nullable |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Indexes: email (unique), nickname (unique)

## Entity: Province

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| name | String | Required |

## Entity: District

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| provinceId | UUID | FK to Province, required, ON DELETE CASCADE |
| name | String | Required |

Indexes: provinceId

## Entity: Neighborhood

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| districtId | UUID | FK to District, required, ON DELETE CASCADE |
| name | String | Required |

Indexes: districtId

## Entity: Gossip

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| userId | UUID | FK to User, required, ON DELETE CASCADE |
| neighborhoodId | UUID | FK to Neighborhood, required, ON DELETE CASCADE |
| content | String | Required, max 300 chars |
| status | Enum (pending, approved, rejected, removed) | Default: pending |
| moderatorId | UUID | FK to User, nullable |
| createdAt | DateTime | Auto |
| approvedAt | DateTime | Nullable |
| updatedAt | DateTime | Auto |

Indexes: userId, neighborhoodId, status, createdAt (for sorting)

## Entity: Reaction

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| gossipId | UUID | FK to Gossip, required, ON DELETE CASCADE |
| userId | UUID | FK to User, required, ON DELETE CASCADE |
| reactionType | Enum (approve, disapprove) | Required |
| createdAt | DateTime | Auto |

Indexes: gossipId, userId
Unique constraint: (gossipId, userId) — one reaction per user per gossip

## Relationships

- User 1:N Gossip (userId)
- User 1:N Reaction (userId)
- Gossip 1:N Reaction (gossipId)
- Gossip N:1 User as moderator (moderatorId)
- Province 1:N District (provinceId)
- District 1:N Neighborhood (districtId)
- Neighborhood 1:N Gossip (neighborhoodId)

## Seed Data

Superuser account:
- email: admin@dedikodu.app
- password: Admin123! (bcrypt hashed)
- nickname: admin
- fullName: Admin
- phone: +900000000000
- subscriptionLevel: platinum
- isSuperuser: true
- emailVerified: true

Location tables (Province, District, Neighborhood) are created empty — user will populate later.
