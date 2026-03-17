# Version 0.0.3 Changes

**Release Date**: March 17, 2026  
**Type**: Feature Release  
**Previous Version**: v0.0.2

## Overview

v0.0.3 focuses on social learning and operational readiness: friend/chat features,
handwriting recognition support in dictionary flow, AWS SES email delivery,
and deployment/CI improvements after merge from `develop` to `main`.

---

## Backend Changes

### Added

- Social data model and APIs:
  - `FriendRequest`, `Friendship`
  - `MessageConversation`, `Message`
- Dictionary handwriting recognition endpoint:
  - `POST /api/dictionary/handwriting/recognize`
- AWS SES integration for transactional email sending.

### Changed

- Refactored backend feature/module structure for maintainability.
- Migrated direct-message table naming to generic message conversation naming.
- Updated deployment and compose defaults for better production compatibility.

### Fixed

- Healthcheck reliability (`127.0.0.1` usage).
- Docker/compose startup issues and missing service port mapping regressions.

---

## Frontend Changes

### Added

- Handwriting input flow for dictionary lookup.
- Social UI flows for friends and conversations.
- UI settings context with snowfall and floating-hearts toggles.
- Deck CSV export from deck detail page.

### Changed

- Dictionary search UX enhancements (language handling + result flow).
- Chat conversations layout improvements.
- Removed unused word card/detail UI components.

---

## Database Migrations

| Migration                                              | Description                                                            |
| ------------------------------------------------------ | ---------------------------------------------------------------------- |
| `20260315023626_add_friend_and_direct_messages`        | Adds `FriendRequest`, `Friendship`, and initial direct message tables  |
| `20260315043000_convert_to_message_conversation_group` | Renames to `MessageConversation`/`Message` and adds group-ready fields |

---

## Breaking/Operational Notes

- No public API breaking change required for study/deck flows.
- Operationally, email delivery now expects AWS SES variables in environment.

---

## Upgrade Path

1. Pull latest `main`.
2. Run Prisma migrations.
3. Ensure AWS SES environment variables are configured.
4. Restart backend/frontend services.
5. Verify health checks and key APIs.
