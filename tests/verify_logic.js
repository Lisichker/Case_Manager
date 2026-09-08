// Verification tests for Case Manager logic
import { getSampleCaseData } from '../src/js/store.js';

console.log('Running Court Case Manager Tests...');
const data = getSampleCaseData();

// Editor
if (!data.editor || !data.editor.username) throw new Error('Missing editor');

// Assertions check
for (const a of Object.values(data.assertions)) {
  if (!['green', 'yellow', 'red'].includes(a.color)) throw new Error(`Invalid color: ${a.color}`);
  if (!a.page || !a.lines) throw new Error(`Missing page or lines in assertion ${a.id}`);
  if (typeof a.order !== 'number') throw new Error(`Assertion missing order index`);
}

// Facts check
for (const f of Object.values(data.facts)) {
  if (typeof f.proved !== 'boolean' || typeof f.disproved !== 'boolean') {
    throw new Error(`Invalid proved/disproved in fact ${f.id}`);
  }
}

// Fact Table check
if (data.factTable.columns.length < 1 || data.factTable.rows.length < 1) {
  throw new Error('Fact table empty');
}

console.log('✓ All integrity tests passed successfully.');
