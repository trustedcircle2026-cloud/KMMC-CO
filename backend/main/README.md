# KMMC Backend — Google Apps Script

This folder contains the Apps Script backend starter intended to be copied into the Google Apps Script editor.

## Files
- `Code.gs` — starter `doGet` / `doPost` web-app handlers, spreadsheet configuration, JSON responses, and a setup function.

## Spreadsheet
Configured spreadsheet ID: `1TCwQsyuJNWFwhgJVN98Qwn_xTEuS8Yq_y3_DthzK1Bc`

The starter only exposes health and header checks. It deliberately does **not** expose customer records or allow arbitrary writes until authentication and role-based authorization are implemented.

## Copy into Apps Script
1. Open the Apps Script project associated with your deployed web app.
2. Open or create `Code.gs`.
3. Copy the contents of `Code.gs` from this repository and paste it into the editor.
4. Save. Run `setupKmmcBackend` manually once and approve the requested spreadsheet permissions.
5. Test the web app using `?action=health`.
6. Deploy a new version of the web app after testing.

## Important
This is a starter scaffold, not the finished portal backend. Before storing real customer, employee, invoice, tax, or login data, implement secure identity verification, role-based access, input validation, audit logging, and appropriate deployment permissions. Never store plain-text passwords or trust a role value sent from the browser.
