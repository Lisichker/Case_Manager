// ==========================================================================
// WITNESSES TAB COMPONENT
// ==========================================================================

import { store } from '../store.js';
import { StatementModal } from './StatementModal.js';

export class WitnessesTab {
  constructor() {
    this.container = document.getElementById('witnesses-container');
    this.statementModal = new StatementModal();
    this.render();
  }

  render() {
    const state = store.getState();
    const witnesses = Object.values(state.witnesses);
    const selectedWitness = state.selectedWitnessId ? state.witnesses[state.selectedWitnessId] : null;

    // Statements of current witness
    const statements = selectedWitness && selectedWitness.statementIds
      ? selectedWitness.statementIds.map(sId => state.statements[sId]).filter(Boolean)
      : [];

    const selectedStatement = state.selectedStatementId ? state.statements[state.selectedStatementId] : null;

    // Assertions of selected statement
    const assertions = selectedStatement && selectedStatement.assertionIds
      ? selectedStatement.assertionIds.map(aId => state.assertions[aId]).filter(Boolean)
      : [];

    const isLocked = !!state.editor.isLocked;
    const isWitnessCollapsed = !!state.collapsed?.witnesses;
    const isStatementCollapsed = !!state.collapsed?.statements;

    this.container.innerHTML = `
      <!-- Column 1: Witnesses List -->
      <aside class="witness-column ${isWitnessCollapsed ? 'collapsed' : ''}" id="witness-col">
        <div class="panel-header">
          <div class="panel-title">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
            <span>רשימת עדים</span>
            <span class="panel-badge">${witnesses.length}</span>
          </div>
          <button class="mini-action-btn" id="btn-toggle-witnesses-col" title="${isWitnessCollapsed ? 'הרחב עמודת עדים' : 'צמצם עמודת עדים'}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="${isWitnessCollapsed ? 'm9 18 6-6-6-6' : 'm15 18-6-6 6-6'}"/>
            </svg>
          </button>
        </div>

        <div class="witness-list-scroll">
          ${witnesses.map(w => {
            const isSelected = w.id === state.selectedWitnessId;
            const stmtCount = (w.statementIds || []).length;
            return `
              <div class="witness-item ${isSelected ? 'active' : ''}" data-witness-id="${w.id}">
                <div class="witness-item-content">
                  <span class="witness-item-icon">${this.escapeHtml(w.name.charAt(0) || 'ע')}</span>
                  <span class="witness-item-name" data-witness-name-id="${w.id}" title="לחיצה כפולה לעריכת שם">${this.escapeHtml(w.name)}</span>
                  <span class="witness-item-count" title="${stmtCount} הודעות">${stmtCount}</span>
                </div>
                <div class="witness-item-actions">
                  <button class="mini-action-btn danger btn-delete-witness" data-witness-id="${w.id}" title="מחק עד">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            `;
          }).join('')}

          ${witnesses.length === 0 ? `
            <div style="padding: 24px 12px; text-align: center; color: var(--text-muted); font-size: 13px;">
              אין עדים עדיין.<br>לחץ על כפתור ה- <b>+</b> להוספה.
            </div>
          ` : ''}
        </div>

        <div class="list-bottom-bar">
          <button class="add-circle-btn" id="btn-add-witness" title="הוסף עד חדש">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </aside>

      <!-- Column 2: Statements List -->
      <aside class="statement-column ${isStatementCollapsed ? 'collapsed' : ''}" id="statement-col">
        <div class="panel-header">
          <div class="panel-title">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <span>הודעות ועדויות</span>
            <span class="panel-badge">${statements.length}</span>
          </div>
          <button class="mini-action-btn" id="btn-toggle-statements-col" title="${isStatementCollapsed ? 'הרחב עמודת הודעות' : 'צמצם עמודת הודעות'}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="${isStatementCollapsed ? 'm9 18 6-6-6-6' : 'm15 18-6-6 6-6'}"/>
            </svg>
          </button>
        </div>

        <div class="statement-list-scroll">
          ${!selectedWitness ? `
            <div style="padding: 30px 16px; text-align: center; color: var(--text-muted); font-size: 13px;">
              בחר עד מהרשימה משמאל לצפייה בהודעותיו.
            </div>
          ` : statements.length === 0 ? `
            <div style="padding: 30px 16px; text-align: center; color: var(--text-muted); font-size: 13px;">
              לא קיימות הודעות עבור עד זה.<br>לחץ על כפתור ה- <b>+</b> להוספת הודעה.
            </div>
          ` : statements.map(s => {
            const isSelected = s.id === state.selectedStatementId;
            const asrtCount = (s.assertionIds || []).length;
            return `
              <div class="statement-card ${isSelected ? 'active' : ''}" data-statement-id="${s.id}">
                <div class="statement-card-header">
                  <div class="statement-card-title">${this.escapeHtml(s.name)}</div>
                  <div class="statement-card-actions">
                    <button class="mini-action-btn btn-edit-statement" data-statement-id="${s.id}" title="ערוך פרטי הודעה">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </button>
                    <button class="mini-action-btn danger btn-delete-statement" data-statement-id="${s.id}" title="מחק הודעה">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                    </button>
                  </div>
                </div>

                <div class="statement-card-meta">
                  ${s.caseFileId ? `<span class="meta-tag exhibit" title="סימון בתיק">${this.escapeHtml(s.caseFileId)}</span>` : ''}
                  ${s.date ? `<span class="meta-tag" title="תאריך">${this.escapeHtml(s.date)}</span>` : ''}
                  ${s.time ? `<span class="meta-tag" title="שעה">${this.escapeHtml(s.time)}</span>` : ''}
                  <span class="meta-tag" title="מספר טענות">${asrtCount} טענות</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="list-bottom-bar">
          <button class="add-circle-btn" id="btn-add-statement" title="הוסף הודעה חדשה לעד">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </aside>

      <!-- Column 3: Assertions Area -->
      <section class="assertions-column">
        <div class="panel-header">
          <div class="panel-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>טענות ועובדות מתוך ההודעה</span>
            ${selectedStatement ? `<span class="panel-badge">${assertions.length} טענות</span>` : ''}
          </div>

          ${selectedStatement ? `
            <div class="assertions-header-meta">
              <button class="btn btn-primary btn-sm" id="btn-add-assertion">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>הוסף טענה</span>
              </button>
            </div>
          ` : ''}
        </div>

        <div class="assertions-scroll">
          ${!selectedStatement ? `
            <div style="margin: 80px auto; text-align: center; max-width: 400px; color: var(--text-muted);">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px; opacity: 0.5;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>
              </svg>
              <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">לא נבחרה הודעה</h3>
              <p style="font-size: 13.5px;">בחר הודעה מרשימת ההודעות משמאל כדי לנהל את הטענות והעובדות המופיעות בה.</p>
            </div>
          ` : assertions.length === 0 ? `
            <div style="margin: 60px auto; text-align: center; max-width: 400px; color: var(--text-muted);">
              <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">אין עדיין טענות בהודעה זו</h3>
              <p style="font-size: 13.5px; margin-bottom: 16px;">הוסף טענה חדשה לחקירת העד, סווג אותה בצבע וציין עמוד ושורות.</p>
              <button class="btn btn-primary" id="btn-add-assertion-empty">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>הוסף טענה ראשונה</span>
              </button>
            </div>
          ` : assertions.map((asrt, index) => {
            const isFirst = index === 0;
            const isLast = index === assertions.length - 1;
            const color = asrt.color || 'green';

            return `
              <div class="assertion-card color-${color}" data-assertion-id="${asrt.id}">
                <!-- Top Row: Page/Rows on right, Name to left of it, Color & Order Controls on left -->
                <div class="assertion-card-top">
                  <div class="assertion-top-right">
                    <!-- Page and Rows in the top-right corner -->
                    <div class="assertion-page-rows" title="מיקום בהודעה: עמוד ושורות">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/></svg>
                      <input type="text" class="input-asrt-page-rows" data-assertion-id="${asrt.id}" value="עמ' ${this.escapeHtml(asrt.page || '1')}, ש' ${this.escapeHtml(asrt.lines || '1')}" placeholder="עמ' 1, ש' 1-5">
                    </div>

                    <!-- Name of the assertion (left from page/rows) -->
                    <input type="text" class="assertion-title-input input-asrt-name" data-assertion-id="${asrt.id}" value="${this.escapeHtml(asrt.name || '')}" placeholder="שם/כותרת הטענה...">
                  </div>

                  <!-- Controls: Color Picker & Up/Down Arrows -->
                  <div class="assertion-card-controls">
                    <!-- Color Picker: Green, Red, Yellow -->
                    <div class="color-picker-group" title="בחר צבע לטענה">
                      <button class="color-dot-btn green ${color === 'green' ? 'active' : ''}" data-assertion-id="${asrt.id}" data-color="green" title="ירוק - חיזוק/סיוע"></button>
                      <button class="color-dot-btn yellow ${color === 'yellow' ? 'active' : ''}" data-assertion-id="${asrt.id}" data-color="yellow" title="צהוב - ניטרלי/במחלוקת"></button>
                      <button class="color-dot-btn red ${color === 'red' ? 'active' : ''}" data-assertion-id="${asrt.id}" data-color="red" title="אדום - סתירה/שלילה"></button>
                    </div>

                    <!-- Move Up / Down -->
                    <div class="order-btn-group">
                      <button class="mini-action-btn btn-move-asrt-up" data-assertion-id="${asrt.id}" ${isFirst ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''} title="הזז טענה למעלה">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg>
                      </button>
                      <button class="mini-action-btn btn-move-asrt-down" data-assertion-id="${asrt.id}" ${isLast ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''} title="הזז טענה למטה">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                      </button>
                    </div>

                    <!-- Delete Button -->
                    <button class="mini-action-btn danger btn-delete-asrt" data-assertion-id="${asrt.id}" title="מחק טענה">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                    </button>
                  </div>
                </div>

                <!-- Text box of the text of the assertion -->
                <textarea class="assertion-text-area input-asrt-text" data-assertion-id="${asrt.id}" placeholder="ציטוט או תוכן הטענה מההודעה...">${this.escapeHtml(asrt.text || '')}</textarea>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const state = store.getState();

    // Toggle collapse columns
    document.getElementById('btn-toggle-witnesses-col')?.addEventListener('click', () => {
      store.toggleCollapse('witnesses');
      this.render();
    });

    document.getElementById('btn-toggle-statements-col')?.addEventListener('click', () => {
      store.toggleCollapse('statements');
      this.render();
    });

    // Select witness
    this.container.querySelectorAll('.witness-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.witness-item-actions') || e.target.tagName === 'INPUT') return;
        const wId = el.dataset.witnessId;
        store.selectWitness(wId);
        this.render();
      });
    });

    // Inline edit witness name on double click
    this.container.querySelectorAll('[data-witness-name-id]').forEach(el => {
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        if (state.editor.isLocked) return;
        const wId = el.dataset.witnessNameId;
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
            store.renameWitness(wId, newName);
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

    // Add witness
    document.getElementById('btn-add-witness')?.addEventListener('click', () => {
      const name = prompt('הזן שם עד חדש:', 'עד חדש');
      if (name && name.trim()) {
        const id = store.addWitness(name.trim());
        store.selectWitness(id);
        this.render();
      }
    });

    // Delete witness
    this.container.querySelectorAll('.btn-delete-witness').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wId = btn.dataset.witnessId;
        const wit = state.witnesses[wId];
        if (confirm(`האם למחוק את העד "${wit?.name || ''}" וכל הודעותיו?`)) {
          store.deleteWitness(wId);
          this.render();
        }
      });
    });

    // Select statement
    this.container.querySelectorAll('.statement-card').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.statement-card-actions')) return;
        const sId = el.dataset.statementId;
        store.selectStatement(sId);
        this.render();
      });
    });

    // Add statement
    document.getElementById('btn-add-statement')?.addEventListener('click', () => {
      if (!state.selectedWitnessId) {
        alert('אנא בחר עד תחילה');
        return;
      }
      const name = prompt('הזן שם להודעה החדשה:', 'הודעה במשטרה');
      if (name && name.trim()) {
        const sId = store.addStatement(state.selectedWitnessId, name.trim());
        this.render();
        // Prompt to open edit modal immediately
        this.statementModal.open(sId);
      }
    });

    // Edit statement modal button
    this.container.querySelectorAll('.btn-edit-statement').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sId = btn.dataset.statementId;
        this.statementModal.open(sId);
      });
    });

    // Delete statement
    this.container.querySelectorAll('.btn-delete-statement').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sId = btn.dataset.statementId;
        const stmt = state.statements[sId];
        if (confirm(`האם למחוק את ההודעה "${stmt?.name || ''}"?`)) {
          store.deleteStatement(sId);
          this.render();
        }
      });
    });

    // Add assertion
    const addAssertionHandler = () => {
      if (!state.selectedStatementId) return;
      store.addAssertion(state.selectedStatementId, {
        name: 'טענה חדשה',
        page: '1',
        lines: '1-5',
        color: 'green',
        text: ''
      });
      this.render();
    };

    document.getElementById('btn-add-assertion')?.addEventListener('click', addAssertionHandler);
    document.getElementById('btn-add-assertion-empty')?.addEventListener('click', addAssertionHandler);

    // Color picker
    this.container.querySelectorAll('.color-dot-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const aId = btn.dataset.assertionId;
        const color = btn.dataset.color;
        store.updateAssertion(aId, { color });
        this.render();
      });
    });

    // Move assertion Up / Down
    this.container.querySelectorAll('.btn-move-asrt-up').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const aId = btn.dataset.assertionId;
        store.moveAssertion(state.selectedStatementId, aId, 'up');
        this.render();
      });
    });

    this.container.querySelectorAll('.btn-move-asrt-down').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const aId = btn.dataset.assertionId;
        store.moveAssertion(state.selectedStatementId, aId, 'down');
        this.render();
      });
    });

    // Delete assertion
    this.container.querySelectorAll('.btn-delete-asrt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const aId = btn.dataset.assertionId;
        if (confirm('האם למחוק טענה זו?')) {
          store.deleteAssertion(aId);
          this.render();
        }
      });
    });

    // Assertion title input
    this.container.querySelectorAll('.input-asrt-name').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const aId = inp.dataset.assertionId;
        store.updateAssertion(aId, { name: e.target.value.trim() });
      });
    });

    // Assertion page and rows input parsing
    this.container.querySelectorAll('.input-asrt-page-rows').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const aId = inp.dataset.assertionId;
        const val = e.target.value;
        // Parse simple string like "עמ' 2, ש' 4-10" or "2, 4-10"
        let page = '1';
        let lines = '1-5';
        const clean = val.replace(/עמ'?|ש'?|שורות|עמוד/g, '').trim();
        const parts = clean.split(/[,;]/);
        if (parts[0]) page = parts[0].trim();
        if (parts[1]) lines = parts[1].trim();

        store.updateAssertion(aId, { page, lines });
      });
    });

    // Assertion transcript text
    this.container.querySelectorAll('.input-asrt-text').forEach(textarea => {
      textarea.addEventListener('change', (e) => {
        const aId = textarea.dataset.assertionId;
        store.updateAssertion(aId, { text: e.target.value });
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
