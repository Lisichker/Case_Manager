// ==========================================================================
// ASSERTION PICKER MODAL COMPONENT
// ==========================================================================

import { store } from '../store.js';

export class AssertionPickerModal {
  constructor() {
    this.container = document.getElementById('modal-container');
    this.currentFactId = null;
    this.currentType = 'strengthening'; // 'strengthening' | 'denying'
  }

  open(factId, type = 'strengthening') {
    this.currentFactId = factId;
    this.currentType = type;
    const state = store.getState();
    const fact = state.facts[factId];
    if (!fact) return;

    const statements = Object.values(state.statements);

    const typeTitle = type === 'strengthening'
      ? 'חיזוק / הוכחת העובדה'
      : 'הפרכה / שלילת העובדה';

    const html = `
      <div class="modal-card" style="max-width: 650px;">
        <div class="modal-header">
          <div>
            <div class="modal-title">בחירת טענה מהודעה לקישור</div>
            <div style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">
              יעד: <b>${typeTitle}</b> | עובדה: "${this.escapeHtml(fact.name)}"
            </div>
          </div>
          <button class="mini-action-btn" id="picker-modal-close" title="סגור">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">סנן לפי הודעה / עדות:</label>
            <select id="picker-stmt-filter" class="form-select">
              <option value="ALL">כל ההודעות והעדויות (${statements.length})</option>
              ${statements.map(s => `
                <option value="${s.id}">${this.escapeHtml(s.name)} ${s.caseFileId ? `(${s.caseFileId})` : ''}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">בחר טענה להוספה:</label>
            <div id="picker-assertions-list" style="max-height: 320px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding: 4px;">
              <!-- Dynamically populated assertions -->
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" id="picker-modal-cancel">ביטול</button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.container.classList.remove('hidden');

    this.renderAssertionsList('ALL');
    this.attachEvents();
  }

  renderAssertionsList(selectedStmtId) {
    const state = store.getState();
    const listEl = document.getElementById('picker-assertions-list');
    if (!listEl) return;

    let availableAssertions = [];
    if (selectedStmtId === 'ALL') {
      availableAssertions = Object.values(state.assertions);
    } else {
      const stmt = state.statements[selectedStmtId];
      if (stmt && stmt.assertionIds) {
        availableAssertions = stmt.assertionIds.map(aId => state.assertions[aId]).filter(Boolean);
      }
    }

    if (availableAssertions.length === 0) {
      listEl.innerHTML = `
        <div style="padding: 30px; text-align: center; color: var(--text-muted); font-size: 13.5px;">
          לא נמצאו טענות בהודעה זו.<br>ניתן להוסיף טענות חדשות דרך לשונית "עדים".
        </div>
      `;
      return;
    }

    listEl.innerHTML = availableAssertions.map(asrt => {
      const stmt = state.statements[asrt.statementId];
      const color = asrt.color || 'green';
      return `
        <div class="fact-assertion-row color-${color}" style="border-right: 4px solid var(--asrt-${color}-pill); cursor: pointer;" data-asrt-pick-id="${asrt.id}">
          <div class="fact-assertion-content">
            <div class="fact-assertion-meta">
              <span style="font-weight: 700; color: var(--text-primary);">${this.escapeHtml(asrt.name || 'טענה ללא שם')}</span>
              <span>•</span>
              <span class="meta-tag">${this.escapeHtml(stmt?.name || 'הודעה')}</span>
              ${stmt?.caseFileId ? `<span class="meta-tag exhibit">${this.escapeHtml(stmt.caseFileId)}</span>` : ''}
              <span class="meta-tag">עמ' ${this.escapeHtml(asrt.page || '1')}, ש' ${this.escapeHtml(asrt.lines || '1')}</span>
            </div>
            <div class="fact-assertion-text" style="color: var(--text-secondary); max-height: 48px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
              ${this.escapeHtml(asrt.text || 'ללא תיאור')}
            </div>
          </div>
          <button class="btn btn-primary btn-sm btn-pick-action" data-asrt-pick-id="${asrt.id}">
            בחר
          </button>
        </div>
      `;
    }).join('');

    // Attach click events on items
    listEl.querySelectorAll('[data-asrt-pick-id]').forEach(el => {
      el.addEventListener('click', () => {
        const aId = el.dataset.asrtPickId;
        this.selectAssertion(aId);
      });
    });
  }

  selectAssertion(assertionId) {
    store.addAssertionToFact(this.currentFactId, assertionId, this.currentType);
    this.close();
  }

  attachEvents() {
    const closeBtn = document.getElementById('picker-modal-close');
    const cancelBtn = document.getElementById('picker-modal-cancel');
    const filterSelect = document.getElementById('picker-stmt-filter');

    const closeHandler = () => this.close();
    closeBtn?.addEventListener('click', closeHandler);
    cancelBtn?.addEventListener('click', closeHandler);

    this.container?.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.close();
      }
    });

    filterSelect?.addEventListener('change', (e) => {
      this.renderAssertionsList(e.target.value);
    });
  }

  close() {
    this.container.classList.add('hidden');
    this.container.innerHTML = '';
    this.currentFactId = null;
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
