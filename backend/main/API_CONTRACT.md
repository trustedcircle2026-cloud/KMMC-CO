# KMMC ERP API contract

Send JSON POST requests to the deployed Apps Script /exec URL. Every authenticated action requires the `token` returned by login. Responses are `{ "ok": true, "data": ... }` or `{ "ok": false, "error": "..." }`.

## Login
```json
{ "action": "login", "username": "admin", "password": "your-password" }
```
Successful data contains `token`, `expiresAt`, and public `user`. Keep the token private and do not put it in a URL.

## Common requests
List clients:
```json
{ "action":"list", "token":"SESSION_TOKEN", "module":"clients", "limit":100, "offset":0 }
```
Create task:
```json
{ "action":"create", "token":"SESSION_TOKEN", "module":"tasks", "record":{"title":"Prepare GST return","clientId":"CLIENT_ID","employeeId":"EMPLOYEE_ID","priority":"HIGH","status":"OPEN","dueDate":"2026-10-20"} }
```
Create invoice:
```json
{ "action":"createInvoice", "token":"SESSION_TOKEN", "record":{"clientId":"CLIENT_ID","invoiceDate":"2026-10-13","dueDate":"2026-10-30","description":"Professional services","subtotal":10000,"taxAmount":1800,"discount":0} }
```
Record collection:
```json
{ "action":"recordCollection", "token":"SESSION_TOKEN", "record":{"clientId":"CLIENT_ID","invoiceId":"INVOICE_ID","amount":5000,"mode":"BANK_TRANSFER","referenceNo":"UTR_REFERENCE"} }
```
Outstanding:
```json
{ "action":"clientOutstanding", "token":"SESSION_TOKEN", "clientId":"CLIENT_ID" }
```

## Actions
- health, login, logout, validateSession, myProfile, changePassword
- dashboard, list, get, create, update, delete
- createUser, setUserStatus
- clockIn, clockOut, startTask, completeTask
- uploadDocument (base64 payload to a Drive folder configured in Script Properties)
- createInvoice, recordCollection, clientOutstanding, outstandingSummary

## Modules
users, clients, employees, tasks, time, attendance, leave, documents, invoices, collections, expenses, messages, notifications, activity, loginlog.

Admin has full management access. Employees are scoped to their linked employee ID and assigned clients/tasks. Clients are scoped to their linked client ID; they cannot create or edit invoices/collections. Test these rules with dummy records before using real data.


## Accountant API (v1.1 — Admin only)

New schema tabs: `DB_ACCOUNTS`, `DB_ACCOUNTING_RECEIPTS`, `DB_ACCOUNTING_PAYMENTS`, `DB_ACCOUNTING_LEDGER`, and `DB_REIMBURSEMENT_CLAIMS`. Existing `setupKmmcBackend()` creates these tabs and appends missing headers without clearing existing records.

Create chart-of-account records with the authenticated generic `create` action and `module: "accounts"`. Account codes must be unique. Use dedicated receipt/payment actions; generic create for those financial voucher modules is blocked.

Post receipt:
```json
{"action":"postReceipt","token":"SESSION_TOKEN","record":{"date":"2026-10-27","receivedFrom":"Example Client","category":"CLIENT_FEES","depositAccountId":"CASH_ACCOUNT_ID","counterAccountId":"FEES_INCOME_ACCOUNT_ID","amount":5000,"mode":"UPI","referenceNo":"UTR_REFERENCE","narration":"Professional fees","status":"POSTED"}}
```

Post payment:
```json
{"action":"postPayment","token":"SESSION_TOKEN","record":{"date":"2026-10-27","paidTo":"Office Supplier","category":"OFFICE_EXPENSE","paymentAccountId":"BANK_ACCOUNT_ID","counterAccountId":"OFFICE_EXPENSE_ACCOUNT_ID","amount":1500,"mode":"BANK_TRANSFER","referenceNo":"UTR_REFERENCE","narration":"Office supplies","status":"POSTED"}}
```

Run the date-range summary through `accountingReports`. Cancel a voucher using `cancelAccountingVoucher`, `voucherType` = `RECEIPT` or `PAYMENT`, and the voucher ID. Posted transactions are reversed rather than deleted.

**Scope note:** This is an accounting foundation with chart of accounts, receipt/payment vouchers, double-entry ledger rows, reversal cancellation, and a basic account-wise period summary. Reimbursement approval/payment workflow, petty cash controls, full Trial Balance/Profit & Loss/Balance Sheet, and bank reconciliation remain future work. Test with dummy transactions and reconcile before using for live accounting.


## Accountant workspace additions

- `accountingLedger` is an Admin-only action. Send `accountId`, `fromDate`, and `toDate` in `YYYY-MM-DD` format to retrieve opening balance, posted ledger lines, debit/credit totals, and running balance.
- `postReceipt` and `postPayment` accept optional `attachmentUrl` and `attachmentDriveFileId` fields. Attachments are uploaded to the configured Google Drive folder using `uploadDocument` before the voucher is posted.
- Run `setupKmmcBackend()` after deploying the updated Apps Script code to extend existing receipt/payment sheet headers without deleting existing records.


## Unified vouchers API (v1.2)

The admin Accountant menu now uses a single **Vouchers** workspace for Receipt, Payment, Contra, Journal, Sales, Purchase, Credit Note, and Debit Note entries. The single-page voucher form accepts debit and credit account IDs, amount, date, party/particulars, payment mode, reference, narration, and optional Drive attachment metadata.

Post a voucher:
```json
{
  "action": "postVoucher",
  "token": "SESSION_TOKEN",
  "record": {
    "voucherType": "JOURNAL",
    "date": "2026-10-27",
    "party": "Month-end adjustment",
    "debitAccountId": "DEBIT_ACCOUNT_ID",
    "creditAccountId": "CREDIT_ACCOUNT_ID",
    "amount": 2500,
    "mode": "OTHER",
    "referenceNo": "",
    "narration": "Adjustment entry",
    "status": "POSTED"
  }
}
```

The first run of `setupKmmcBackend()` after updating the Apps Script adds the `DB_ACCOUNTING_VOUCHERS` tab without clearing existing records. The new report selector includes Ledger, Invoices, Collections, Expenses, Payables, Receipts, Payments, Vouchers, and Chart of Accounts. Validate voucher mappings and opening balances using test entries before using this for live accounting.
