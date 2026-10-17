/**
 * KMMC ERP Apps Script API — Admin / Employee / Client
 * Required Script Properties:
 * KMMC_DATABASE_SPREADSHEET_ID, KMMC_ADMIN_PASSWORD (bootstrap only),
 * optional KMMC_ADMIN_USERNAME, KMMC_DOCUMENTS_FOLDER_ID, KMMC_EMPLOYEE_FOLDER_ID.
 * Run setupKmmcBackend(), then setupKmmcAdminFromProperties().
 */
const KMMC = {
  VERSION:'1.0.0', DB_PROP:'KMMC_DATABASE_SPREADSHEET_ID', SECRET_PROP:'KMMC_SESSION_SECRET',
  SESSION_HOURS:12, MAX_PAGE:200,
  M:{
    users:{s:'DB_USERS',h:['id','username','passwordHash','salt','role','name','email','phone','clientId','employeeId','status','mustChangePassword','createdAt','updatedAt','lastLoginAt'],r:['ADMIN']},
    clients:{s:'DB_CLIENTS',h:['id','clientCode','name','pan','email','phone','gstin','address','city','state','pincode','majorHeads','otherWork','referenceName','assignedEmployeeId','openingBalance','status','portalUsername','notes','driveFolderId','driveFolderUrl','createdAt','updatedAt'],r:['ADMIN','EMPLOYEE']},
    employees:{s:'DB_EMPLOYEES',h:['id','employeeCode','name','email','phone','alternatePhone','dob','gender','maritalStatus','bloodGroup','address','city','state','pincode','emergencyContactName','emergencyContactPhone','education','department','designation','joiningDate','employmentType','reportingTo','pan','aadhaarLast4','bankName','bankAccountLast4','ifsc','salary','resumeFileId','resumeUrl','status','notes','createdAt','updatedAt'],r:['ADMIN']},


    tasks:{s:'DB_TASKS',h:['id','jobNumber','title','description','clientId','employeeId','priority','status','startDate','dueDate','completedAt','createdBy','createdAt','updatedAt'],r:['ADMIN','EMPLOYEE','CLIENT']},
    time:{s:'DB_TIME_LOGS',h:['id','employeeId','taskId','clientId','workDate','entryType','jobNumber','startTime','endTime','minutes','seconds','description','calls','createdAt','updatedAt'],r:['ADMIN','EMPLOYEE']},
    workdone:{s:'DB_WORKDONE',h:['id','employeeId','workDate','jobNumber','taskId','clientId','summary','minutes','createdAt','updatedAt'],r:['ADMIN','EMPLOYEE']},
    attendance:{s:'DB_ATTENDANCE',h:['id','employeeId','workDate','checkIn','checkOut','minutes','status','note','createdAt','updatedAt'],r:['ADMIN','EMPLOYEE']},
    leave:{s:'DB_LEAVE',h:['id','employeeId','fromDate','toDate','leaveType','reason','status','approvedBy','createdAt','updatedAt'],r:['ADMIN','EMPLOYEE']},
    documents:{s:'DB_DOCUMENTS',h:['id','clientId','employeeId','taskId','invoiceId','name','mimeType','driveFileId','driveUrl','downloadUrl','folderUrl','pan','majorHead','year','month','category','visibility','uploadedBy','createdAt'],r:['ADMIN','EMPLOYEE','CLIENT']},
    invoices:{s:'DB_INVOICES',h:['id','invoiceNo','clientId','invoiceDate','dueDate','description','subtotal','taxAmount','discount','totalAmount','status','createdBy','createdAt','updatedAt'],r:['ADMIN','EMPLOYEE','CLIENT']},
    collections:{s:'DB_COLLECTIONS',h:['id','receiptNo','clientId','invoiceId','collectionDate','amount','mode','referenceNo','screenshotUrl','screenshotDriveFileId','notes','receivedBy','status','createdAt'],r:['ADMIN','EMPLOYEE','CLIENT']},
    expenses:{s:'DB_EXPENSES',h:['id','expenseDate','category','description','amount','paidTo','paymentMode','referenceNo','employeeId','status','createdBy','createdAt','updatedAt'],r:['ADMIN','EMPLOYEE']},
    messages:{s:'DB_MESSAGES',h:['id','fromUserId','toUserId','clientId','subject','message','status','createdAt','readAt'],r:['ADMIN','EMPLOYEE','CLIENT']},
    notifications:{s:'DB_NOTIFICATIONS',h:['id','userId','title','message','type','relatedId','readAt','createdAt'],r:['ADMIN','EMPLOYEE','CLIENT']},
    activity:{s:'DB_ACTIVITY_LOG',h:['id','userId','username','role','action','module','recordId','details','createdAt'],r:['ADMIN'],ro:true},
    loginlog:{s:'DB_LOGIN_LOG',h:['id','userId','username','result','createdAt'],r:['ADMIN'],ro:true}
  }
};

function doGet(e){
  const a=(e&&e.parameter&&e.parameter.action)||'health';
  return out_({ok:true,app:'KMMC ERP API',version:KMMC.VERSION,setup:configured_(),action:a});
}
function doPost(e){
  try {
    const q=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');
    return out_({ok:true,data:route_(q.action,q)});
  } catch(err) {
    logError_(err);
    return out_({ok:false,error:String(err&&err.message||'Request failed')});
  }
}
function route_(a,q){
  switch(String(a||'')){
    case 'health':return {app:'KMMC ERP API',version:KMMC.VERSION,setup:configured_()};
    case 'login':return login_(q);
    case 'logout':return logout_(q);
    case 'validateSession':case 'myProfile':return {user:pubUser_(auth_(q))};
    case 'changePassword':return changePassword_(auth_(q),q);
    case 'dashboard':return dashboard_(auth_(q));
    case 'list':return list_(auth_(q),q);
    case 'get':return get_(auth_(q),q);
    case 'create':return create_(auth_(q),q);
    case 'update':return update_(auth_(q),q);
    case 'delete':return delete_(auth_(q),q);
    case 'createUser':return createUser_(auth_(q),q);
    case 'createClient':return createClient_(auth_(q),q);
    case 'quickCreateClient':return quickCreateClient_(auth_(q),q);
    case 'updateClient':return updateClient_(auth_(q),q);
    case 'deleteClient':return deleteClient_(auth_(q),q);
    case 'bulkImportClients':return bulkImportClients_(auth_(q),q);
    case 'bulkImportEmployees':return bulkImportEmployees_(auth_(q),q);
    case 'createEmployee':return createEmployee_(auth_(q),q);
    case 'updateEmployee':return updateEmployee_(auth_(q),q);
    case 'deleteEmployee':return deleteEmployee_(auth_(q),q);
    case 'setUserStatus':return setUserStatus_(auth_(q),q);
    case 'clockIn':return clockIn_(auth_(q));
    case 'clockOut':return clockOut_(auth_(q));
    case 'timerStatus':return timerStatus_(auth_(q));
    case 'startTaskTimer':return startTaskTimer_(auth_(q),q);
    case 'taskTransition':return taskTransition_(auth_(q),q);
    case 'driveList':return driveList_(auth_(q),q);
    case 'driveRead':return driveRead_(auth_(q),q);
    case 'driveCreate':return driveCreate_(auth_(q),q);
    case 'driveUpload':return driveUpload_(auth_(q),q);
    case 'driveSave':return driveSave_(auth_(q),q);
    case 'driveRename':return driveRename_(auth_(q),q);
    case 'driveDelete':return driveDelete_(auth_(q),q);
    case 'startBreak':return startBreak_(auth_(q));
    case 'stopBreak':return stopBreak_(auth_(q));
    case 'setTaskStatus':return setTaskStatus_(auth_(q),q);
    case 'startTask':return taskStatus_(auth_(q),q,'IN_PROGRESS');
    case 'completeTask':return taskStatus_(auth_(q),q,'COMPLETED');
    case 'uploadDocument':return uploadDoc_(auth_(q),q);
    case 'chatContacts':return chatContacts_(auth_(q));
    case 'getMessages':return getMessages_(auth_(q),q);
    case 'sendMessage':return sendMessage_(auth_(q),q);
    case 'markMessagesRead':return markMessagesRead_(auth_(q),q);
    case 'setLeaveStatus':return setLeaveStatus_(auth_(q),q);
    case 'createInvoice':return createInvoice_(auth_(q),q);
    case 'recordCollection':return recordCollection_(auth_(q),q);
    case 'clientOutstanding':return outstanding_(auth_(q),q);
    case 'outstandingSummary':return outstandingSummary_(auth_(q));
    default:throw Error('Unknown action: '+a);
  }
}

