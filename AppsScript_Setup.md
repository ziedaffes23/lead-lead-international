# Lead & Lead 2K26 — Google Apps Script Setup

This script receives registrations from the website and appends each registration as one row in the new **Lead & Lead 2K26 — Website Registrations** spreadsheet. It copies the uploaded profile photo, CV, and identity document into the configured Google Drive folder, applies **Anyone with the link — Viewer** access, and records the resulting Drive links in the corresponding sheet columns and registration receipt.

| Sheet column | Website payload key |
|---|---|
| Nationality | `nationality` (`Tounsi` only) |
| Track | `track` (`MMB` or `EB`) |
| Position | `position` (`Manager`, `Team Leader`, `LCVP`, or `LCP`) |
| Profile Photo URL | `photoUrl` |
| CV URL | `cvUrl` |

## Setup

Open the new registration workbook, then select **Extensions → Apps Script**. Replace the default code with the contents of `LeadLeadRegistrationEndpoint.gs` and save the project. The script is preconfigured for the supplied Drive folder ID `1W9D3eZ6p2X6Y4qaOO-JzDr1MJtwceCUR`. The Google account that deploys the script must have permission to add files to that folder.

Next, select **Deploy → New deployment**. Choose **Web app**, set **Execute as** to **Me**, and set **Who has access** to **Anyone**. Complete Google’s authorization prompts, then deploy the project. Copy the URL ending in **`/exec`**; do not use the development URL ending in **`/dev`**.

> The deployment must be able to run as the spreadsheet owner. The public website never receives Google credentials; it sends only a registration payload to the deployed endpoint.

## Connect the website

Send the `/exec` URL here. Add it as the protected `VITE_SHEETS_WEB_APP_URL` setting. The website first uploads the files to its temporary HTTPS storage proxy, then sends those links to the same-origin server bridge, which forwards the registration to Apps Script. This avoids browser cross-origin submission failures. Apps Script copies each file into the configured Drive folder, changes sharing to **Anyone with the link — Viewer**, writes the Drive URLs to the sheet, and returns them to the website for display in the registration receipt.

## Expected sheet header row

The script expects the following headers in **Sheet1**, in any order: `Timestamp`, `First name`, `Last name`, `CIN number`, `Phone country`, `Phone`, `Email`, `AIESEC email`, `Local committee`, `Nationality`, `Other nationality`, `Track`, `Position`, `Single room`, `Department`, `Price`, `Currency`, `Allergies`, `Note`, `Profile Photo URL`, `Profile Photo Name`, `CV URL`, `CV Name`, `Identity Document URL`, and `Identity Document Name`.

## Safety checks

The script rejects incomplete registrations, invalid email addresses, non-Tunisian nationality, invalid tracks or positions, and non-HTTPS attachment links. If Drive cannot be reached, a file cannot be downloaded, or the folder cannot be accessed, the registration is rejected instead of creating a sheet row without its documents. If a column is renamed or deleted, it returns an error instead of writing a misaligned row.

## References

[1]: https://developers.google.com/apps-script/guides/web "Google Apps Script: Web apps"
[2]: https://developers.google.com/apps-script/reference/content/content-service "Google Apps Script: Content Service"

