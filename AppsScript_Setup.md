# Lead & Lead 2K26 registration sheet setup

This Apps Script endpoint receives registrations from the website and appends each approved registration as one row to the supplied Google Sheet. It also copies the uploaded profile photo, CV, and passport document into the configured Google Drive folder, gives those files link-view access, and stores the resulting Drive URLs in the sheet.

## Registration contract

| Sheet column | Website payload key | Notes |
|---|---|---|
| Passport number | `passportNumber` | Required; letters, numbers, spaces, and symbols are accepted. |
| Phone country | `phoneCountry` | Country calling-code selection covering international destinations. |
| Phone | `phone` | Required text field with no numeric or length restriction. |
| Email | `email` | Any valid email address. |
| Track | `track` | `International AIESECer` or `EP`. |
| Position | `position` | Required for International AIESECers; `None` for EPs. |
| Department | `department` | Required for International AIESECers; `None` for EPs. |
| Country of origin | `countryOfOrigin` | Required for EPs; `None` for International AIESECers. |
| Single room | `singleRoom` | `Yes` or `No`. |
| Price | `price` | `90 EUR` shared room or `110 EUR` single room. |
| Currency | `currency` | Always `EUR`. |
| Profile Photo URL | `photoUrl` | HTTPS document URL. |
| CV URL | `cvUrl` | HTTPS document URL. |
| Identity Document URL | `identityUrl` | HTTPS passport-document URL. |

Both tracks are **€90 for three days**. Selecting a single room adds **€20**, making the total **€110**. International AIESECers see position and department fields. EPs see only country of origin in the participant-details section.

## Setup on the supplied spreadsheet

Open the supplied workbook and select **Extensions → Apps Script**. Replace the default code with the complete contents of `LeadLeadRegistrationEndpoint.gs`, then save the project. The script is already configured for spreadsheet ID `1xTZ4JuQxvNhRQRASC0kCwk2x2pvoxO2bVxnsK8f1SZ0`, the `Sheet1` tab, and Drive folder ID `1W9D3eZ6p2X6Y4qaOO-JzDr1MJtwceCUR`. The Google account that deploys the script must have edit access to the spreadsheet and permission to add files to that Drive folder.

Run the `setupSheet` function once from the Apps Script editor. Approve the requested Google permissions. This creates the header row automatically in the currently empty `Sheet1` tab and freezes the first row.

Next, select **Deploy → New deployment**, choose **Web app**, set **Execute as** to **Me**, and set **Who has access** to **Anyone**. Complete Google’s authorization prompts and deploy the project. Copy the URL ending in **`/exec`**; do not use the development URL ending in **`/dev`**.

> The endpoint must execute as the spreadsheet owner or another account with access to both the workbook and the configured Drive folder. The public website never receives Google credentials; it sends only the registration payload to the deployed endpoint.

## Connect the website

Set the deployed `/exec` URL as the protected `VITE_SHEETS_WEB_APP_URL` environment variable for the website server. The website first uploads the files to its HTTPS storage proxy, then the same-origin server bridge forwards the registration payload to Apps Script. Apps Script stores the files in Drive, writes the row to `Sheet1`, and returns a JSON confirmation.

## Header row created by `setupSheet`

The script creates these headers in `Sheet1`, in the following order:

`Timestamp`, `First name`, `Last name`, `Passport number`, `Phone country`, `Phone`, `Email`, `Track`, `Position`, `Department`, `Country of origin`, `Single room`, `Price`, `Currency`, `Allergies`, `Note`, `Profile Photo URL`, `Profile Photo Name`, `CV URL`, `CV Name`, `Identity Document URL`, `Identity Document Name`, `Indemnity Signature`, `Indemnity Accepted`.

The endpoint also recognizes a legacy `CIN number` header as an alias for `Passport number`, and an `AIESEC email` header as an alias for `Email`, so it can be used with an older sheet if necessary.

## Safety checks

The endpoint rejects incomplete registrations, invalid email addresses, unsupported participant types or positions, mismatched room prices, non-EUR currencies, invalid track-dependent field combinations, missing consent, and non-HTTPS attachment links. It does not impose a numeric or length format on passport numbers or phone values. If Drive cannot be reached or a document cannot be downloaded, the registration is rejected instead of creating a row without its required files.

## References

[1]: https://developers.google.com/apps-script/guides/web "Google Apps Script: Web apps"
[2]: https://developers.google.com/apps-script/reference/content/content-service "Google Apps Script: Content Service"
