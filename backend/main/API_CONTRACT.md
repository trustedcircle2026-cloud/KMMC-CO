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
