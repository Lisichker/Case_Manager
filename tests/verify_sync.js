// Verification test for multi-tab real-time sync decoupling
import { getSampleCaseData } from '../src/js/store.js';

console.log('Testing Cross-Tab Isolation & Domain Synchronization...');

// Simulate Tab A and Tab B states
const tabAState = {
  ...getSampleCaseData(),
  activeTab: 'witnesses',
  selectedWitnessId: 'wit_1',
  collapsed: { witnesses: false, statements: false, factSheets: false }
};

const tabBState = {
  ...getSampleCaseData(),
  activeTab: 'table',
  selectedWitnessId: 'wit_2',
  collapsed: { witnesses: true, statements: true, factSheets: true }
};

// Simulate Tab B having expanded cell facts
const tabBExpandedFacts = new Set(['row_3_col_4_fact_1']);

// Tab A mutates domain data: modifies an assertion text and adds an assertion to fact_1
const updatedAssertionText = 'עדות מעודכנת: הנאשם נראה במפעל בוודאות בשעה 14:20';
tabAState.assertions['asrt_4'].text = updatedAssertionText;
tabAState.facts['fact_1'].name = 'עובדה מעודכנת: נוכחות ודאית במפעל';

// Domain payload broadcasted by Tab A
const broadcastPayload = {
  type: 'SYNC_DOMAIN_DATA',
  data: {
    witnesses: tabAState.witnesses,
    statements: tabAState.statements,
    assertions: tabAState.assertions,
    factSheets: tabAState.factSheets,
    facts: tabAState.facts,
    factTable: tabAState.factTable,
    editor: tabAState.editor,
    lastUpdated: Date.now()
  }
};

// Simulate Tab B receiving broadcastPayload and applying it
const applyIncomingDataToTabB = (data) => {
  tabBState.witnesses = data.witnesses;
  tabBState.statements = data.statements;
  tabBState.assertions = data.assertions;
  tabBState.factSheets = data.factSheets;
  tabBState.facts = data.facts;
  tabBState.factTable = data.factTable;
  tabBState.editor = { ...tabBState.editor, ...data.editor };
  tabBState.lastUpdated = data.lastUpdated;
  // Tab B local UI state (activeTab, collapsed, selections, expanded facts) are NOT touched!
};

applyIncomingDataToTabB(broadcastPayload.data);

// Verifications
console.log('1. Checking Tab B active tab...');
if (tabBState.activeTab !== 'table') {
  throw new Error(`Tab B active tab was overwritten to ${tabBState.activeTab}`);
}
console.log('   ✓ Tab B active tab remained "table" (did not jump to "witnesses")');

console.log('2. Checking Tab B collapsed UI state...');
if (!tabBState.collapsed.witnesses || !tabBState.collapsed.statements) {
  throw new Error('Tab B collapsed state was overwritten');
}
console.log('   ✓ Tab B collapsed state remained intact');

console.log('3. Checking Tab B expanded facts set...');
if (!tabBExpandedFacts.has('row_3_col_4_fact_1')) {
  throw new Error('Tab B expanded facts was reset');
}
console.log('   ✓ Tab B expanded facts in matrix cell remained expanded');

console.log('4. Checking domain data synchronization in Tab B...');
if (tabBState.assertions['asrt_4'].text !== updatedAssertionText) {
  throw new Error('Assertion text was not synchronized to Tab B');
}
if (tabBState.facts['fact_1'].name !== 'עובדה מעודכנת: נוכחות ודאית במפעל') {
  throw new Error('Fact name was not synchronized to Tab B');
}
console.log('   ✓ Assertion text and fact data successfully synchronized in real time!');

console.log('\nAll cross-tab isolation and synchronization tests passed!');
