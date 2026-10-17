# Smart Medicine System 0.2.0

Bilingual React Native / Expo patient app. The app opens in live account mode;
the demo remains available separately through Demo preview.
Live mode supports patient registration/login and reads account data, assigned
medications, schedules with prescribed weekdays, and existing dose history.
Live mode supports patient profile updates and scheduled taken/missed dose recording.
Passwords are never persisted. Session retention is optional: native SecureStore or browser sessionStorage limited to the current tab, with expiry and logout cleanup.

An earlier Android update (versionCode 2) was built with the original signing certificate. Package identity remains com.smartmedicinesystem.patient. That APK predates the current patient updates. No new APK has been built for these changes.

## Cloud connection
Backend: https://smart-medication-api-d430d.containers.snapdeploy.app
Database: Neon PostgreSQL, accessed only by the backend.
The app uses EXPO_PUBLIC_API_URL from .env.local, with the cloud URL as its default.
Sign-in uses the configured cloud URL automatically; no server-address field is shown.
Start start-preview.cmd for Expo on the computer, or start-phone.cmd for phone
preview. No local Java backend or PostgreSQL process is needed.
Restart Expo after changing the environment file. Existing APKs and preview-build
contain older code and must be rebuilt to include this update.

The free backend sleeps after inactivity. Open the wake-up link on the sign-in
screen and wait about a minute if needed. Requests allow up to 90 seconds; failed
registration or other writes are never automatically retried.

The cloud database is new: local accounts and records were not migrated.
Create a patient account to load its assigned medications, schedules and dose
history. Empty accounts show an empty state. Home, schedule, history and profile
tabs use the authenticated patient API. Profile changes are saved to Neon. Scheduled
doses can be recorded as taken or missed once due; duplicate submissions do not
create duplicate records. Passwords are never persisted; session retention is opt-in.

Patient v2 is implemented and tested but NOT yet deployed: the free hosting rolling deployment quota blocked publishing it. The UI disables server-dependent v2 writes until overview features advertise support. Prepared features include personal medication CRUD/archive/restore, as-needed doses, audited dose corrections, paged history, patient settings, consent-based caregiver invitations and the inbox. Doctor prescriptions remain read-only for patients. New schedules do not retroactively create unrecorded doses.

The smart box is still being designed. The UI exposes the use preference and real linked-device status when available; pairing, firmware and physical integration are not completed.

## Verification
Run npm run typecheck and npm test. The API tests cover the cloud fallback,
environment overrides, bearer authentication and server URL validation.

Cloud verification: profile save/reload, assigned schedules, simultaneous duplicate dose
requests and cross-patient write rejection passed on the deployed API.

## Reminders and automatic missed records
The live Reminders tab supports an in-app test, optional device notifications,
15-minute snoozing, and opt-in automatic missed-dose records with 15/30/60/120
minute confirmation windows. Settings, snoozes and processed keys are stored per
account on this device. The original prescription schedule remains unchanged.

Web alerts require the page to remain open; browser system notifications require
permission and browser support. Native code uses expo-notifications for up to 60
notifications over the next seven days. Dates are calculated in the patient's
configured timezone, including DST, rather than the device timezone. No push token,
Firebase account, or external push service is used for these local reminders.

Automatic missed-dose reconciliation runs while the authenticated app is active or
on return, reviewing up to seven days of schedules after activation. It first reads
fresh server state, then uses the existing patient-scoped endpoint. No server job
runs while the app is closed. Snoozing also moves the confirmation deadline. Auto
records have an AUTO_MISSED_V1 note; they indicate no confirmation, not observed
non-adherence. Patient v2 adds corrections with a required reason and retained audit history; corrections remain disabled until the new backend is deployed.

Logout cancels this patient's scheduled notifications; signing in as another
patient removes previously scheduled app reminders for the old account. System
notification bodies are generic and contain no medication names. A new native build
is required to include the new module. Android/iOS notification delivery has not
been tested on a device; tests cover scheduling adapters, timing and server writes.

Reference: https://docs.expo.dev/versions/v57.0.0/sdk/notifications/

Current validation (2026-10-17): TypeScript and frontend tests passed; Android Hermes JS bundle exported successfully. Backend deployment copy passed 14 tests including transactional PostgreSQL integration. This does not verify physical phone notifications or hardware.
