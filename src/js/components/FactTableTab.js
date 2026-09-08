// ==========================================================================
// FACT TABLE TAB COMPONENT (טבלת העובדות)
// ==========================================================================

import { store } from '../store.js';

export class FactTableTab {
  constructor() {
    this.container = document.getElementById('table-container');
    this.expandedFacts = new Set(); // track expanded fact IDs in cells
    this.render();
  }

  render() {
    const state = store.getState();
    const table = state.factTable;
    const columns = table.columns || [];
    const rows = table.rows || [];

    this.container.innerHTML = `
      <div class="table-toolbar">
        <div class="table-toolbar-group">
          <button class="btn btn-primary btn-sm" id="btn-add-table-col">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>הוסף עמודה</span>
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-add-table-row">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>הוסף שורה</span>
          </button>
        </div>

        <div style="font-size: 13px; color: var(--text-muted);">
          💡 לחיצה כפולה על עובדה במשבצת תרחיב אותה לצפייה ועדכון טענות בעד/נגד וסטטוס הוכחה.
        </div>
      </div>

      <div class="table-scroll-wrapper">
        <table class="fact-matrix-table">
          <thead>
            <tr>
              <!-- Top-right corner cell -->
              <th class="matrix-th matrix-corner">
                שורה \ עמודה
              </th>

              <!-- Column Headers -->
              ${columns.map((col, cIdx) => {
                const isFirst = cIdx === 0;
                const isLast = cIdx === columns.length - 1;
                return `
                  <th class="matrix-th matrix-col-header" data-col-id="${col.id}">
                    <div class="col-header-inner">
                      <input type="text" class="col-header-title input-col-title" data-col-id="${col.id}" value="${this.escapeHtml(col.name)}" title="ערוך שם עמודה">
                      <div class="statement-card-actions" style="opacity: 1; display: flex; gap: 2px;">
                        <!-- Note RTL: Right is lower index, Left is higher index -->
                        <button class="mini-action-btn btn-move-col-right" data-col-id="${col.id}" ${isFirst ? 'disabled style="opacity:0.3;"' : ''} title="הזז עמודה ימינה">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
                        </button>
                        <button class="mini-action-btn btn-move-col-left" data-col-id="${col.id}" ${isLast ? 'disabled style="opacity:0.3;"' : ''} title="הזז עמודה שמאלה">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
                        </button>
                        <button class="mini-action-btn danger btn-delete-col" data-col-id="${col.id}" title="מחק עמודה">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                    </div>
                  </th>
                `;
              }).join('')}
            </tr>
          </thead>
          <tbody>
            <!-- Rows -->
            ${rows.map((row, rIdx) => {
              const isFirstRow = rIdx === 0;
              const isLastRow = rIdx === rows.length - 1;

              return `
                <tr>
                  <!-- Row Header -->
                  <td class="matrix-td matrix-row-header" data-row-id="${row.id}">
                    <div class="row-header-inner">
                      <input type="text" class="row-header-title input-row-title" data-row-id="${row.id}" value="${this.escapeHtml(row.name)}" title="ערוך שם שורה">
                      <div class="statement-card-actions" style="opacity: 1; display: flex; flex-direction: column; gap: 2px;">
                        <button class="mini-action-btn btn-move-row-up" data-row-id="${row.id}" ${isFirstRow ? 'disabled style="opacity:0.3;"' : ''} title="הזז שורה למעלה">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg>
                        </button>
                        <button class="mini-action-btn btn-move-row-down" data-row-id="${row.id}" ${isLastRow ? 'disabled style="opacity:0.3;"' : ''} title="הזז שורה למטה">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <button class="mini-action-btn danger btn-delete-row" data-row-id="${row.id}" title="מחק שורה">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                    </div>
                  </td>

                  <!-- Table Squares / Cells -->
                  ${columns.map(col => {
                    const cellKey = `${row.id}_${col.id}`;
                    const factIds = table.cells[cellKey] || [];
                    const cellFacts = factIds.map(fId => state.facts[fId]).filter(Boolean);

                    return `
                      <td class="matrix-td matrix-cell" data-row-id="${row.id}" data-col-id="${col.id}" data-cell-key="${cellKey}">
                        <div class="matrix-cell-content">
                          ${cellFacts.map(fact => this.renderCellFact(row.id, col.id, fact)).join('')}
                        </div>

                        <!-- Small plus button in the bottom right of the square -->
                        <button class="matrix-add-fact-btn btn-cell-add-fact" data-row-id="${row.id}" data-col-id="${col.id}" title="הוסף עובדה למשבצת זו">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </button>
                      </td>
                    `;
                  }).join('')}
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    this.attachEvents();
  }