/** Run once after setting KMMC_DATABASE_SPREADSHEET_ID in Script Properties. */
function setupKmmcBackend(){
  const ss=db_();
  Object.keys(KMMC.M).forEach(k=>{
    const d=KMMC.M[k]; let sh=ss.getSheetByName(d.s)||ss.insertSheet(d.s);
    if(!sh.getLastRow())sh.appendRow(d.h); else ensureHeaders_(sh,d.h); sh.setFrozenRows(1);
  });
  [['DB_SESSIONS',['id','userId','tokenHash','expiresAt','createdAt','revokedAt']],
   ['DB_SYSTEM_CONFIG',['key','value','updatedAt']],
   ['DB_ERROR_LOG',['id','action','message','createdAt']]].forEach(x=>{
    let sh=ss.getSheetByName(x[0])||ss.insertSheet(x[0]);if(!sh.getLastRow())sh.appendRow(x[1]);sh.setFrozenRows(1);
  });
  const p=PropertiesService.getScriptProperties();
  if(p.getProperty('KMMC_DOCUMENTS_FOLDER_ID'))ensureClientDocumentationRoot_();
  installAutoClockOutTrigger_();
  if(!p.getProperty(KMMC.SECRET_PROP))p.setProperty(KMMC.SECRET_PROP,Utilities.getUuid()+Utilities.getUuid());
  return 'Database tabs initialized. Next run setupKmmcAdminFromProperties().';
}
/** Set KMMC_ADMIN_PASSWORD (12+ chars) and optional KMMC_ADMIN_USERNAME in Script Properties, then run once. */
function setupKmmcAdminFromProperties(){
  if(!configured_())throw Error('Run setupKmmcBackend() first.');
  const p=PropertiesService.getScriptProperties(), pass=p.getProperty('KMMC_ADMIN_PASSWORD');
  if(pass===null||pass===undefined||pass==='')throw Error('Set a non-empty KMMC_ADMIN_PASSWORD in Script Properties.');
  const username=(p.getProperty('KMMC_ADMIN_USERNAME')||'admin').trim().toLowerCase();
  const old=rows_('users').find(u=>String(u.username).toLowerCase()===username), salt=Utilities.getUuid(), now=iso_();
  const u={id:old?old.id:uid_(),username:username,passwordHash:hash_(pass,salt),salt:salt,role:'ADMIN',name:'KMMC Administrator',email:'',phone:'',clientId:'',employeeId:'',status:'ACTIVE',createdAt:old?old.createdAt:now,updatedAt:now,lastLoginAt:''};
  old?write_('users',u.id,u):append_('users',u);
  p.deleteProperty('KMMC_ADMIN_PASSWORD');
  return 'Admin bootstrapped. Temporary password property deleted. Keep the password securely.';
}
function login_(q){
  const pass=String(q.password||''), requestedRole=String(q.role||'').trim().toUpperCase();
  let name=String(q.username||'').trim().toLowerCase(), u=null;
  if(!pass)throw Error('Password required.');
  if(requestedRole==='ADMIN'){
    // Admin login requires only the password. It still validates the stored salted hash.
    const configuredName=String(PropertiesService.getScriptProperties().getProperty('KMMC_ADMIN_USERNAME')||'').trim().toLowerCase();
    const admins=rows_('users').filter(x=>String(x.role).toUpperCase()==='ADMIN'&&x.status==='ACTIVE');
    u=(configuredName?admins.find(x=>String(x.username).toLowerCase()===configuredName):null)||admins[0]||null;
    name=u?String(u.username).toLowerCase():'admin';
  }else{
    if(!name)throw Error('Username required.');
    u=rows_('users').find(x=>String(x.username).toLowerCase()===name);
    if(u&&requestedRole&&String(u.role).toUpperCase()!==requestedRole)u=null;
  }
  if(!u||u.status!=='ACTIVE'||hash_(pass,String(u.salt))!==String(u.passwordHash)){loginLog_(u&&u.id||'',name,'FAILED');throw Error('Invalid username or password.');}
  const token=uid_()+'.'+uid_(), th=sha_(token), now=new Date(), exp=new Date(now.getTime()+KMMC.SESSION_HOURS*3600000);
  rawAppend_('DB_SESSIONS',{id:uid_(),userId:u.id,tokenHash:th,expiresAt:exp.toISOString(),createdAt:now.toISOString(),revokedAt:''});
  CacheService.getScriptCache().put('s_'+th,JSON.stringify({userId:u.id,expiresAt:exp.toISOString()}),KMMC.SESSION_HOURS*3600);
  u.lastLoginAt=iso_();u.updatedAt=iso_();write_('users',u.id,u);loginLog_(u.id,name,'SUCCESS');activity_(u,'LOGIN','auth',u.id,'');
  return {token:token,expiresAt:exp.toISOString(),user:pubUser_(u),mustChangePassword:u.mustChangePassword===true||String(u.mustChangePassword).toUpperCase()==='TRUE'};
}
function auth_(q){
  const t=String(q.token||q.sessionToken||'');if(!t)throw Error('Login required.');
  const h=sha_(t);let s=CacheService.getScriptCache().get('s_'+h);
  s=s?JSON.parse(s):rawRows_('DB_SESSIONS').find(x=>x.tokenHash===h&&!x.revokedAt);
  if(!s||new Date(s.expiresAt).getTime()<=Date.now())throw Error('Session expired. Please log in again.');
  const u=rows_('users').find(x=>x.id===s.userId);
  if(!u||u.status!=='ACTIVE')throw Error('Account inactive.');
  return u;
}
function logout_(q){
  const u=auth_(q),h=sha_(String(q.token||q.sessionToken));
  rawRows_('DB_SESSIONS').filter(s=>s.tokenHash===h&&!s.revokedAt).forEach(s=>rawWrite_('DB_SESSIONS',s.id,Object.assign({},s,{revokedAt:iso_()})));
  CacheService.getScriptCache().remove('s_'+h);activity_(u,'LOGOUT','auth',u.id,'');return {loggedOut:true};
}
function changePassword_(u,q){
  if(String(q.newPassword||'').length<1)throw Error('New password is required.');
  if(!u.mustChangePassword&&hash_(String(q.currentPassword||''),u.salt)!==u.passwordHash)throw Error('Current password incorrect.');
  u.salt=uid_();u.passwordHash=hash_(q.newPassword,u.salt);u.mustChangePassword=false;u.updatedAt=iso_();write_('users',u.id,u);activity_(u,'CHANGE_PASSWORD','auth',u.id,'');return {changed:true};
}
function createUser_(admin,q){
  needAdmin_(admin);const x=q.record||{},username=String(x.username||'').trim().toLowerCase(),pass=String(x.password||''),role=String(x.role||'').toUpperCase();
  if(!/^[a-z0-9._-]{3,60}$/.test(username))throw Error('Username must be 3–60 letters/numbers/dot/underscore/hyphen.');
  if(!pass)throw Error('Initial password is required.');
  if(['ADMIN','EMPLOYEE','CLIENT'].indexOf(role)<0)throw Error('Role must be ADMIN, EMPLOYEE or CLIENT.');
  if(rows_('users').some(u=>String(u.username).toLowerCase()===username))throw Error('Username already exists.');
  if(role==='CLIENT'&&!x.clientId)throw Error('Client login requires clientId.');
  if(role==='EMPLOYEE'&&!x.employeeId)throw Error('Employee login requires employeeId.');
  const salt=uid_(),now=iso_(),u={id:uid_(),username,passwordHash:hash_(pass,salt),salt,role,name:String(x.name||username),email:String(x.email||''),phone:String(x.phone||''),clientId:String(x.clientId||''),employeeId:String(x.employeeId||''),status:'ACTIVE',mustChangePassword:x.mustChangePassword===false?false:true,createdAt:now,updatedAt:now,lastLoginAt:''};
  append_('users',u);activity_(admin,'CREATE_USER','users',u.id,role);return pubUser_(u);
}
function setUserStatus_(admin,q){
  needAdmin_(admin);const u=rows_('users').find(x=>x.id===String(q.id));if(!u)throw Error('User not found.');
  const st=String(q.status||'').toUpperCase();if(['ACTIVE','INACTIVE','LOCKED'].indexOf(st)<0)throw Error('Invalid status.');
  if(u.id===admin.id&&st!=='ACTIVE')throw Error('Cannot deactivate own account.');
  u.status=st;u.updatedAt=iso_();write_('users',u.id,u);return pubUser_(u);
}
function dashboard_(u){
  const role=u.role, keys=role==='ADMIN'?Object.keys(KMMC.M):role==='CLIENT'?['tasks','documents','invoices','collections','messages','notifications']:['clients','tasks','time','workdone','attendance','leave','documents','invoices','collections','expenses','messages','notifications'];
  const counts={};keys.forEach(k=>counts[k]=rows_(k).filter(r=>visible_(u,k,r)).length);
  return {user:pubUser_(u),counts,outstanding:outstandingSummary_(u)};
}
function list_(u,q){
  const k=module_(q.module);authorize_(u,k,'read');let a=rows_(k).filter(r=>visible_(u,k,r));
  if(q.filter&&typeof q.filter==='object')Object.keys(q.filter).forEach(f=>{a=a.filter(r=>String(r[f]??'')===String(q.filter[f]));});
  const limit=Math.min(Math.max(Number(q.limit||100),1),KMMC.MAX_PAGE),offset=Math.max(Number(q.offset||0),0);
  const clients= (k==='tasks'||k==='time'||k==='workdone'||k==='documents')?rows_('clients'):[];const records=a.slice(offset,offset+limit).map(r=>{const out=publicRec_(k,r);if(['tasks','time','workdone','documents'].includes(k)){const c=clients.find(x=>String(x.id)===String(r.clientId));if(c){out.clientCode=String(c.clientCode||'');out.clientName=String(c.name||'');}}return out;});return {records,total:a.length,limit,offset};
}
function get_(u,q){const k=module_(q.module);authorize_(u,k,'read');const r=rows_(k).find(x=>x.id===String(q.id));if(!r||!visible_(u,k,r))throw Error('Record not found/access denied.');return publicRec_(k,r);}
function create_(u,q){
  const k=module_(q.module);authorize_(u,k,'create');if(k==='users')throw Error('Use createUser.');if(k==='documents')throw Error('Use uploadDocument to securely store files in Drive.');if(k==='messages'){if(u.role==='CLIENT')return createClientMessage_(u,q);throw Error('Use sendMessage to create a chat message.');}
  const r=sanitize_(k,q.record||{});ownership_(u,k,r,false);const now=iso_();r.id=uid_();r.createdAt=now;if(KMMC.M[k].h.includes('updatedAt'))r.updatedAt=now;
  if(k==='tasks'){if(u.role==='EMPLOYEE'){const clientId=String(r.clientId||'');if(!clientId)throw Error('Select a client for this assignment.');const client=rows_('clients').find(c=>String(c.id)===clientId&&(!c.assignedEmployeeId||String(c.assignedEmployeeId)===String(u.employeeId)));if(!client)throw Error('Selected client is not assigned or accessible to you.');r.employeeId=u.employeeId;r.createdBy=u.id;}if(!r.jobNumber)r.jobNumber='KMMC-JOB-'+Utilities.formatDate(new Date(),'Asia/Kolkata','yyyyMMdd')+'-'+r.id.slice(0,6).toUpperCase();if(!r.status)r.status='OPEN';if(!r.priority)r.priority='NORMAL';if(!r.startDate)r.startDate=localDay_(new Date());}if(k==='leave'&&u.role==='EMPLOYEE'){r.status='PENDING';r.approvedBy='';}if(k==='invoices')invoiceMath_(r);if(k==='collections')collectionMath_(r);
  append_(k,r);activity_(u,'CREATE',k,r.id,'');return publicRec_(k,r);
}
function update_(u,q){
  const k=module_(q.module);authorize_(u,k,'update');if(k==='time')ensureHeaders_(sheet_(KMMC.M.time.s),KMMC.M.time.h);if(['users','activity','loginlog'].includes(k))throw Error('Use a dedicated action; editing disabled.');
  const old=rows_(k).find(x=>x.id===String(q.id));if(!old||!visible_(u,k,old))throw Error('Record not found/access denied.');
  const patch=sanitize_(k,q.record||{});ownership_(u,k,patch,true);const r=Object.assign({},old,patch,{id:old.id,createdAt:old.createdAt,updatedAt:iso_()});
  if(k==='invoices')invoiceMath_(r);write_(k,r.id,r);activity_(u,'UPDATE',k,r.id,'');return publicRec_(k,r);
}
function delete_(u,q){
  const k=module_(q.module);authorize_(u,k,'delete');if(['users','activity','loginlog','invoices','collections','expenses','documents'].includes(k))throw Error('Deletion disabled for audit/financial records.');
  const r=rows_(k).find(x=>x.id===String(q.id));if(!r||!visible_(u,k,r))throw Error('Record not found/access denied.');
  const sh=sheet_(KMMC.M[k].s),row=findRow_(sh,r.id);if(row>1)sh.deleteRow(row);activity_(u,'DELETE',k,r.id,'');return {deleted:true,id:r.id};
}
function authorize_(u,k,op){
  const d=KMMC.M[k],role=u.role;if(!d)throw Error('Unknown module.');
  if(!d.r.includes(role))throw Error('Role cannot access '+k+'.');
  if(d.ro&&op!=='read')throw Error('Read-only module.');
  if(role==='CLIENT'&&['update','delete'].includes(op))throw Error('Client edits are not allowed.');
  if(role==='CLIENT'&&['create'].includes(op)&&!['messages','documents'].includes(k))throw Error('Client cannot create this record.');
  if(role==='EMPLOYEE'&&k==='clients'&&op!=='read')throw Error('Only Admin can change client master.');
}
function visible_(u,k,r){
  if(u.role==='ADMIN')return true;
  if(u.role==='CLIENT'){
    if(k==='clients')return String(r.id)===String(u.clientId);
    if(k==='users')return String(r.id)===String(u.id);
    if(r.clientId!=null)return String(r.clientId)===String(u.clientId);
    return false;
  }
  if(k==='users')return String(r.id)===String(u.id);
  if(k==='employees')return false;
  if(k==='messages')return String(r.fromUserId)===String(u.id)||String(r.toUserId)===String(u.id);
  if(k==='notifications')return String(r.userId)===String(u.id);
  if(k==='clients')return !r.assignedEmployeeId||String(r.assignedEmployeeId)===String(u.employeeId);
  if(k==='tasks'||k==='time'||k==='workdone'||k==='attendance'||k==='leave')return String(r.employeeId)===String(u.employeeId);
  if(['invoices','collections','documents'].includes(k)){
    const c=rows_('clients').find(x=>x.id===r.clientId);if(!c)return false;if(k==='documents')return !!c.assignedEmployeeId&&String(c.assignedEmployeeId)===String(u.employeeId);return !c.assignedEmployeeId||String(c.assignedEmployeeId)===String(u.employeeId);
  }
  return true;
}
function ownership_(u,k,r,isUpdate){
  if(u.role==='ADMIN')return;
  if(u.role==='CLIENT'){
    if(r.clientId&&String(r.clientId)!==String(u.clientId))throw Error('Cannot access another client.');
    if(['messages','documents'].includes(k))r.clientId=u.clientId;
  }
  if(u.role==='EMPLOYEE'){
    if(['time','attendance','leave','workdone'].includes(k)){if(r.employeeId&&String(r.employeeId)!==String(u.employeeId))throw Error('Cannot edit another employee.');r.employeeId=u.employeeId;}
    if(k==='tasks'){if(r.employeeId&&String(r.employeeId)!==String(u.employeeId))throw Error('Cannot assign another employee.');if(!isUpdate)r.employeeId=u.employeeId;}
  }
}
function localDay_(d){return Utilities.formatDate(d||new Date(),'Asia/Kolkata','yyyy-MM-dd');}
function dateKey_(value){if(value instanceof Date)return Utilities.formatDate(value,'Asia/Kolkata','yyyy-MM-dd');const s=String(value==null?'':value).trim();if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;const d=new Date(s);return Number.isNaN(d.getTime())?s.slice(0,10):Utilities.formatDate(d,'Asia/Kolkata','yyyy-MM-dd');}
function localClock_(d){return Utilities.formatDate(d||new Date(),'Asia/Kolkata','HH:mm:ss');}
function localIso_(d){return Utilities.formatDate(d||new Date(),'Asia/Kolkata',"yyyy-MM-dd'T'HH:mm:ssXXX");}
function ninePm_(day){return new Date(day+'T15:30:00.000Z');}
function secondsBetween_(a,b){const x=Date.parse(a),y=Date.parse(b);return Number.isFinite(x)&&Number.isFinite(y)?Math.max(0,Math.floor((y-x)/1000)):0;}
function openTimerSegments_(eid,day){const key=dateKey_(day);return rows_('time').filter(x=>String(x.employeeId)===String(eid)&&dateKey_(x.workDate)===key&&!x.endTime&&['WORK','BREAK'].includes(String(x.entryType).toUpperCase())).sort((a,b)=>String(b.startTime).localeCompare(String(a.startTime)));}
 function openTimerSegment_(eid,day){return openTimerSegments_(eid,day)[0]||null;}
 function enforceSingleOpenTimer_(u,day,now){const open=openTimerSegments_(u.employeeId,day);if(open.length>1){open.slice(1).forEach(r=>closeTimerSegment_(r,now,false));}return open[0]||null;}
