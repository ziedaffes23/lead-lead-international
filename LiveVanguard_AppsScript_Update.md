# Live Vanguard Sheet Sync Update

The website code is ready to read **only aggregate Local Committee totals** from the registration endpoint. No delegate names, email addresses, contact details, or attachment links are returned.

## One-time update

1. Open the Apps Script project that powers the current registration endpoint.
2. Replace the project source with the updated contents of `LeadLeadRegistrationEndpoint.gs` in this project.
3. Choose **Deploy → Manage deployments**, edit the existing web-app deployment, select **New version**, and deploy it using the existing access settings.
4. Keep using the same `/exec` URL already connected to the website.
5. Send a message here once the deployment is complete. The endpoint will then return `?view=leaderboard` with only the current top-three LC totals.

When a registration row is removed from `Sheet1`, that delegate no longer contributes to the aggregate totals returned to the website. The Live Vanguard board refreshes every 30 seconds while visitors keep the homepage open and also refreshes when they return to that tab.
