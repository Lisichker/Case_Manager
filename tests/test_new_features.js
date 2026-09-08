import { store } from '../src/js/store.js';

console.log('Testing New Features: Edit Witness, Edit Fact Sheet, Navigate to Assertion, Collapsing...');

// 1. Test updateWitnessAttributes
const state = store.getState();
const witnessId = Object.keys(state.witnesses)[0];
if (!witnessId) throw new Error('No witnesses in store');

store.updateWitnessAttributes(witnessId, {
  name: 'יוסי כהן - עד ראייה ראשי',
  role: 'עד תביעה מס׳ 1',
  notes: 'זיהה את הרכב ממרחק 10 מטרים'
});

const updatedWit = store.getState().witnesses[witnessId];
if (updatedWit.name !== 'יוסי כהן - עד ראייה ראשי') throw new Error('Witness name not updated');
if (updatedWit.role !== 'עד תביעה מס׳ 1') throw new Error('Witness role not updated');
if (updatedWit.notes !== 'זיהה את הרכב ממרחק 10 מטרים') throw new Error('Witness notes not updated');
console.log('✓ updateWitnessAttributes passed');

// 2. Test updateFactSheetAttributes
const sheetId = Object.keys(state.factSheets)[0];
if (!sheetId) throw new Error('No fact sheets in store');

store.updateFactSheetAttributes(sheetId, {
  name: 'גיליון עובדות מפתח - אליבי',
  description: 'ריכוז טענות המפריכות את נוכחות הנאשם'
});

const updatedSheet = store.getState().factSheets[sheetId];
if (updatedSheet.name !== 'גיליון עובדות מפתח - אליבי') throw new Error('FactSheet name not updated');
if (updatedSheet.description !== 'ריכוז טענות המפריכות את נוכחות הנאשם') throw new Error('FactSheet description not updated');
console.log('✓ updateFactSheetAttributes passed');

// 3. Test navigateToAssertion
const asrtId = Object.keys(state.assertions)[0];
if (!asrtId) throw new Error('No assertions in store');
const targetAsrt = state.assertions[asrtId];

// Switch away to table tab first
store.setActiveTab('table');
if (store.getState().activeTab !== 'table') throw new Error('Failed to set active tab to table');

// Now navigate to assertion
const navigatedId = store.navigateToAssertion(asrtId);
if (navigatedId !== asrtId) throw new Error('navigateToAssertion did not return target assertion id');
if (store.getState().activeTab !== 'witnesses') throw new Error('navigateToAssertion did not switch active tab to witnesses');
if (store.getState().selectedStatementId !== targetAsrt.statementId) throw new Error('navigateToAssertion did not select statement');
if (store.getTargetAssertionHighlight() !== asrtId) throw new Error('targetAssertionHighlight mismatch');
store.clearTargetAssertionHighlight();
if (store.getTargetAssertionHighlight() !== null) throw new Error('clearTargetAssertionHighlight failed');
console.log('✓ navigateToAssertion passed');

// 4. Test assertion update (editing text, color, page, lines)
store.updateAssertion(asrtId, {
  name: 'טענה מעודכנת לאחר עריכה',
  page: '5',
  lines: '12-20',
  color: 'yellow',
  text: 'הציטוט המעודכן מתוך עדות העד במשטרה'
});

const updatedAsrt = store.getState().assertions[asrtId];
if (updatedAsrt.name !== 'טענה מעודכנת לאחר עריכה') throw new Error('Assertion name mismatch');
if (updatedAsrt.page !== '5' || updatedAsrt.lines !== '12-20') throw new Error('Assertion page/lines mismatch');
if (updatedAsrt.color !== 'yellow') throw new Error('Assertion color mismatch');
if (updatedAsrt.text !== 'הציטוט המעודכן מתוך עדות העד במשטרה') throw new Error('Assertion text mismatch');
console.log('✓ updateAssertion passed');

// 5. Test Tab-Specific Lock
console.log('Testing Tab-Specific Lock behavior...');
store.setTabLocked('facts', true);
store.setTabLocked('witnesses', false);
store.setTabLocked('table', false);

