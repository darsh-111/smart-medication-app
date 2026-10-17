# Deploy the current React Native / Expo web app on Vercel

Repository: darsh-111/smart-medication-app
The current Expo patient app is in mobile/. Select that directory as the Vercel Root Directory.

1. In Vercel select Add New > Project, connect your darsh-111 GitHub account, and import smart-medication-app.
2. Root Directory: mobile. Framework Preset: Other.
3. Install Command: npm ci. Build Command: npm run build:web. Output Directory: dist.
4. Set EXPO_PUBLIC_API_URL to https://smart-medication-api-d430d.containers.snapdeploy.app (the default in the app is the same URL).
5. Deploy. The mobile/vercel.json file supplies the build settings and single-page rewrites.
6. Add the exact deployed HTTPS origin (without a trailing slash) to the existing FRONTEND_ORIGINS environment variable on SnapDeploy. Preserve the existing localhost origins by appending a comma and the new origin. Apply the environment change/restart using the host UI. If the free host requires a redeploy and its quota is exhausted, API login remains blocked from this new origin until the quota resets.
7. Open the new website on a phone using mobile data. Test login, loading data, profile save/reload and logout. The host may need time to wake after inactivity.

The browser calls the existing backend directly. No API proxy or database credentials are deployed to Vercel. Never put DATABASE_PASSWORD or JWT_SECRET in Vercel frontend variables.

Only the web version is published here; this does not generate an APK. Browser reminders currently require the page to stay open. Patient v2 backend additions are prepared but not yet published; those buttons stay disabled until the updated backend advertises support.

Future commits to the selected production branch redeploy through the Vercel GitHub integration. The older Vite project at the repository root remains separate; changing its existing Vercel Root Directory would replace that site's selected source.