  renderCellFact(rowId, colId, fact) {
    const isExpanded = this.expandedFacts.has(`${rowId}_${colId}_${fact.id}`);
    const strengthening = fact.strengtheningAssertions || [];
    const denying = fact.denyingAssertions || [];

    return `
      <div class="cell-fact-card ${isExpanded ? 'expanded' : ''}" data-row-id="${rowId}" data-col-id="${colId}" data-fact-id="${fact.id}">
        <!-- Compact Header: Double-click expands -->
        <div class="cell-fact-compact" data-action="toggle-expand" data-row-id="${rowId}" data-col-id="${colId}" data-fact-id="${fact.id}" title="לחיצה כפולה להרחבה / צמצום">
          <span class="cell-fact-name">${this.escapeHtml(fact.name)}</span>
          <div class="cell-fact-badges">
            ${fact.proved ? '<span class="badge-tag proved">הוכח</span>' : ''}
            ${fact.disproved ? '<span class="badge-tag disproved">הופרך</span>' : ''}
            <button class="mini-action-btn danger btn-remove-fact-from-cell" data-row-id="${rowId}" data-col-id="${colId}" data-fact-id="${fact.id}" title="הסר ממשבצת">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <!-- Expanded View on Double Click -->
        ${isExpanded ? `
          <div class="cell-fact-expanded">
            <!-- Fact Status Checkboxes Accessible Here -->
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px;">
              <span style="font-weight: 700; color: var(--text-secondary);">סטטוס עובדה:</span>
              <div class="status-checks-group">
                <label class="status-checkbox-label proved ${fact.proved ? 'checked' : ''}" style="font-size: 11px; padding: 2px 6px;">
                  <input type="checkbox" class="cell-fact-status-chk" data-fact-id="${fact.id}" data-status="proved" ${fact.proved ? 'checked' : ''}>
                  <span>הוכח</span>
                </label>
                <label class="status-checkbox-label disproved ${fact.disproved ? 'checked' : ''}" style="font-size: 11px; padding: 2px 6px;">
                  <input type="checkbox" class="cell-fact-status-chk" data-fact-id="${fact.id}" data-status="disproved" ${fact.disproved ? 'checked' : ''}>
                  <span>הופרך</span>
                </label>
              </div>
            </div>

            <!-- Top Half: For / Strengthening -->
            <div class="cell-fact-split-half strengthening">
              <div class="cell-fact-split-title">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m18 15-6-6-6 6"/></svg>
                <span>טענות בעד העובדה (${strengthening.length})</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                ${strengthening.length === 0 ? '<span style="color: var(--text-muted); font-size: 11px;">אין טענות בעד</span>' : ''}
                ${strengthening.map(item => this.renderCellAssertionRow(fact.id, item, 'strengthening')).join('')}
              </div>
            </div>

            <!-- Bottom Half: Against / Denying -->
            <div class="cell-fact-split-half denying">
              <div class="cell-fact-split-title">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
                <span>טענות נגד העובדה (${denying.length})</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                ${denying.length === 0 ? '<span style="color: var(--text-muted); font-size: 11px;">אין טענות נגד</span>' : ''}
                ${denying.map(item => this.renderCellAssertionRow(fact.id, item, 'denying')).join('')}
              </div>
            </div>

            <button class="btn btn-secondary btn-sm btn-collapse-cell-fact" data-row-id="${rowId}" data-col-id="${colId}" data-fact-id="${fact.id}" style="width: 100%; margin-top: 4px; font-size: 11px;">
              צמצם תצוגה ▲
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderCellAssertionRow(factId, item, type) {
    const state = store.getState();
    const asrt = state.assertions[item.assertionId];
    if (!asrt) return '';
    const color = asrt.color || 'green';

    return `
      <div style="padding: 4px 6px; border-radius: var(--radius-xs); border: 1px solid var(--border-subtle); background-color: var(--bg-surface); display: flex; align-items: center; justify-content: space-between; gap: 6px;">
        <div style="display: flex; align-items: center; gap: 5px; flex: 1; overflow: hidden;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--asrt-${color}-pill); flex-shrink: 0;"></span>
          <span style="font-weight: 600; font-size: 11.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${this.escapeHtml(asrt.name)}</span>
          <span style="font-size: 10px; color: var(--text-muted); flex-shrink: 0;">(עמ' ${this.escapeHtml(asrt.page)})</span>
        </div>

        <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
          <label class="status-checkbox-label proved ${item.proved ? 'checked' : ''}" style="font-size: 10px; padding: 1px 5px;" title="הוכח">
            <input type="checkbox" class="cell-asrt-status-chk" data-fact-id="${factId}" data-asrt-id="${asrt.id}" data-type="${type}" data-status="proved" ${item.proved ? 'checked' : ''}>
            <span>הוכח</span>
          </label>
          <label class="status-checkbox-label disproved ${item.disproved ? 'checked' : ''}" style="font-size: 10px; padding: 1px 5px;" title="הופרך">
            <input type="checkbox" class="cell-asrt-status-chk" data-fact-id="${factId}" data-asrt-id="${asrt.id}" data-type="${type}" data-status="disproved" ${item.disproved ? 'checked' : ''}>
            <span>הופרך</span>
          </label>
        </div>
      </div>
    `;
  }

  attachEvents() {
    // Add column
    document.getElementById('btn-add-table-col')?.addEventListener('click', () => {
      const name = prompt('הזן שם לעמודה החדשה:', 'עמודה חדשה');
      if (name && name.trim()) {
        store.addTableColumn(name.trim());
        this.render();
      }
    });

    // Add row
    document.getElementById('btn-add-table-row')?.addEventListener('click', () => {
      const name = prompt('הזן שם לשורה החדשה:', 'שורה חדשה');
      if (name && name.trim()) {
        store.addTableRow(name.trim());
        this.render();
      }
    });

    // Rename column
    this.container.querySelectorAll('.input-col-title').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const colId = inp.dataset.colId;
        store.renameTableColumn(colId, e.target.value.trim());
      });
    });

    // Rename row
    this.container.querySelectorAll('.input-row-title').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const rowId = inp.dataset.rowId;
        store.renameTableRow(rowId, e.target.value.trim());
      });
    });

    // Move column left/right
    this.container.querySelectorAll('.btn-move-col-right').forEach(btn => {
      btn.addEventListener('click', () => {
        store.moveTableColumn(btn.dataset.colId, 'right');
        this.render();
      });
    });

    this.container.querySelectorAll('.btn-move-col-left').forEach(btn => {
      btn.addEventListener('click', () => {
        store.moveTableColumn(btn.dataset.colId, 'left');
        this.render();
      });
    });

    // Delete column
    this.container.querySelectorAll('.btn-delete-col').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('האם למחוק עמודה זו וכל שיוכי העובדות שבה?')) {
          store.deleteTableColumn(btn.dataset.colId);
          this.render();
        }
      });
    });

    // Move row up/down
    this.container.querySelectorAll('.btn-move-row-up').forEach(btn => {
      btn.addEventListener('click', () => {
        store.moveTableRow(btn.dataset.rowId, 'up');
        this.render();
      });
    });

    this.container.querySelectorAll('.btn-move-row-down').forEach(btn => {
      btn.addEventListener('click', () => {
        store.moveTableRow(btn.dataset.rowId, 'down');
        this.render();
      });
    });

    // Delete row
    this.container.querySelectorAll('.btn-delete-row').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('האם למחוק שורה זו וכל שיוכי העובדות שבה?')) {
          store.deleteTableRow(btn.dataset.rowId);
          this.render();
        }
      });
    });

    // Add fact to cell (+ button in bottom right of square)
    this.container.querySelectorAll('.btn-cell-add-fact').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rowId = btn.dataset.rowId;
        const colId = btn.dataset.colId;
        this.openAddFactToCellMenu(rowId, colId);
      });
    });

    // Double-click on cell-fact-compact to expand/collapse
    this.container.querySelectorAll('.cell-fact-compact').forEach(el => {
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const { rowId, colId, factId } = el.dataset;
        const key = `${rowId}_${colId}_${factId}`;
        if (this.expandedFacts.has(key)) {
          this.expandedFacts.delete(key);
        } else {
          this.expandedFacts.add(key);
        }
        this.render();
      });
    });

    // Collapse button inside expanded view
    this.container.querySelectorAll('.btn-collapse-cell-fact').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const { rowId, colId, factId } = btn.dataset;
        this.expandedFacts.delete(`${rowId}_${colId}_${factId}`);
        this.render();
      });
    });

    // Remove fact from cell
    this.container.querySelectorAll('.btn-remove-fact-from-cell').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const { rowId, colId, factId } = btn.dataset;
        store.removeFactFromCell(rowId, colId, factId);
        this.expandedFacts.delete(`${rowId}_${colId}_${factId}`);
        this.render();
      });
    });

    // Fact status check inside cell
    this.container.querySelectorAll('.cell-fact-status-chk').forEach(chk => {
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

    // Assertion status check inside cell
    this.container.querySelectorAll('.cell-asrt-status-chk').forEach(chk => {
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
  }

  openAddFactToCellMenu(rowId, colId) {
    const state = store.getState();
    const cellKey = `${rowId}_${colId}`;
    const alreadyInCell = state.factTable.cells[cellKey] || [];
    const allFacts = Object.values(state.facts);
    const availableFacts = allFacts.filter(f => !alreadyInCell.includes(f.id));

    const container = document.getElementById('modal-container');
    if (!container) return;

    const html = `
      <div class="modal-card" style="max-width: 500px;">
        <div class="modal-header">
          <div class="modal-title">הוספת עובדה למשבצת בטבלה</div>
          <button class="mini-action-btn" id="cell-menu-close" title="סגור">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label class="form-label">בחר מתוך עובדות קיימות במערכת:</label>
            <button class="btn btn-primary btn-sm" id="btn-create-and-add-fact">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>צור עובדה חדשה ישירות</span>
            </button>
          </div>

          <div style="max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding: 4px;">
            ${availableFacts.length === 0 ? `
              <div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 13px;">
                אין עובדות זמינות נוספות במערכת.<br>ניתן ליצור עובדה חדשה כעת.
              </div>
            ` : availableFacts.map(f => `
              <div class="fact-assertion-row" style="cursor: pointer; padding: 8px 10px;" data-pick-fact-id="${f.id}">
                <span style="font-weight: 600; font-size: 13.5px; color: var(--text-primary); flex: 1;">${this.escapeHtml(f.name)}</span>
                <div style="display: flex; gap: 4px;">
                  ${f.proved ? '<span class="badge-tag proved">הוכח</span>' : ''}
                  ${f.disproved ? '<span class="badge-tag disproved">הופרך</span>' : ''}
                </div>
                <button class="btn btn-secondary btn-sm" style="margin-right: 6px;">הוסף</button>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="cell-menu-cancel">סגור</button>
        </div>
      </div>
    `;

    container.innerHTML = html;
    container.classList.remove('hidden');

    const close = () => {
      container.classList.add('hidden');
      container.innerHTML = '';
    };

    document.getElementById('cell-menu-close')?.addEventListener('click', close);
    document.getElementById('cell-menu-cancel')?.addEventListener('click', close);

    // Pick existing fact
    container.querySelectorAll('[data-pick-fact-id]').forEach(el => {
      el.addEventListener('click', () => {
        const factId = el.dataset.pickFactId;
        store.addFactToCell(rowId, colId, factId);
        close();
        this.render();
      });
    });

    // Create brand new fact directly
    document.getElementById('btn-create-and-add-fact')?.addEventListener('click', () => {
      const name = prompt('הזן שם לעובדה החדשה:');
      if (name && name.trim()) {
        const factId = store.addFact(state.selectedFactSheetId || null, name.trim());
        store.addFactToCell(rowId, colId, factId);
        close();
        this.render();
      }
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