if (!store.isTabLocked('facts')) throw new Error('Facts tab should be locked');
if (store.isTabLocked('witnesses')) throw new Error('Witnesses tab should NOT be locked');
if (store.isTabLocked('table')) throw new Error('Table tab should NOT be locked');

// When facts is locked, addFactSheet should be blocked
const sheetCountBefore = Object.keys(store.getState().factSheets).length;
store.addFactSheet('גיליון חסום');
const sheetCountAfter = Object.keys(store.getState().factSheets).length;
if (sheetCountAfter !== sheetCountBefore) throw new Error('addFactSheet should be blocked when facts tab is locked');

// When witnesses is unlocked, addWitness should SUCCEED
const witnessCountBefore = Object.keys(store.getState().witnesses).length;
const newWitId = store.addWitness('עד חדש בלשונית עדים פתוחה');
const witnessCountAfter = Object.keys(store.getState().witnesses).length;
if (witnessCountAfter !== witnessCountBefore + 1) throw new Error('addWitness should succeed when witnesses tab is unlocked');

// When table is unlocked, addTableColumn should SUCCEED
const colCountBefore = store.getState().factTable.columns.length;
const newColId = store.addTableColumn('עמודה פתוחה');
const colCountAfter = store.getState().factTable.columns.length;
if (colCountAfter !== colCountBefore + 1) throw new Error('addTableColumn should succeed when table tab is unlocked');

// Now lock witnesses as well
store.setTabLocked('witnesses', true);
if (!store.isTabLocked('witnesses')) throw new Error('Witnesses tab should now be locked');
const witnessCountBeforeLock = Object.keys(store.getState().witnesses).length;
store.addWitness('עד חסום');
if (Object.keys(store.getState().witnesses).length !== witnessCountBeforeLock) {
  throw new Error('addWitness should be blocked when witnesses tab is locked');
}

// Unlock facts and verify mutation succeeds
store.setTabLocked('facts', false);
if (store.isTabLocked('facts')) throw new Error('Facts tab should now be unlocked');
store.addFactSheet('גיליון חדש לאחר פתיחה');
if (Object.keys(store.getState().factSheets).length !== sheetCountBefore + 1) {
  throw new Error('addFactSheet should succeed after facts tab is unlocked');
}

// Verify domain data does not broadcast lock state
const domainData = store.getDomainData();
if (domainData.isLocked !== undefined || domainData.tabLocks !== undefined) {
  throw new Error('Lock state must NOT be included in domain data broadcast');
}
// 6. Test Presence Identity (No Mirroring on Case Updates)
console.log('Testing Presence Identity & Non-Mirroring...');
store.setUsername('עו״ד שרה (סנגורית)');
if (store.getState().editor.username !== 'עו״ד שרה (סנגורית)') {
  throw new Error('setUsername failed to update local username');
}

// Check tab ID and presence list
const tabId = store.getTabId();
if (!tabId || typeof tabId !== 'string') throw new Error('store.getTabId() should return a valid string');

const onlineUsers = store.getOnlineUsers();
if (!Array.isArray(onlineUsers) || onlineUsers.length === 0) {
  throw new Error('store.getOnlineUsers() should return an array containing at least the local user');
}
const selfEntry = onlineUsers.find(u => u.tabId === tabId);
if (!selfEntry || selfEntry.username !== 'עו״ד שרה (סנגורית)' || !selfEntry.isSelf) {
  throw new Error('Local user should be present in onlineUsers with isSelf = true');
}

// Simulate an incoming case update from another user ("עו״ד ראובן")
const currentCaseData = store.getDomainData();
store.applyIncomingData({
  ...currentCaseData,
  lastModifiedBy: 'עו״ד ראובן (פרקליטות)',
  editor: { username: 'עו״ד ראובן (פרקליטות)' } // legacy payload from old clients
});

// Crucial: Local user's identity must NOT be overwritten!
if (store.getState().editor.username !== 'עו״ד שרה (סנגורית)') {
  throw new Error(`Presence Identity broken: Local username was overwritten to "${store.getState().editor.username}" by incoming case data!`);
}
console.log('✓ Presence Identity tests passed: Local editor identity preserved without mirroring');

console.log('\nAll new feature unit tests passed successfully!');
process.exit(0);