function addTimerSegment_(u,type,now,previous){const taskId=String(previous&&(previous.taskId||previous.id)||''),task=taskId?rows_('tasks').find(x=>String(x.id)===taskId):null;const r={id:uid_(),employeeId:u.employeeId,taskId:taskId,clientId:String(previous&&previous.clientId||''),workDate:localDay_(now),entryType:type,jobNumber:String(previous&&previous.jobNumber||''),startTime:localIso_(now),endTime:'',minutes:0,seconds:0,description:type==='BREAK'?'Break timer':task?(task.title||task.description||'Assigned work'):'Unallotted Work',createdAt:iso_(),updatedAt:iso_()};append_('time',r);return r;}
function closeTimerSegment_(r,now,recordWorkdone=true){if(!r||r.endTime)return r;const end=localIso_(now),sec=secondsBetween_(r.startTime,end);r.endTime=end;r.seconds=sec;r.minutes=Math.round(sec/60);r.updatedAt=iso_();write_('time',r.id,r);if(recordWorkdone&&String(r.entryType||'').toUpperCase()==='WORK'){const task=rows_('tasks').find(x=>String(x.id)===String(r.taskId||''));const summary=task?(task.title||task.description||'Assigned work'):'Unallotted Work';append_('workdone',{id:uid_(),employeeId:r.employeeId,workDate:dateKey_(r.workDate),jobNumber:r.jobNumber||'',taskId:r.taskId||'',clientId:r.clientId||'',summary:summary,minutes:Math.max(0,Math.round(sec/60)),createdAt:iso_(),updatedAt:iso_()});}return r;}
function addTimerEvent_(u,type,now,previous){const r={id:uid_(),employeeId:u.employeeId,taskId:String(previous&&previous.taskId||''),clientId:String(previous&&previous.clientId||''),workDate:localDay_(now),entryType:type,jobNumber:String(previous&&previous.jobNumber||''),startTime:localIso_(now),endTime:localIso_(now),minutes:0,seconds:0,description:type.replaceAll('_',' ').toLowerCase(),createdAt:iso_(),updatedAt:iso_()};append_('time',r);return r;}
function closeAttendance_(att,now,auto){const day=dateKey_(att.workDate),open=openTimerSegments_(att.employeeId,day);if(open.length)closeTimerSegment_(open[0],now,true);open.slice(1).forEach(r=>closeTimerSegment_(r,now,false));const last=rows_('time').filter(x=>String(x.employeeId)===String(att.employeeId)&&dateKey_(x.workDate)===day&&['WORK','BREAK'].includes(String(x.entryType).toUpperCase())).sort((a,b)=>String(b.startTime).localeCompare(String(a.startTime)))[0]||null;addTimerEvent_({employeeId:att.employeeId},'CLOCK_OUT',now,last);att.checkOut=localIso_(now);att.minutes=Math.round(secondsBetween_(att.checkIn,att.checkOut)/60);att.status=auto?'AUTO_CLOCK_OUT':'PRESENT';att.note=auto?'Automatically clocked out at 9:00 PM IST':'';att.updatedAt=iso_();write_('attendance',att.id,att);}
function reconcileAttendance_(eid,now){const day=localDay_(now);rows_('attendance').filter(x=>String(x.employeeId)===String(eid)&&!x.checkOut).forEach(att=>{const attDay=dateKey_(att.workDate);if(attDay<day)closeAttendance_(att,ninePm_(attDay),true);else if(attDay===day&&localClock_(now)>='21:00:00')closeAttendance_(att,ninePm_(day),true);});}
function clockIn_(u){if(!['ADMIN','EMPLOYEE'].includes(u.role)||!u.employeeId)throw Error('Employee access required.');const lock=LockService.getScriptLock();lock.waitLock(10000);try{const now=new Date(),day=localDay_(now);if(localClock_(now)>='21:00:00')throw Error('Clock-in is closed after 9:00 PM IST.');reconcileAttendance_(u.employeeId,now);if(rows_('attendance').some(x=>String(x.employeeId)===String(u.employeeId)&&dateKey_(x.workDate)===day&&!x.checkOut))throw Error('Already clocked in.');const stale=openTimerSegments_(u.employeeId,day);if(stale.length)closeTimerSegment_(stale[0],now,true);stale.slice(1).forEach(x=>closeTimerSegment_(x,now,false));const r={id:uid_(),employeeId:u.employeeId,workDate:day,checkIn:localIso_(now),checkOut:'',minutes:0,status:'PRESENT',note:'',createdAt:iso_(),updatedAt:iso_()};append_('attendance',r);addTimerEvent_(u,'CLOCK_IN',now,null);addTimerSegment_(u,'WORK',now,null);activity_(u,'CLOCK_IN','attendance',r.id,r.checkIn);return r;}finally{lock.releaseLock();}}
function clockOut_(u){if(!['ADMIN','EMPLOYEE'].includes(u.role)||!u.employeeId)throw Error('Employee access required.');const lock=LockService.getScriptLock();lock.waitLock(10000);try{const now=new Date();reconcileAttendance_(u.employeeId,now);const att=rows_('attendance').filter(x=>String(x.employeeId)===String(u.employeeId)&&!x.checkOut).sort((a,b)=>String(b.checkIn).localeCompare(String(a.checkIn)))[0];if(!att)throw Error('No open clock-in record.');closeAttendance_(att,now,false);activity_(u,'CLOCK_OUT','attendance',att.id,att.checkOut);return att;}finally{lock.releaseLock();}}
function timerStatus_(u){if(!['ADMIN','EMPLOYEE'].includes(u.role)||!u.employeeId)throw Error('Employee access required.');const now=new Date(),day=localDay_(now);reconcileAttendance_(u.employeeId,now);const att=rows_('attendance').filter(x=>String(x.employeeId)===String(u.employeeId)&&dateKey_(x.workDate)===day&&!x.checkOut).sort((a,b)=>String(b.checkIn).localeCompare(String(a.checkIn)))[0]||null;let active=att?openTimerSegment_(u.employeeId,day):null;if(att){active=enforceSingleOpenTimer_(u,day,now);if(!active)active=addTimerSegment_(u,'WORK',now,null);}const logs=rows_('time').filter(x=>String(x.employeeId)===String(u.employeeId)&&dateKey_(x.workDate)===day);let workSeconds=0,breakSeconds=0;logs.forEach(x=>{const typ=String(x.entryType).toUpperCase();if(!['WORK','BREAK'].includes(typ))return;if(!x.endTime)return;const sec=Number(x.seconds)||secondsBetween_(x.startTime,x.endTime);if(typ==='WORK')workSeconds+=sec;else breakSeconds+=sec;});return {workDate:day,attendance:att,activeSegment:active,mode:active?String(active.entryType).toUpperCase():'OFF',workSeconds,breakSeconds,activeSeconds:active?secondsBetween_(active.startTime,localIso_(now)):0};}
function startBreak_(u){if(!['ADMIN','EMPLOYEE'].includes(u.role)||!u.employeeId)throw Error('Employee access required.');const now=new Date(),day=localDay_(now);reconcileAttendance_(u.employeeId,now);if(!rows_('attendance').some(x=>String(x.employeeId)===String(u.employeeId)&&dateKey_(x.workDate)===day&&!x.checkOut))throw Error('Clock in before starting a break.');const open=openTimerSegment_(u.employeeId,day);if(!open||String(open.entryType).toUpperCase()!=='WORK')throw Error('Break can only start while work timer is running.');closeTimerSegment_(open,now);addTimerSegment_(u,'BREAK',now,open);addTimerEvent_(u,'BREAK_START',now,open);activity_(u,'BREAK_START','time',open.id,'');return timerStatus_(u);}
function stopBreak_(u){if(!['ADMIN','EMPLOYEE'].includes(u.role)||!u.employeeId)throw Error('Employee access required.');const now=new Date(),day=localDay_(now);reconcileAttendance_(u.employeeId,now);if(!rows_('attendance').some(x=>String(x.employeeId)===String(u.employeeId)&&dateKey_(x.workDate)===day&&!x.checkOut))throw Error('Clock in before stopping a break.');const open=openTimerSegment_(u.employeeId,day);if(!open||String(open.entryType).toUpperCase()!=='BREAK')throw Error('No running break timer.');closeTimerSegment_(open,now);addTimerEvent_(u,'BREAK_STOP',now,open);addTimerSegment_(u,'WORK',now,open);activity_(u,'BREAK_STOP','time',open.id,'');return timerStatus_(u);}
function installAutoClockOutTrigger_(){const name='autoCloseSessionsAtNinePm';ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()===name).forEach(t=>ScriptApp.deleteTrigger(t));ScriptApp.newTrigger(name).timeBased().everyMinutes(5).create();}
function autoCloseSessionsAtNinePm(){const now=new Date();if(localClock_(now)<'21:00:00')return 'Before 9 PM IST.';const day=localDay_(now),open=rows_('attendance').filter(x=>!x.checkOut&&dateKey_(x.workDate)<=day);open.forEach(att=>closeAttendance_(att,ninePm_(dateKey_(att.workDate)),true));return 'Auto clock-out processed for '+open.length+' session(s).';}
function switchWorkToTask_(u,task){if(u.role!=='EMPLOYEE'||!u.employeeId)return;const now=new Date(),day=localDay_(now);if(!rows_('attendance').some(x=>String(x.employeeId)===String(u.employeeId)&&dateKey_(x.workDate)===day&&!x.checkOut))throw Error('Clock in before starting work on an assignment.');const open=enforceSingleOpenTimer_(u,day,now);if(open&&String(open.entryType).toUpperCase()==='BREAK')throw Error('Stop your break before starting an assignment.');if(open&&String(open.taskId||'')===String(task.id||''))return;if(open)closeTimerSegment_(open,now);addTimerSegment_(u,'WORK',now,task);}
 function startTaskTimer_(u,q){if(u.role!=='EMPLOYEE'||!u.employeeId)throw Error('Employee access required.');const lock=LockService.getScriptLock();lock.waitLock(10000);try{const task=rows_('tasks').find(x=>String(x.id)===String(q.id));if(!task||!visible_(u,'tasks',task)||String(task.employeeId)!==String(u.employeeId))throw Error('Assignment not found or not assigned to you.');if(String(task.status||'').toUpperCase()!=='ACCEPTED')throw Error('Only accepted assignments can be started from Task.');if(task.clientId){const c=rows_('clients').find(x=>String(x.id)===String(task.clientId)&&(!x.assignedEmployeeId||String(x.assignedEmployeeId)===String(u.employeeId)));if(!c)throw Error('Client is not assigned or accessible to you.');ensureClientFolder_(task.clientId,u);}switchWorkToTask_(u,task);task.status='IN_PROGRESS';task.updatedAt=iso_();write_('tasks',task.id,task);activity_(u,'TASK_TIMER_START','tasks',task.id,task.jobNumber||task.title);return {task:task,timer:timerStatus_(u)};}finally{lock.releaseLock();}}
