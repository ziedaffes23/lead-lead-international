# Render deployment notes

Source: https://dashboard.render.com/

The authenticated Render workspace is `My Workspace` for the user account. Existing services include `lead-lead-cinematic-intro` (deployed, Docker, Ohio) plus three failed Node services. The new Web Service form is open for the GitHub repository `ziedaffes23/lead-lead-international`, branch `main`, Docker runtime, and service name `lead-lead-international`.

The form offers a Free plan (`$0/month`, 0.1 CPU, 512 MB RAM) and the currently selected plan was initially `$7/month`; the Free plan is visible and should be selected. The repository has a Dockerfile that builds with `pnpm build`, exposes port 3000, and starts with `pnpm start`. Required app integration variable is `VITE_SHEETS_WEB_APP_URL`, set to the deployed Apps Script URL: https://script.google.com/macros/s/AKfycbwZW1FPbQhLJM8iUtPpR06mniCG_Bg96Gbv2M6K86OZ7SBNRoednxNh2zFyAUgn6v4-/exec. The project’s render.yaml also contains this endpoint and the free plan.

The environment variables in render.yaml include NODE_ENV=production, PORT=3000, VITE_APP_TITLE=Lead&Lead2K26, VITE_SHEETS_WEB_APP_URL, and several `sync: false` values for OAuth, JWT, Forge, and database settings. The web service form currently shows one blank environment-variable row and an `Add Environment Variable` button. The deployment button is `Deploy web service`.


The service was created successfully. Render service ID: `srv-da9lf7cs728c73e4kn3g`. Public URL: https://lead-lead-international.onrender.com. Render selected the Free plan and the deployment is currently building commit `919d4abc18fbe942e52f2f21f226b0f13a242f83` from `main`. The dashboard warns that the free instance spins down after inactivity and can delay requests by 50 seconds or more. Initial logs show the repository clone and Docker build starting successfully.


The deployment page remains in `building` status. Docker image setup and dependency installation completed; Render logs reached the `pnpm build` step successfully, with Vite production compilation in progress. No build error is visible so far.


The Docker image build completed successfully, including the Vite production build. Render is now in the `Deploying...` stage for the new free service; no build error is visible. The public service URL remains https://lead-lead-international.onrender.com.


At the latest check, Render still showed the deployment as `in progress` with the Docker image built and the deployment phase underway. The public URL is visible, but final service health has not yet been confirmed.


Render deployment completed successfully. The service is live on the Free plan and Render reports: `Your service is live`. Primary URL: https://lead-lead-international.onrender.com. The running container starts with `NODE_ENV=production node dist/index.js`.


Troubleshooting note: repeated requests to `/`, `/register`, and `/home` currently return `HTTP 404 Not Found` with `x-render-routing: no-server` from Render’s edge, not an Express-generated response. The Render dashboard shows the deployment as live, the container command `NODE_ENV=production node dist/index.js`, `Server running on http://localhost:10000/`, and no crash after startup. The logs also show an OAuth warning because `OAUTH_SERVER_URL` was not configured, but the server continues running. This points to the Render instance/routing state rather than the client route code.


Official Render documentation checked on 2026-08-29:

- https://render.com/docs/free states that Free Web Services spin down after 15 minutes without inbound traffic and take about one minute to spin back up. It also states that the 750 Free instance hours are shared per workspace and that exhausting them suspends Free Web Services until the next month.
- https://render.com/docs/web-services states that a Web Service must bind to `0.0.0.0` and the `PORT` environment variable; the default Render port is 10000. The deployed logs show the app binding to port 10000, so the port requirement is satisfied.
- https://render.com/docs/troubleshooting-deploys lists misconfigured routing, missing files, and misconfigured health checks as common causes of 404 or unavailable services.

Live diagnostics immediately before this note: Render dashboard showed the deployment as live and application logs showed `Server running on http://localhost:10000/`, but public requests returned an edge-level `404 Not Found` with `x-render-routing: no-server`. Local production tests from the same commit returned HTTP 200 for `/`, `/register`, `/home`, and `/mission`. This indicates the issue is with the Render service’s active routing/health state or Free-tier availability, not the Express client-route code.


After allowing the Free instance a full wake-up interval, both `https://lead-lead-international.onrender.com/` and `/register` returned HTTP 200 with the full 368,336-byte app HTML. The root page title was `Lead & Lead 2K26 — The Gathering`, and browser navigation reached the intro screen. The earlier `Not Found` response was the Render Free instance’s cold-start/no-server state, not a broken application route.
Final registration-submission diagnosis and fix:
- Cause: the new Render service lacked BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY, so document preparation failed before the Google Sheets write.
- User confirmed copying the storage configuration from the existing service.
- Added the two storage variables to lead-lead-international and triggered deployment dep-da9lq1ijnfac73e8757g.
- Render deployment reached live status at 10:29:16 PM.
- Safe live upload bridge check returned HTTP 200 and a generated storage URL for a tiny diagnostic PNG; no registration row was created.
- Secret values are intentionally not recorded here.
