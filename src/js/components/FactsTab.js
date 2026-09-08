// ==========================================================================
// FACTS TAB COMPONENT (עובדות)
// ==========================================================================

import { store } from '../store.js';
import { AssertionPickerModal } from './AssertionPickerModal.js';
import { AssertionEditModal } from './AssertionEditModal.js';
import { FactSheetModal } from './FactSheetModal.js';

export class FactsTab {
  constructor() {
    this.container = document.getElementById('facts-container');
    this.assertionPickerModal = new AssertionPickerModal();
    this.assertionEditModal = new AssertionEditModal();
    this.factSheetModal = new FactSheetModal();
    this.collapsedFacts = new Set();
    this.render();
  }

  render() {
    const state = store.getState();
    const sheets = Object.values(state.factSheets);
    const selectedSheet = state.selectedFactSheetId ? state.factSheets[state.selectedFactSheetId] : null;

    // Facts in selected sheet
    const facts = selectedSheet && selectedSheet.factIds
      ? selectedSheet.factIds.map(fId => state.facts[fId]).filter(Boolean)
      : [];

    const isCollapsed = !!state.collapsed?.factSheets;

    this.container.innerHTML = `
      <!-- Column 1: Fact Sheets List -->
      <aside class="fact-sheet-column ${isCollapsed ? 'collapsed' : ''}" id="sheet-col">
        <div class="panel-header">
          <div class="panel-title">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/>
            </svg>
            <span>גיליונות עובדות</span>
            <span class="panel-badge">${sheets.length}</span>
          </div>
          <button class="mini-action-btn" id="btn-toggle-sheet-col" title="${isCollapsed ? 'הרחב עמודת גיליונות' : 'צמצם עמודת גיליונות'}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="${isCollapsed ? 'm9 18 6-6-6-6' : 'm15 18-6-6 6-6'}"/>
            </svg>
          </button>
        </div>

        <div class="sheet-list-scroll">
          ${sheets.map(sh => {
            const isSelected = sh.id === state.selectedFactSheetId;
            const factCount = (sh.factIds || []).length;
            return `
              <div class="sheet-item ${isSelected ? 'active' : ''}" data-sheet-id="${sh.id}">
                <div class="sheet-item-content">
                  <span class="sheet-item-name" data-sheet-name-id="${sh.id}" title="לחיצה כפולה לעריכת שם">${this.escapeHtml(sh.name)}</span>
                  <span class="sheet-item-count" title="${factCount} עובדות בגיליון">${factCount}</span>
                </div>
                <div class="sheet-item-actions witness-item-actions">
                  <button class="mini-action-btn btn-edit-sheet" data-sheet-id="${sh.id}" title="ערוך פרטי גיליון עובדות">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                  </button>
                  <button class="mini-action-btn danger btn-delete-sheet" data-sheet-id="${sh.id}" title="מחק גיליון עובדות">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                  </button>
                </div>
              </div>
            `;
          }).join('')}

          ${sheets.length === 0 ? `
            <div style="padding: 24px 12px; text-align: center; color: var(--text-muted); font-size: 13px;">
              אין עדיין גיליונות עובדות.<br>לחץ על כפתור ה- <b>+</b> להוספה.
            </div>
          ` : ''}
        </div>

        <div class="list-bottom-bar">
          <button class="add-circle-btn" id="btn-add-sheet" title="הוסף גיליון עובדות חדש">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </aside>

      <!-- Column 2: Facts in Selected Sheet -->
      <section class="facts-main-area">
        <div class="panel-header">
          <div class="panel-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/>
            </svg>
            <span>${selectedSheet ? `עובדות בגיליון: ${this.escapeHtml(selectedSheet.name)}` : 'עובדות'}</span>
            ${selectedSheet ? `<span class="panel-badge">${facts.length} עובדות</span>` : ''}
          </div>

          ${selectedSheet ? `
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="btn btn-secondary btn-sm" id="btn-link-existing-fact" title="שיוך עובדה שכבר קיימת בגיליון אחר">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                <span>קשר עובדה קיימת</span>
              </button>
              <button class="btn btn-primary btn-sm" id="btn-add-fact">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>הוסף עובדה חדשה</span>
              </button>
            </div>
          ` : ''}
        </div>

        <div class="facts-scroll">
          ${!selectedSheet ? `
            <div style="margin: 80px auto; text-align: center; max-width: 400px; color: var(--text-muted);">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px; opacity: 0.5;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>
              </svg>
              <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">לא נבחר גיליון עובדות</h3>
              <p style="font-size: 13.5px;">בחר גיליון מהרשימה משמאל או צור גיליון חדש לניהול העובדות.</p>
            </div>
          ` : facts.length === 0 ? `
            <div style="margin: 60px auto; text-align: center; max-width: 400px; color: var(--text-muted);">
              <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">אין עובדות בגיליון זה</h3>
              <p style="font-size: 13.5px; margin-bottom: 16px;">צור עובדה חדשה או קשר עובדה קיימת מגיליון אחר.</p>
              <button class="btn btn-primary" id="btn-add-fact-empty">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>הוסף עובדה ראשונה</span>
              </button>
            </div>
          ` : facts.map(fact => {
            const strengthening = fact.strengtheningAssertions || [];
            const denying = fact.denyingAssertions || [];
            const isFactCollapsed = this.collapsedFacts.has(fact.id);

            return `
              <div class="fact-card ${isFactCollapsed ? 'collapsed' : ''}" data-fact-id="${fact.id}">
                <!-- Fact Header: Name on top right, "proved" / "disproved" checkboxes on left -->
                <div class="fact-card-header">
                  <!-- Right: Name of the fact + collapse toggle button -->
                  <div class="fact-header-right">
                    <button class="btn-toggle-fact-collapse" data-fact-id="${fact.id}" title="${isFactCollapsed ? 'הרחב עובדה' : 'צמצם עובדה'}">
                      <svg class="fact-collapse-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m18 15-6-6-6 6"/></svg>
                    </button>
                    <input type="text" class="fact-name-input input-fact-name" data-fact-id="${fact.id}" value="${this.escapeHtml(fact.name || '')}" placeholder="שם העובדה...">
                  </div>

                  <!-- Left: Checkboxes for "proved" / "disproved" -->
                  <div class="status-checks-group">
                    <label class="status-checkbox-label proved ${fact.proved ? 'checked' : ''}" title="סמן כהוכח">
                      <input type="checkbox" class="fact-status-chk" data-fact-id="${fact.id}" data-status="proved" ${fact.proved ? 'checked' : ''}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>הוכח</span>
                    </label>

                    <label class="status-checkbox-label disproved ${fact.disproved ? 'checked' : ''}" title="סמן כהופרך">
                      <input type="checkbox" class="fact-status-chk" data-fact-id="${fact.id}" data-status="disproved" ${fact.disproved ? 'checked' : ''}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      <span>הופרך</span>
                    </label>

                    <button class="mini-action-btn danger btn-delete-fact" data-fact-id="${fact.id}" title="מחק עובדה">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                    </button>
                  </div>
                </div>

                <!-- Two-part split body -->
                <div class="fact-split-body">
                  <!-- Top Part: Strengthening Assertions -->
                  <div class="fact-half strengthening" data-fact-id="${fact.id}" data-half="strengthening" title="לחץ להוספת טענה מחזקת">
                    <div class="fact-half-header">
                      <span class="fact-half-title">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#166534" stroke-width="2.5"><path d="m18 15-6-6-6 6"/></svg>
                        <span>טענות מחזקות את העובדה (${strengthening.length})</span>
                      </span>
                      <button class="btn btn-secondary btn-sm btn-add-assertion-to-fact" data-fact-id="${fact.id}" data-type="strengthening">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        <span>הוסף טענה מחזקת</span>
                      </button>
                    </div>

                    <div class="fact-assertions-list">
                      ${strengthening.length === 0 ? `
                        <div style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 12.5px; border: 1px dashed var(--border-subtle); border-radius: var(--radius-xs); cursor: pointer;">
                          לחץ כאן או על הכפתור כדי לבחור טענה מחזקת מתוך עדויות והודעות
                        </div>
                      ` : strengthening.map(item => this.renderFactAssertionRow(fact.id, item, 'strengthening')).join('')}
                    </div>
                  </div>

                  <!-- Bottom Part: Denying Assertions -->
                  <div class="fact-half denying" data-fact-id="${fact.id}" data-half="denying" title="לחץ להוספת טענה מפריכה">
                    <div class="fact-half-header">
                      <span class="fact-half-title">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#991b1b" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
                        <span>טענות מפריכות / סותרות את העובדה (${denying.length})</span>
                      </span>
                      <button class="btn btn-secondary btn-sm btn-add-assertion-to-fact" data-fact-id="${fact.id}" data-type="denying">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        <span>הוסף טענה מפריכה</span>
                      </button>
                    </div>

                    <div class="fact-assertions-list">
                      ${denying.length === 0 ? `
                        <div style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 12.5px; border: 1px dashed var(--border-subtle); border-radius: var(--radius-xs); cursor: pointer;">
                          לחץ כאן או על הכפתור כדי לבחור טענה מפריכה / סותרת מתוך עדויות והודעות
                        </div>
                      ` : denying.map(item => this.renderFactAssertionRow(fact.id, item, 'denying')).join('')}
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    `;

    this.attachEvents();
  }

  renderFactAssertionRow(factId, item, type) {
    const state = store.getState();
    const asrt = state.assertions[item.assertionId];
    if (!asrt) return '';

    const stmt = state.statements[asrt.statementId];
    const color = asrt.color || 'green';

    return `
      <div class="fact-assertion-row color-${color}" style="border-right: 4px solid var(--asrt-${color}-pill);">
        <div class="fact-assertion-content">
          <div class="fact-assertion-meta">
            <span style="font-weight: 700; color: var(--text-primary);">${this.escapeHtml(asrt.name || 'טענה')}</span>
            <span>•</span>
            <span class="meta-tag">${this.escapeHtml(stmt?.name || 'הודעה')}</span>
            ${stmt?.caseFileId ? `<span class="meta-tag exhibit">${this.escapeHtml(stmt.caseFileId)}</span>` : ''}
            <span class="meta-tag">עמ' ${this.escapeHtml(asrt.page || '1')}, ש' ${this.escapeHtml(asrt.lines || '1')}</span>
          </div>
          <div class="fact-assertion-text">
            ${this.escapeHtml(asrt.text || '')}
          </div>
        </div>

        <!-- Left: Action buttons (edit modal + jump to witness) & status checkboxes -->
        <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
          <div class="fact-assertion-actions">
            <button class="btn-quick-edit-asrt" data-asrt-id="${asrt.id}" title="ערוך טענה בחלון קופץ">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </button>
            <button class="btn-jump-to-witness" data-asrt-id="${asrt.id}" title="עבור לעדות בלשונית עדים">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </button>
          </div>

          <label class="status-checkbox-label proved ${item.proved ? 'checked' : ''}" style="font-size: 11.5px; padding: 2px 7px;" title="סמן טענה זו כהוכחה">
            <input type="checkbox" class="asrt-in-fact-status-chk" data-fact-id="${factId}" data-asrt-id="${asrt.id}" data-type="${type}" data-status="proved" ${item.proved ? 'checked' : ''}>
            <span>הוכח</span>
          </label>

          <label class="status-checkbox-label disproved ${item.disproved ? 'checked' : ''}" style="font-size: 11.5px; padding: 2px 7px;" title="סמן טענה זו כהופרכה">
            <input type="checkbox" class="asrt-in-fact-status-chk" data-fact-id="${factId}" data-asrt-id="${asrt.id}" data-type="${type}" data-status="disproved" ${item.disproved ? 'checked' : ''}>
            <span>הופרך</span>
          </label>

          <button class="mini-action-btn danger btn-remove-asrt-from-fact" data-fact-id="${factId}" data-asrt-id="${asrt.id}" data-type="${type}" title="הסר טענה מעובדה זו">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    `;
  }

  attachEvents() {
    const state = store.getState();

    // Toggle collapse fact sheets
    document.getElementById('btn-toggle-sheet-col')?.addEventListener('click', () => {
      store.toggleCollapse('factSheets');
      this.render();
    });

    // Select sheet
    this.container.querySelectorAll('.sheet-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.witness-item-actions') || e.target.closest('.sheet-item-actions') || e.target.tagName === 'INPUT') return;
        const sId = el.dataset.sheetId;
        store.selectFactSheet(sId);
        this.render();
      });
    });

    // Inline edit sheet name on double click
    this.container.querySelectorAll('[data-sheet-name-id]').forEach(el => {
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        if (store.isTabLocked('facts')) return;
        const sId = el.dataset.sheetNameId;
        const currentName = el.textContent || '';
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentName;
        input.className = 'form-input';
        input.style.padding = '2px 6px';
        input.style.height = '28px';
        input.style.fontSize = '14px';

        const save = () => {
          const newName = input.value.trim();
          if (newName && newName !== currentName) {
            store.renameFactSheet(sId, newName);
          }
          this.render();
        };

        input.addEventListener('blur', save);
        input.addEventListener('keydown', (ke) => {
          if (ke.key === 'Enter') save();
          if (ke.key === 'Escape') this.render();
        });

        el.replaceWith(input);
        input.focus();
        input.select();
      });
    });

    // Add sheet
    document.getElementById('btn-add-sheet')?.addEventListener('click', () => {
      const name = prompt('הזן שם לגיליון עובדות חדש:', 'גיליון עובדות חדש');
      if (name && name.trim()) {
        store.addFactSheet(name.trim());
        this.render();
      }
    });

    // Delete sheet
    this.container.querySelectorAll('.btn-delete-sheet').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sId = btn.dataset.sheetId;
        const sh = state.factSheets[sId];
        if (confirm(`האם למחוק את גיליון העובדות "${sh?.name || ''}"?`)) {
          store.deleteFactSheet(sId);
          this.render();
        }
      });
    });

    // Add fact
    const addFactHandler = () => {
      if (!state.selectedFactSheetId) return;
      const name = prompt('הזן שם לעובדה החדשה:', 'עובדה חדשה');
      if (name && name.trim()) {
        store.addFact(state.selectedFactSheetId, name.trim());
        this.render();
      }
    };

    document.getElementById('btn-add-fact')?.addEventListener('click', addFactHandler);
    document.getElementById('btn-add-fact-empty')?.addEventListener('click', addFactHandler);

    // Link existing fact (shared facts between sheets)
    document.getElementById('btn-link-existing-fact')?.addEventListener('click', () => {
      if (!state.selectedFactSheetId) return;
      const allFacts = Object.values(state.facts);
      const currentSheet = state.factSheets[state.selectedFactSheetId];
      const unlinkedFacts = allFacts.filter(f => !currentSheet.factIds.includes(f.id));

      if (unlinkedFacts.length === 0) {
        alert('כל העובדות הקיימות במערכת כבר מקושרות לגיליון זה');
        return;
      }

      const promptText = 'בחר עובדה לקישור (הזן מספר):\n\n' +
        unlinkedFacts.map((f, i) => `${i + 1}. ${f.name}`).join('\n');
      const choice = prompt(promptText);
      const idx = parseInt(choice, 10) - 1;
      if (!isNaN(idx) && unlinkedFacts[idx]) {
        store.linkFactToSheet(state.selectedFactSheetId, unlinkedFacts[idx].id);
        this.render();
      }
    });

    // Rename fact
    this.container.querySelectorAll('.input-fact-name').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const factId = inp.dataset.factId;
        store.renameFact(factId, e.target.value.trim());
      });
    });

    // Delete fact
    this.container.querySelectorAll('.btn-delete-fact').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const factId = btn.dataset.factId;
        const fact = state.facts[factId];
        if (confirm(`האם למחוק לחלוטין את העובדה "${fact?.name || ''}"?`)) {
          store.deleteFact(factId);
          this.render();
        }
      });
    });

    // Fact status checkboxes: proved / disproved
    this.container.querySelectorAll('.fact-status-chk').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const factId = chk.dataset.factId;
        const status = chk.dataset.status;
        const checked = chk.checked;
        if (status === 'proved') {
          store.setFactStatus(factId, { proved: checked, disproved: checked ? false : undefined });
        } else {
          store.setFactStatus(factId, { disproved: checked, proved: checked ? false : undefined });
        }
        this.render();
      });
    });

    // Open assertion picker modal on half click or button
    this.container.querySelectorAll('.btn-add-assertion-to-fact').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const factId = btn.dataset.factId;
        const type = btn.dataset.type;
        this.assertionPickerModal.open(factId, type);
      });
    });

    // Clicking anywhere on the empty half
    this.container.querySelectorAll('.fact-half').forEach(half => {
      half.addEventListener('click', (e) => {
        if (e.target.closest('.fact-assertion-row') || e.target.closest('.btn-add-assertion-to-fact')) return;
        const factId = half.dataset.factId;
        const type = half.dataset.half;
        this.assertionPickerModal.open(factId, type);
      });
    });

    // Assertion in fact status checkboxes
    this.container.querySelectorAll('.asrt-in-fact-status-chk').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const factId = chk.dataset.factId;
        const aId = chk.dataset.asrtId;
        const type = chk.dataset.type;
        const status = chk.dataset.status;
        const checked = chk.checked;

        if (status === 'proved') {
          store.setFactAssertionStatus(factId, aId, type, { proved: checked, disproved: checked ? false : undefined });
        } else {
          store.setFactAssertionStatus(factId, aId, type, { disproved: checked, proved: checked ? false : undefined });
        }
        this.render();
      });
    });

    // Remove assertion from fact
    this.container.querySelectorAll('.btn-remove-asrt-from-fact').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const factId = btn.dataset.factId;
        const aId = btn.dataset.asrtId;
        const type = btn.dataset.type;
        store.removeAssertionFromFact(factId, aId, type);
        this.render();
      });
    });

    // Edit fact sheet modal
    this.container.querySelectorAll('.btn-edit-sheet').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sId = btn.dataset.sheetId;
        this.factSheetModal.open(sId);
      });
    });

    // Toggle collapse fact card
    this.container.querySelectorAll('.btn-toggle-fact-collapse').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const factId = btn.dataset.factId;
        if (this.collapsedFacts.has(factId)) {
          this.collapsedFacts.delete(factId);
        } else {
          this.collapsedFacts.add(factId);
        }
        this.render();
      });
    });

    // Quick edit assertion in pop-up modal
    this.container.querySelectorAll('.btn-quick-edit-asrt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const aId = btn.dataset.asrtId;
        this.assertionEditModal.open(aId);
      });
    });

    // Jump to witness tab with assertion open
    this.container.querySelectorAll('.btn-jump-to-witness').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const aId = btn.dataset.asrtId;
        store.navigateToAssertion(aId);
      });
    });
  }

  escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }
}