function taskTransition_(u,q){
  if(u.role!=='EMPLOYEE'||!u.employeeId)throw Error('Employee access required.');
  const task=rows_('tasks').find(x=>String(x.id)===String(q.id));
  if(!task||!visible_(u,'tasks',task)||String(task.employeeId)!==String(u.employeeId))throw Error('Task not found or not assigned to you.');
  const status=String(q.status||'').toUpperCase();
  if(!['PAUSED','ACCEPTED','COMPLETED'].includes(status))throw Error('Unsupported task transition.');
  const now=new Date(),day=localDay_(now),open=openTimerSegment_(u.employeeId,day);
  if(open&&String(open.taskId||'')===String(task.id))closeTimerSegment_(open,now);
  task.status=status;task.updatedAt=iso_();if(status==='COMPLETED')task.completedAt=iso_();else task.completedAt='';
  write_('tasks',task.id,task);activity_(u,'TASK_STATUS','tasks',task.id,status);
  return {task:task,timer:timerStatus_(u)};
}
function driveRoot_(){const id=PropertiesService.getScriptProperties().getProperty('KMMC_DOCUMENTS_FOLDER_ID');if(!id)throw Error('Set KMMC_DOCUMENTS_FOLDER_ID in Apps Script properties to the main Google Drive folder ID.');return DriveApp.getFolderById(id);}
function employeeDriveRoot_(u){
  driveCanAccess_(u);if(u.role!=='EMPLOYEE')return driveRoot_();
  const eid=String(u.employeeId||'').trim();if(!eid)throw Error('Your account is not linked to an employee record.');
  const employee=rows_('employees').find(x=>String(x.id)===eid),label=String(employee&&employee.name||u.name||u.username||'Employee').trim(),root=driveRoot_(),folderName='EMPLOYEE - '+eid+' - '+label;
  const it=root.getFoldersByName(folderName);return it.hasNext()?it.next():root.createFolder(folderName);
}
function driveFolderForUser_(u,id){
  if(!id)return employeeDriveRoot_(u);
  const folder=DriveApp.getFolderById(String(id));if(u.role==='ADMIN')return folder;
  const root=employeeDriveRoot_(u);let current=folder,depth=0;
  while(current&&depth++<30){if(current.getId()===root.getId())return folder;const parents=current.getParents();current=parents.hasNext()?parents.next():null;}
  throw Error('You can only access files and folders inside your My Files folder.');
}
function driveCanAccess_(u){if(!['ADMIN','EMPLOYEE'].includes(u.role))throw Error('Google Drive is available to Admin and Employee accounts only.');}
function driveList_(u,q){
  driveCanAccess_(u);const id=String(q.folderId||'').trim(),folder=driveFolderForUser_(u,id),items=[],query=String(q.search||'').trim().toLowerCase();
  const folders=folder.getFolders();while(folders.hasNext()){const f=folders.next();if(!query||f.getName().toLowerCase().includes(query))items.push({id:f.getId(),name:f.getName(),type:'FOLDER',mimeType:'application/vnd.google-apps.folder',url:f.getUrl(),updatedAt:f.getLastUpdated()?f.getLastUpdated().toISOString():''});}
  const files=folder.getFiles();while(files.hasNext()){const f=files.next();if(!query||f.getName().toLowerCase().includes(query))items.push({id:f.getId(),name:f.getName(),type:'FILE',mimeType:f.getMimeType(),url:f.getUrl(),downloadUrl:'https://drive.google.com/uc?export=download&id='+f.getId(),updatedAt:f.getLastUpdated()?f.getLastUpdated().toISOString():'',size:f.getSize()});}
  items.sort((a,b)=>a.type===b.type?a.name.localeCompare(b.name):a.type==='FOLDER'?-1:1);
  return {folderId:folder.getId(),folderName:folder.getName(),parentId:folder.getParents().hasNext()?folder.getParents().next().getId():'',items:items.slice(0,500)};
}
function driveCreate_(u,q){
  driveCanAccess_(u);const parent=driveFolderForUser_(u,String(q.folderId||'')),type=String(q.type||'FILE').toUpperCase(),name=String(q.name||'').trim().slice(0,180);if(!name)throw Error('Enter a folder or file name.');
  let item;if(type==='FOLDER')item=parent.createFolder(name);else{const mime=String(q.mimeType||'text/plain'),content=String(q.content||'');item=parent.createFile(Utilities.newBlob(content,mime,name));}
  activity_(u,'DRIVE_CREATE',type==='FOLDER'?'drive-folder':'drive-file',item.getId(),name);return {id:item.getId(),name:item.getName(),type:type,url:item.getUrl(),mimeType:type==='FILE'?item.getMimeType():'application/vnd.google-apps.folder'};
}
function driveUpload_(u,q){
  driveCanAccess_(u);const parent=driveFolderForUser_(u,String(q.folderId||'')),name=String(q.name||'').trim().slice(0,180),mime=String(q.mimeType||'application/octet-stream'),b64=String(q.base64Data||'');
  if(!name||!b64)throw Error('Choose a file to upload.');if(b64.length>8*1024*1024)throw Error('File is too large for portal upload (maximum about 6 MB).');
  const bytes=Utilities.base64Decode(b64),blob=Utilities.newBlob(bytes,mime,name),file=parent.createFile(blob);activity_(u,'DRIVE_UPLOAD','drive-file',file.getId(),name);
  return {id:file.getId(),name:file.getName(),url:file.getUrl(),downloadUrl:'https://drive.google.com/uc?export=download&id='+file.getId(),mimeType:file.getMimeType()};
}
function driveFileForUser_(u,id){const file=DriveApp.getFileById(String(id||''));if(u.role==='ADMIN')return file;const root=employeeDriveRoot_(u),parents=file.getParents();let allowed=false;while(parents.hasNext()){const p=parents.next();let current=p,depth=0;while(current&&depth++<30){if(current.getId()===root.getId()){allowed=true;break;}const pp=current.getParents();current=pp.hasNext()?pp.next():null;}if(allowed)break;}if(!allowed)throw Error('You can only access files inside your My Files folder.');return file;}
function driveRead_(u,q){
  driveCanAccess_(u);const file=driveFileForUser_(u,q.id),mime=file.getMimeType();
  if(!/^(text\/|application\/(json|xml|javascript|x-javascript))/.test(mime))return {id:file.getId(),name:file.getName(),mimeType:mime,url:file.getUrl(),editable:false,content:''};
  const content=file.getBlob().getDataAsString('UTF-8');if(content.length>500000)throw Error('This text file is too large to edit in the portal. Open it in Google Drive.');
  return {id:file.getId(),name:file.getName(),mimeType:mime,url:file.getUrl(),editable:true,content:content};
}
function driveSave_(u,q){
  driveCanAccess_(u);const id=String(q.id||''),file=driveFileForUser_(u,id);if(file.getMimeType()==='application/vnd.google-apps.folder')throw Error('Folders cannot be edited as file content. Rename the folder or create items inside it.');
  const mime=file.getMimeType();if(!/^(text\/|application\/(json|xml|javascript|x-javascript))/.test(mime))throw Error('This file type cannot be edited in the portal. Open it in Google Drive to edit it.');
  file.setContent(String(q.content||''));activity_(u,'DRIVE_EDIT','drive-file',id,file.getName());return {id:id,name:file.getName(),url:file.getUrl(),updatedAt:file.getLastUpdated().toISOString()};
}
function driveDelete_(u,q){driveCanAccess_(u);const id=String(q.id||''),type=String(q.type||'FILE').toUpperCase();if(type==='FOLDER')driveFolderForUser_(u,id).setTrashed(true);else driveFileForUser_(u,id).setTrashed(true);activity_(u,'DRIVE_TRASH',type==='FOLDER'?'drive-folder':'drive-file',id,'Moved to Drive trash');return {deleted:true,id:id};}
function driveRename_(u,q){
  driveCanAccess_(u);const id=String(q.id||''),name=String(q.name||'').trim().slice(0,180);if(!name)throw Error('Enter a name.');let type=String(q.type||'FILE').toUpperCase(),item;if(type==='FOLDER')item=driveFolderForUser_(u,id);else item=driveFileForUser_(u,id);item.setName(name);activity_(u,'DRIVE_RENAME',type==='FOLDER'?'drive-folder':'drive-file',id,name);return {id:id,name:item.getName(),url:item.getUrl(),type:type};
}
function setTaskStatus_(u,q){if(!['ADMIN','EMPLOYEE'].includes(u.role))throw Error('Employee access required.');const r=rows_('tasks').find(x=>x.id===String(q.id));if(!r||!visible_(u,'tasks',r))throw Error('Task not found/access denied.');if(u.role==='EMPLOYEE'&&String(r.employeeId)!==String(u.employeeId))throw Error('Task is not assigned to you.');const status=String(q.status||'').toUpperCase();if(!['ACCEPTED','IN_PROGRESS','PAUSED','TRANSFERRED','COMPLETED','CANCELLED'].includes(status))throw Error('Invalid task status.');r.status=status;r.updatedAt=iso_();if(status==='COMPLETED')r.completedAt=iso_();if(status==='IN_PROGRESS'&&u.role==='EMPLOYEE'){const now=new Date(),day=localDay_(now);reconcileAttendance_(u.employeeId,now);if(!rows_('attendance').some(a=>String(a.employeeId)===String(u.employeeId)&&dateKey_(a.workDate)===day&&!a.checkOut))throw Error('Clock in before starting work on an assignment.');if(r.clientId){const client=rows_('clients').find(c=>String(c.id)===String(r.clientId)&&(!c.assignedEmployeeId||String(c.assignedEmployeeId)===String(u.employeeId)));if(!client)throw Error('Client is not assigned or accessible to you.');ensureClientFolder_(r.clientId);}switchWorkToTask_(u,r);}write_('tasks',r.id,r);activity_(u,'TASK_STATUS','tasks',r.id,status);return r;}
function taskStatus_(u,q,status){
  const r=rows_('tasks').find(x=>x.id===String(q.id));if(!r||!visible_(u,'tasks',r))throw Error('Task not found/access denied.');
  if(u.role==='EMPLOYEE'&&String(r.employeeId)!==String(u.employeeId))throw Error('Task is not assigned to you.');
  r.status=status;r.updatedAt=iso_();if(status==='COMPLETED')r.completedAt=iso_();if(status==='IN_PROGRESS'&&u.role==='EMPLOYEE'){const now=new Date(),day=localDay_(now);reconcileAttendance_(u.employeeId,now);if(!rows_('attendance').some(a=>String(a.employeeId)===String(u.employeeId)&&dateKey_(a.workDate)===day&&!a.checkOut))throw Error('Clock in before starting work on an assignment.');if(r.clientId){const client=rows_('clients').find(c=>String(c.id)===String(r.clientId)&&(!c.assignedEmployeeId||String(c.assignedEmployeeId)===String(u.employeeId)));if(!client)throw Error('Client is not assigned or accessible to you.');ensureClientFolder_(r.clientId);}switchWorkToTask_(u,r);}write_('tasks',r.id,r);return r;
}
function uploadDoc_(u,q){
  authorize_(u,'documents','create');const parentId=PropertiesService.getScriptProperties().getProperty('KMMC_DOCUMENTS_FOLDER_ID');if(!parentId)throw Error('Set KMMC_DOCUMENTS_FOLDER_ID to the provided Google Drive parent folder ID in Script Properties.');if(u.role==='CLIENT'&&String(q.category||'GENERAL')!=='COLLECTION_SCREENSHOT')throw Error('Client document uploads are not enabled. Please contact your assigned employee.');
  const name=String(q.name||'document').slice(0,180),mime=String(q.mimeType||'application/octet-stream'),b64=String(q.base64Data||'');if(!b64||b64.length>8*1024*1024)throw Error('File required; max encoded size is about 8 MB.');
  const category=String(q.category||'GENERAL'),clientId=String(q.clientId||u.clientId||'');if(u.role==='CLIENT'&&clientId!==String(u.clientId))throw Error('Client access denied.');
  let folder,client=null,majorHead='',year='',month='',folderUrl='';
  if(category==='COLLECTION_SCREENSHOT'){folder=DriveApp.getFolderById(parentId);}else{
    if(!clientId)throw Error('Select a client before uploading.');client=rows_('clients').find(x=>String(x.id)===clientId);if(!client)throw Error('Client not found.');
    const assignedEmployeeId=String(client.assignedEmployeeId||'').trim();if(u.role==='EMPLOYEE'&&assignedEmployeeId&&assignedEmployeeId!==String(u.employeeId))throw Error('You can upload documents only for a client assigned to you.');
    const taskId=String(q.taskId||'');if(!taskId)throw Error('Select an assigned task that has been started before uploading client documents.');
    const task=rows_('tasks').find(x=>String(x.id)===taskId);if(!task||String(task.clientId)!==clientId)throw Error('Selected task does not belong to this client.');
    if(u.role==='EMPLOYEE'&&String(task.employeeId)!==String(u.employeeId))throw Error('This task is not assigned to you.');
    if(!['IN_PROGRESS','PAUSED','COMPLETED'].includes(String(task.status||'').toUpperCase()))throw Error('Start the assigned task before uploading documents.');
    majorHead=String(q.majorHead||'').trim();if(!majorHead)throw Error('Select a Major Head.');year=String(q.year||'').trim();month=String(q.month||'').trim();
    if(year&&!/^20\d{2}$/.test(year))throw Error('Year must be a valid four-digit year.');if(month&&!/^(0[1-9]|1[0-2])$/.test(month))throw Error('Select a valid month.');
    folder=getOrCreateChildFolder_(ensureClientFolder_(clientId),majorHead);if(year)folder=getOrCreateChildFolder_(folder,year);if(month)folder=getOrCreateChildFolder_(folder,month);folderUrl=folder.getUrl();
  }
  const blob=Utilities.newBlob(Utilities.base64Decode(b64.replace(/^data:[^,]*,/,'')),mime,name),f=folder.createFile(blob);
  const r={id:uid_(),clientId,employeeId:String(q.employeeId||u.employeeId||''),taskId:String(q.taskId||''),invoiceId:String(q.invoiceId||''),name,mimeType:mime,driveFileId:f.getId(),driveUrl:f.getUrl(),downloadUrl:'https://drive.google.com/uc?export=download&id='+f.getId(),folderUrl,pan:client?String(client.pan||''):'',majorHead,year,month,category,visibility:String(q.visibility||'PRIVATE'),uploadedBy:u.id,createdAt:iso_()};append_('documents',r);activity_(u,'UPLOAD','documents',r.id,name);return r;
}
function ensureClientDocumentationRoot_(){const parentId=PropertiesService.getScriptProperties().getProperty('KMMC_DOCUMENTS_FOLDER_ID');if(!parentId)throw Error('Set KMMC_DOCUMENTS_FOLDER_ID in Script Properties.');return getOrCreateChildFolder_(DriveApp.getFolderById(parentId),'Client Documentation');}
function getOrCreateChildFolder_(parent,name){const clean=String(name||'').replace(/[\\/:*?"<>|]/g,'-').trim().slice(0,120)||'General';const it=parent.getFoldersByName(clean);return it.hasNext()?it.next():parent.createFolder(clean);}
function ensureClientFolder_(clientId,u){const client=rows_('clients').find(x=>String(x.id)===String(clientId));if(!client)throw Error('Client not found.');const assigned=String(client.assignedEmployeeId||''),employeeUser=u&&u.role==='EMPLOYEE'?u:null;if(employeeUser&&assigned&&assigned!==String(employeeUser.employeeId))throw Error('Client is assigned to another employee.');const parent=employeeUser?employeeDriveRoot_(employeeUser):(assigned?employeeDriveRoot_({role:'EMPLOYEE',employeeId:assigned,name:''}):ensureClientDocumentationRoot_());if(client.driveFolderId){try{const existing=DriveApp.getFolderById(client.driveFolderId),parents=existing.getParents();while(parents.hasNext()){if(parents.next().getId()===parent.getId())return existing;}}catch(e){}}const folder=getOrCreateChildFolder_(parent,String(client.clientCode||client.id)+' - '+String(client.name||'Client'));client.driveFolderId=folder.getId();client.driveFolderUrl=folder.getUrl();client.updatedAt=iso_();write_('clients',client.id,client);activity_({id:'SYSTEM',username:'SYSTEM',role:'SYSTEM'},'CREATE_CLIENT_FOLDER','clients',client.id,folder.getName());return folder;}
function chatContacts_(u){if(!['ADMIN','EMPLOYEE'].includes(u.role))throw Error('Employee/Admin access required.');return rows_('users').filter(x=>['ADMIN','EMPLOYEE'].includes(String(x.role))&&String(x.status||'ACTIVE').toUpperCase()==='ACTIVE'&&String(x.id)!==String(u.id)).map(x=>({id:x.id,name:x.name||x.username,role:x.role,username:x.username}));}
function getMessages_(u,q){if(!['ADMIN','EMPLOYEE'].includes(u.role))throw Error('Employee/Admin access required.');let a=rows_('messages').filter(x=>u.role==='ADMIN'||String(x.fromUserId)===String(u.id)||String(x.toUserId)===String(u.id));const peer=String(q.withUserId||'');if(peer)a=a.filter(x=>(String(x.fromUserId)===String(u.id)&&String(x.toUserId)===peer)||(String(x.toUserId)===String(u.id)&&String(x.fromUserId)===peer));a.sort((x,y)=>String(x.createdAt).localeCompare(String(y.createdAt)));const users=rows_('users'),name=id=>{const x=users.find(v=>String(v.id)===String(id));return x?(x.name||x.username):String(id);};return a.slice(-300).map(x=>{const out=publicRec_('messages',x);if(u.role==='ADMIN'&&q.all){out.fromName=name(x.fromUserId);out.toName=name(x.toUserId);}return out;});}
function createClientMessage_(u,q){const x=q.record||{},to=String(x.toUserId||'');const recipient=rows_('users').find(v=>String(v.id)===to&&String(v.role)==='ADMIN'&&String(v.status||'ACTIVE').toUpperCase()==='ACTIVE');if(!recipient)throw Error('Select a valid admin recipient.');const message=String(x.message||'').trim();if(!message)throw Error('Message cannot be empty.');const r={id:uid_(),fromUserId:u.id,toUserId:to,clientId:u.clientId,subject:String(x.subject||'Client query').slice(0,180),message:message.slice(0,4000),status:'SENT',createdAt:iso_(),readAt:''};append_('messages',r);rawAppend_('DB_NOTIFICATIONS',{id:uid_(),userId:to,title:'New client message from '+String(u.name||u.username),message:message.slice(0,500),type:'CLIENT_MESSAGE',relatedId:r.id,readAt:'',createdAt:iso_()});return publicRec_('messages',r);}
function sendMessage_(u,q){if(!['ADMIN','EMPLOYEE'].includes(u.role))throw Error('Employee/Admin access required.');const to=String(q.toUserId||'');if(!to||to===String(u.id))throw Error('Select another employee or admin.');const recipient=rows_('users').find(x=>String(x.id)===to&&['ADMIN','EMPLOYEE'].includes(String(x.role))&&String(x.status||'ACTIVE').toUpperCase()==='ACTIVE');if(!recipient)throw Error('Recipient not found or inactive.');const message=String(q.message||'').trim();if(!message)throw Error('Message cannot be empty.');if(message.length>4000)throw Error('Message must be 4,000 characters or fewer.');const r={id:uid_(),fromUserId:u.id,toUserId:to,clientId:'',subject:'Chat',message,status:'SENT',createdAt:iso_(),readAt:''};append_('messages',r);rawAppend_('DB_NOTIFICATIONS',{id:uid_(),userId:to,title:'New message from '+String(u.name||u.username),message:message.slice(0,500),type:'CHAT_MESSAGE',relatedId:r.id,readAt:'',createdAt:iso_()});activity_(u,'SEND_MESSAGE','messages',r.id,'to:'+to);return publicRec_('messages',r);}
function markMessagesRead_(u,q){if(!['ADMIN','EMPLOYEE'].includes(u.role))throw Error('Employee/Admin access required.');const peer=String(q.withUserId||'');const ids=[];rows_('messages').forEach(r=>{if(String(r.toUserId)===String(u.id)&&(!peer||String(r.fromUserId)===peer)&&r.status!=='READ'){r.status='READ';r.readAt=iso_();write_('messages',r.id,r);ids.push(r.id);}});if(ids.length){const wanted={};ids.forEach(id=>wanted[id]=true);rows_('notifications').filter(n=>String(n.userId)===String(u.id)&&wanted[String(n.relatedId)]).forEach(n=>{n.readAt=iso_();write_('notifications',n.id,n);});}return {marked:ids.length};}
function setLeaveStatus_(u,q){needAdmin_(u);const r=rows_('leave').find(x=>String(x.id)===String(q.id));if(!r)throw Error('Leave request not found.');const status=String(q.status||'').toUpperCase();if(!['APPROVED','REJECTED'].includes(status))throw Error('Status must be APPROVED or REJECTED.');r.status=status;r.approvedBy=u.id;r.updatedAt=iso_();write_('leave',r.id,r);const emp=rows_('employees').find(x=>String(x.id)===String(r.employeeId));const recipient=emp?rows_('users').find(x=>String(x.employeeId)===String(emp.id)):null;if(recipient)rawAppend_('DB_NOTIFICATIONS',{id:uid_(),userId:recipient.id,title:'Leave request '+status.toLowerCase(),message:'Your leave request from '+r.fromDate+' to '+r.toDate+' was '+status.toLowerCase()+'.',type:'LEAVE_STATUS',relatedId:r.id,readAt:'',createdAt:iso_()});activity_(u,'LEAVE_STATUS','leave',r.id,status);return r;}
function createInvoice_(u,q){
  authorize_(u,'invoices','create');const r=sanitize_('invoices',q.record||{});if(!r.clientId)throw Error('clientId required.');
  if(u.role==='CLIENT'&&String(r.clientId)!==String(u.clientId))throw Error('Access denied.');
  r.id=uid_();r.createdAt=iso_();r.updatedAt=iso_();r.createdBy=u.id;invoiceMath_(r);append_('invoices',r);activity_(u,'CREATE_INVOICE','invoices',r.id,r.invoiceNo);return r;
}
function invoiceMath_(r){
  const sub=num_(r.subtotal),tax=num_(r.taxAmount),disc=num_(r.discount);
  if(sub<0||tax<0||disc<0||disc>sub+tax)throw Error('Invalid invoice amounts.');
  r.totalAmount=round_(sub+tax-disc);r.status=r.status||'ISSUED';
  if(!r.invoiceNo)r.invoiceNo='KMMC-'+Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyyMMdd')+'-'+r.id.slice(0,6).toUpperCase();
}
function recordCollection_(u,q){
  authorize_(u,'collections','create');const r=sanitize_('collections',q.record||{});if(!r.clientId||num_(r.amount)<=0)throw Error('clientId and positive amount required.');
  if(u.role==='CLIENT'&&String(r.clientId)!==String(u.clientId))throw Error('Access denied.');
  r.id=uid_();r.amount=round_(num_(r.amount));r.collectionDate=r.collectionDate||iso_().slice(0,10);r.receivedBy=u.id;r.createdAt=iso_();r.status=r.status||'RECEIVED';r.receiptNo=r.receiptNo||'RCPT-'+r.id.slice(0,8).toUpperCase();
  append_('collections',r);activity_(u,'COLLECTION','collections',r.id,String(r.amount));return r;
}
function outstanding_(u,q){
  const cid=u.role==='CLIENT'?String(u.clientId||''):String(q.clientId||'');
  if(u.role==='CLIENT'&&!cid)throw Error('Client login is not linked to clientId.');
  if(!['ADMIN','EMPLOYEE','CLIENT'].includes(u.role))throw Error('Access denied.');
  let clients=rows_('clients').filter(c=>!cid||String(c.id)===cid);
  if(u.role==='EMPLOYEE')clients=clients.filter(c=>!c.assignedEmployeeId||String(c.assignedEmployeeId)===String(u.employeeId));
  return clients.map(c=>{
    const inv=rows_('invoices').filter(i=>String(i.clientId)===String(c.id)&&String(i.status).toUpperCase()!=='CANCELLED');
    const col=rows_('collections').filter(x=>String(x.clientId)===String(c.id)&&String(x.status||'RECEIVED').toUpperCase()!=='CANCELLED');
    const invoiced=inv.reduce((s,x)=>s+num_(x.totalAmount),0),received=col.reduce((s,x)=>s+num_(x.amount),0),opening=num_(c.openingBalance);
    return {clientId:c.id,clientCode:c.clientCode||'',clientName:c.name||'',invoiceCount:inv.length,invoicedAmount:round_(invoiced),collectionAmount:round_(received),openingBalance:round_(opening),outstanding:round_(opening+invoiced-received),invoices:inv.map(i=>({id:i.id,invoiceNo:i.invoiceNo,dueDate:i.dueDate,totalAmount:num_(i.totalAmount),status:i.status}))};
  });
}
function outstandingSummary_(u){
  const a=outstanding_(u,{});return {clients:a,totalOutstanding:round_(a.reduce((s,x)=>s+x.outstanding,0)),totalInvoiced:round_(a.reduce((s,x)=>s+x.invoicedAmount,0)),totalCollected:round_(a.reduce((s,x)=>s+x.collectionAmount,0))};
}
function module_(k){k=String(k||'').toLowerCase();if(!KMMC.M[k])throw Error('Unknown module: '+k);return k;}
function sanitize_(k,input){
  const out={},h=KMMC.M[k].h;
  h.forEach(key=>{if(['id','createdAt','updatedAt','passwordHash','salt','lastLoginAt','createdBy','receivedBy','uploadedBy'].includes(key))return;if(Object.prototype.hasOwnProperty.call(input,key)){const v=input[key];if(typeof v==='string'&&v.length>20000)throw Error('Field too long: '+key);out[key]=v==null?'':v;}});
  return out;
}
function pubUser_(u){return {id:u.id,username:u.username,role:u.role,name:u.name,email:u.email,phone:u.phone,clientId:u.clientId,employeeId:u.employeeId,status:u.status,mustChangePassword:u.mustChangePassword===true||String(u.mustChangePassword).toUpperCase()==='TRUE',createdAt:u.createdAt,lastLoginAt:u.lastLoginAt};}
function publicRec_(k,r){if(k==='users')return pubUser_(r);const o={};Object.keys(r).forEach(x=>{if(!['passwordHash','salt'].includes(x))o[x]=r[x];});return o;}
function needAdmin_(u){if(u.role!=='ADMIN')throw Error('Admin access required.');}
function db_(){const id=PropertiesService.getScriptProperties().getProperty(KMMC.DB_PROP);if(!id)throw Error('Set '+KMMC.DB_PROP+' in Script Properties.');return SpreadsheetApp.openById(id);}
function sheet_(name){const s=db_().getSheetByName(name);if(!s)throw Error('Missing '+name+'; run setupKmmcBackend().');return s;}
function rows_(k){return rawRows_(KMMC.M[k].s);}
function rawRows_(name){
  const v=sheet_(name).getDataRange().getValues();if(v.length<2)return [];
  const h=v[0].map(String),dateOnly=['workDate','startDate','dueDate','fromDate','toDate','joiningDate','dob','invoiceDate','collectionDate','expenseDate'];return v.slice(1).filter(r=>r.some(x=>x!==''&&x!=null)).map(r=>{const o={};h.forEach((x,i)=>{const value=r[i];o[x]=value instanceof Date&&dateOnly.includes(x)?Utilities.formatDate(value,'Asia/Kolkata','yyyy-MM-dd'):cell_(value);});return o;});
}
function append_(k,r){rawAppend_(KMMC.M[k].s,r);}
function rawAppend_(name,r){const sh=sheet_(name),h=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0];sh.appendRow(h.map(k=>r[k]==null?'':r[k]));}
function write_(k,id,r){rawWrite_(KMMC.M[k].s,id,r);}
function rawWrite_(name,id,r){const sh=sheet_(name),row=findRow_(sh,id);if(row<2)throw Error('Record not found.');const h=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0];sh.getRange(row,1,1,h.length).setValues([h.map(k=>r[k]==null?'':r[k])]);}
function findRow_(sh,id){if(sh.getLastRow()<2)return -1;const v=sh.getRange(2,1,sh.getLastRow()-1,1).getDisplayValues();for(let i=0;i<v.length;i++)if(String(v[i][0])===String(id))return i+2;return -1;}
function activity_(u,a,m,id,d){try{rawAppend_('DB_ACTIVITY_LOG',{id:uid_(),userId:u.id,username:u.username,role:u.role,action:a,module:m,recordId:id,details:String(d||'').slice(0,500),createdAt:iso_()});}catch(e){}}
function loginLog_(id,n,result){try{rawAppend_('DB_LOGIN_LOG',{id:uid_(),userId:id,username:n,result,createdAt:iso_()});}catch(e){}}
function logError_(e){try{rawAppend_('DB_ERROR_LOG',{id:uid_(),action:'API',message:String(e&&e.message||e).slice(0,1000),createdAt:iso_()});}catch(x){}}
function hash_(p,s){return sha_(String(s)+'|'+String(p)+'|'+String(PropertiesService.getScriptProperties().getProperty(KMMC.SECRET_PROP)||''));}
function sha_(s){return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(s),Utilities.Charset.UTF_8));}
function configured_(){return !!PropertiesService.getScriptProperties().getProperty(KMMC.DB_PROP)&&!!PropertiesService.getScriptProperties().getProperty(KMMC.SECRET_PROP);}
function out_(x){return ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON);}
function uid_(){return Utilities.getUuid();}
function iso_(){return new Date().toISOString();}
function num_(x){const n=Number(x);return isFinite(n)?n:0;}
function round_(n){return Math.round((Number(n)+Number.EPSILON)*100)/100;}
function cell_(v){return v instanceof Date?v.toISOString():v;}
function ensureHeaders_(sh,required){const last=sh.getLastColumn();const existing=last?sh.getRange(1,1,1,last).getDisplayValues()[0].map(String):[];const missing=required.filter(h=>existing.indexOf(h)<0);if(missing.length)sh.getRange(1,last+1,1,missing.length).setValues([missing]);}
function nextCode_(module,prefix,start){const codes=rows_(module).map(r=>String(r.clientCode||r.employeeCode||''));let n=start;while(n<=99999&&codes.includes(prefix?prefix+String(n).padStart(5,'0'):String(n).padStart(5,'0')))n++;if(n>99999)throw Error('ID sequence exhausted.');return prefix?prefix+String(n).padStart(5,'0'):String(n).padStart(5,'0');}
function makeTempPassword_(){return Utilities.getUuid().replace(/-/g,'').slice(0,12)+'aA1!';}
function quickCreateClient_(u,q){
  if(u.role!=='EMPLOYEE'||!u.employeeId)throw Error('Employee access required.');
  const x=q.record||{},name=String(x.name||'').trim();if(!name)throw Error('Enter a client name.');
  const email=String(x.email||'').trim().toLowerCase(),phone=String(x.phone||'').trim();
  const existing=rows_('clients').find(c=>String(c.name||'').trim().toLowerCase()===name.toLowerCase()&&(!c.assignedEmployeeId||String(c.assignedEmployeeId)===String(u.employeeId)));
  if(existing)return {client:publicRec_('clients',existing),existing:true};
  const now=iso_(),id=uid_(),code=nextCode_('clients','CL',1),r={id,clientCode:code,name,pan:String(x.pan||'').toUpperCase(),email,phone,gstin:'',address:'',city:'',state:'',pincode:'',majorHeads:'',otherWork:'',referenceName:'',assignedEmployeeId:String(u.employeeId),openingBalance:0,status:'ACTIVE',portalUsername:'',notes:'Added by employee from Workdone client picker',createdAt:now,updatedAt:now};
  append_('clients',r);activity_(u,'QUICK_CREATE_CLIENT','clients',id,code);return {client:publicRec_('clients',r),existing:false};
}
function createClient_(admin,q){needAdmin_(admin);const x=q.record||{};if(!String(x.name||'').trim())throw Error('Client name is required.');const email=String(x.email||'').trim().toLowerCase();if(email&&rows_('clients').some(r=>String(r.email||'').toLowerCase()===email))throw Error('A client with this email already exists.');const now=iso_(),id=uid_(),code=nextCode_('clients','CL',1);const r={id,clientCode:code,name:String(x.name).trim(),pan:String(x.pan||'').toUpperCase(),email,phone:String(x.phone||''),gstin:String(x.gstin||'').toUpperCase(),address:String(x.address||''),city:String(x.city||''),state:String(x.state||''),pincode:String(x.pincode||''),majorHeads:Array.isArray(x.majorHeads)?x.majorHeads.join(' | '):String(x.majorHeads||''),otherWork:String(x.otherWork||''),referenceName:String(x.referenceName||''),assignedEmployeeId:String(x.assignedEmployeeId||''),openingBalance:num_(x.openingBalance),status:String(x.status||'ACTIVE'),portalUsername:code,notes:String(x.notes||''),createdAt:now,updatedAt:now};append_('clients',r);const password=String(x.initialPassword||makeTempPassword_());const login=createUser_(admin,{record:{username:code,password,role:'CLIENT',name:r.name,email:r.email,phone:r.phone,clientId:id,mustChangePassword:true}});activity_(admin,'CREATE_CLIENT','clients',id,code);return {client:publicRec_('clients',r),portal:{username:login.username,initialPassword:password,mustChangePassword:true}};}
function updateClient_(admin,q){needAdmin_(admin);const id=String(q.id||''),old=rows_('clients').find(r=>r.id===id);if(!old)throw Error('Client not found.');const patch=q.record||{};['name','pan','email','phone','gstin','address','city','state','pincode','majorHeads','otherWork','referenceName','assignedEmployeeId','openingBalance','status','notes'].forEach(k=>{if(patch[k]!==undefined)old[k]=k==='pan'||k==='gstin'?String(patch[k]).toUpperCase():k==='majorHeads'&&Array.isArray(patch[k])?patch[k].join(' | '):patch[k];});if(!String(old.name||'').trim())throw Error('Client name is required.');old.updatedAt=iso_();write_('clients',id,old);const user=rows_('users').find(u=>u.role==='CLIENT'&&u.clientId===id);if(user){user.name=old.name;user.email=old.email;user.phone=old.phone;user.updatedAt=iso_();write_('users',user.id,user);}activity_(admin,'UPDATE_CLIENT','clients',id,old.clientCode);return publicRec_('clients',old);}
function deleteClient_(admin,q){needAdmin_(admin);const id=String(q.id||''),r=rows_('clients').find(x=>x.id===id);if(!r)throw Error('Client not found.');if(rows_('invoices').some(x=>x.clientId===id)||rows_('collections').some(x=>x.clientId===id))throw Error('Client has invoice/collection records. Mark inactive instead of deleting.');const user=rows_('users').find(x=>x.role==='CLIENT'&&x.clientId===id);if(user){user.status='INACTIVE';user.updatedAt=iso_();write_('users',user.id,user);}const sh=sheet_(KMMC.M.clients.s),row=findRow_(sh,id);if(row>1)sh.deleteRow(row);activity_(admin,'DELETE_CLIENT','clients',id,r.clientCode);return {deleted:true,clientCode:r.clientCode};}
function bulkImportClients_(admin,q){needAdmin_(admin);const input=Array.isArray(q.records)?q.records:[];if(!input.length)throw Error('No client rows supplied.');if(input.length>500)throw Error('Upload is limited to 500 clients at a time.');const created=[],errors=[];input.forEach((x,i)=>{try{const result=createClient_(admin,{record:x});created.push({row:i+2,clientCode:result.client.clientCode,name:result.client.name,username:result.portal.username,initialPassword:result.portal.initialPassword});}catch(e){errors.push({row:i+2,name:String(x.name||''),error:String(e.message||e)});}});return {createdCount:created.length,failedCount:errors.length,created,errors};}
function createEmployee_(admin,q){needAdmin_(admin);const x=q.record||{};if(!String(x.name||'').trim())throw Error('Employee name is required.');const now=iso_(),id=uid_(),code=nextCode_('employees','',10001),email=String(x.email||'').trim().toLowerCase();if(email&&rows_('employees').some(r=>String(r.email||'').toLowerCase()===email))throw Error('An employee with this email already exists.');const r={id,employeeCode:code,name:String(x.name).trim(),email,phone:String(x.phone||''),alternatePhone:String(x.alternatePhone||''),dob:String(x.dob||''),gender:String(x.gender||''),maritalStatus:String(x.maritalStatus||''),bloodGroup:String(x.bloodGroup||''),address:String(x.address||''),city:String(x.city||''),state:String(x.state||''),pincode:String(x.pincode||''),emergencyContactName:String(x.emergencyContactName||''),emergencyContactPhone:String(x.emergencyContactPhone||''),education:String(x.education||''),department:String(x.department||''),designation:String(x.designation||''),joiningDate:String(x.joiningDate||''),employmentType:String(x.employmentType||'FULL_TIME'),reportingTo:String(x.reportingTo||''),pan:String(x.pan||'').toUpperCase(),aadhaarLast4:String(x.aadhaarLast4||''),bankName:String(x.bankName||''),bankAccountLast4:String(x.bankAccountLast4||''),ifsc:String(x.ifsc||'').toUpperCase(),salary:num_(x.salary),resumeFileId:'',resumeUrl:'',status:String(x.status||'ACTIVE'),notes:String(x.notes||''),createdAt:now,updatedAt:now};if(x.resumeBase64){const saved=saveEmployeeResume_(r,x);r.resumeFileId=saved.id;r.resumeUrl=saved.url;}append_('employees',r);const password=String(x.initialPassword||makeTempPassword_()),username=code;const login=createUser_(admin,{record:{username,password,role:'EMPLOYEE',name:r.name,email:r.email,phone:r.phone,employeeId:id,mustChangePassword:true}});activity_(admin,'CREATE_EMPLOYEE','employees',id,code);return {employee:publicRec_('employees',r),portal:{username:login.username,initialPassword:password,mustChangePassword:true}};}
function bulkImportEmployees_(admin,q){needAdmin_(admin);const input=Array.isArray(q.records)?q.records:[];if(!input.length)throw Error('No employee rows supplied.');if(input.length>500)throw Error('Upload is limited to 500 employees at a time.');const created=[],errors=[];input.forEach((x,i)=>{try{const result=createEmployee_(admin,{record:x});created.push({row:i+2,employeeCode:result.employee.employeeCode,name:result.employee.name,username:result.portal.username,initialPassword:result.portal.initialPassword});}catch(e){errors.push({row:i+2,name:String(x.name||''),error:String(e.message||e)});}});return {createdCount:created.length,failedCount:errors.length,created,errors};}
function updateEmployee_(admin,q){needAdmin_(admin);const id=String(q.id||''),old=rows_('employees').find(r=>r.id===id);if(!old)throw Error('Employee not found.');const p=q.record||{};if(p.resumeBase64){const saved=saveEmployeeResume_(old,p);old.resumeFileId=saved.id;old.resumeUrl=saved.url;}Object.keys(old).forEach(k=>{if(p[k]!==undefined&&!['id','employeeCode','createdAt','resumeFileId','resumeUrl','resumeBase64','resumeName','resumeMimeType','initialPassword'].includes(k))old[k]=p[k];});old.updatedAt=iso_();write_('employees',id,old);const u=rows_('users').find(x=>x.role==='EMPLOYEE'&&x.employeeId===id);if(u){u.name=old.name;u.email=old.email;u.phone=old.phone;u.updatedAt=iso_();write_('users',u.id,u);}activity_(admin,'UPDATE_EMPLOYEE','employees',id,old.employeeCode);return publicRec_('employees',old);}
function deleteEmployee_(admin,q){needAdmin_(admin);const id=String(q.id||''),r=rows_('employees').find(x=>x.id===id);if(!r)throw Error('Employee not found.');if(rows_('tasks').some(x=>x.employeeId===id)||rows_('time').some(x=>x.employeeId===id))throw Error('Employee has work/time records. Mark inactive instead of deleting.');const u=rows_('users').find(x=>x.role==='EMPLOYEE'&&x.employeeId===id);if(u){u.status='INACTIVE';u.updatedAt=iso_();write_('users',u.id,u);}const sh=sheet_(KMMC.M.employees.s),row=findRow_(sh,id);if(row>1)sh.deleteRow(row);activity_(admin,'DELETE_EMPLOYEE','employees',id,r.employeeCode);return {deleted:true,employeeCode:r.employeeCode};}
function saveEmployeeResume_(emp,x){const props=PropertiesService.getScriptProperties(),rootId=props.getProperty('KMMC_EMPLOYEE_FOLDER_ID')||props.getProperty('KMMC_DOCUMENTS_FOLDER_ID');if(!rootId)throw Error('Set KMMC_EMPLOYEE_FOLDER_ID or KMMC_DOCUMENTS_FOLDER_ID in Script Properties to the Google Drive parent folder ID.');const root=DriveApp.getFolderById(rootId),resumeFolders=root.getFoldersByName('Resume'),resumeRoot=resumeFolders.hasNext()?resumeFolders.next():root.createFolder('Resume'),personFolders=resumeRoot.getFoldersByName(emp.employeeCode+' - '+emp.name),person=personFolders.hasNext()?personFolders.next():resumeRoot.createFolder(emp.employeeCode+' - '+emp.name);const name=String(x.resumeName||('Resume - '+emp.name)),mime=String(x.resumeMimeType||'application/pdf'),b64=String(x.resumeBase64||'').replace(/^data:[^,]*,/,'');if(!b64||b64.length>8*1024*1024)throw Error('Resume upload is required and must be under about 8 MB.');const file=person.createFile(Utilities.newBlob(Utilities.base64Decode(b64),mime,name));return {id:file.getId(),url:file.getUrl()};}

