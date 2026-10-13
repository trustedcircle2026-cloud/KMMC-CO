# KMMC ERP Backend — Google Apps Script

This folder establishes one website backend for three role-based portals: Admin, Employee and Client. Apps Script is the bridge between the website and the central Google Sheets database.

## Files
- Code.gs — API, password hashing, sessions, role checks, module setup, documents, invoices, collections and outstanding reports.
- API_CONTRACT.md — request examples.

## Configure Script Properties
In Apps Script, open **Project Settings → Script properties** and set:
- `KMMC_DATABASE_SPREADSHEET_ID`: ID of the central KMMC Database spreadsheet.
- `KMMC_ADMIN_USERNAME`: optional initial admin username (default `admin`).
- `KMMC_ADMIN_PASSWORD`: temporary strong password of at least 12 characters, used only for bootstrap.
- `KMMC_DOCUMENTS_FOLDER_ID`: optional ID of a restricted Google Drive folder for uploaded documents.

The previously shared spreadsheet ID is `1TCwQsyuJNWFwhgJVN98Qwn_xTEuS8Yq_y3_DthzK1Bc`. Use it for the database only if it is in fact your central KMMC Database. The Control Sheet and Database should remain separate if that is your established setup.

## One-time setup
1. Paste Code.gs into your Apps Script project and save.
2. Set Script Properties above.
3. Run `setupKmmcBackend()` and authorize spreadsheet access.
4. Run `setupKmmcAdminFromProperties()` once. It hashes the admin password into DB_USERS and deletes the temporary KMMC_ADMIN_PASSWORD property.
5. Add client and employee master records in DB_CLIENTS and DB_EMPLOYEES. Then use the Admin-only `createUser` API action to create logins linked to clientId/employeeId.
6. Create a private Drive folder and set its ID in KMMC_DOCUMENTS_FOLDER_ID for document upload.
7. Deploy as a Web App, then test `YOUR_WEB_APP_URL?action=health`.

## Modules
Users, clients, employees, tasks/work allocation, time logs, attendance, leave, documents, invoices, collections/receipts, expenses, messages, notifications, activity/login/error logs, and client outstanding summaries.

Outstanding is calculated as opening balance + non-cancelled invoices − non-cancelled collections.

## Security and deployment notes
- Do not put passwords or Script Properties in GitHub or browser JavaScript.
- The API hashes passwords with a per-user salt and a script secret, returns no password hash, and creates expiring server-side sessions.
- Test with dummy data before using real client, tax, payroll or financial data. Review all role/module rules before production.
- Apps Script web apps can have browser CORS/redirect constraints. If direct browser fetch is blocked, use a supported proxy/backend integration rather than weakening access controls.
- Document uploads require Drive permissions and are limited to small files in this starter.
- This is a backend foundation; the website frontend still needs to call these API actions and render the three portals.
