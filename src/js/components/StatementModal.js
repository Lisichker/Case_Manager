// ==========================================================================
// STATEMENT EDIT POP-UP MODAL COMPONENT
// ==========================================================================

import { store } from '../store.js';

export class StatementModal {
  constructor() {
    this.container = document.getElementById('modal-container');
    this.currentStatementId = null;
  }

  open(statementId) {
    this.currentStatementId = statementId;
    const state = store.getState();
    const stmt = state.statements[statementId];
    if (!stmt) return;

    const witnesses = Object.values(state.witnesses);
    const interrogatorsStr = (stmt.interrogatorNames || []).join(', ');

    const html = `
      <div class="modal-card" id="statement-modal-card">
        <div class="modal-header">
          <div class="modal-title">עריכת פרטי הודעה / עדות</div>
          <button class="mini-action-btn" id="stmt-modal-close" title="סגור">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">מזהה ייחודי (ID במערכת):</label>
            <input type="text" class="form-input" value="${stmt.id}" disabled style="background-color: #f1f5f9; cursor: not-allowed;">
          </div>

          <div class="form-group">
            <label class="form-label" for="stmt-modal-name">שם ההודעה / מסמך העדות:</label>
            <input type="text" id="stmt-modal-name" class="form-input" value="${this.escapeHtml(stmt.name || '')}" placeholder="למשל: הודעת עד ראייה במשטרה">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="stmt-modal-casefile">סימון בתיק / מספר מוצג:</label>
              <input type="text" id="stmt-modal-casefile" class="form-input" value="${this.escapeHtml(stmt.caseFileId || '')}" placeholder="למשל: ת/1, נ/3">
            </div>
            <div class="form-group">
              <label class="form-label" for="stmt-modal-date">תאריך גביית ההודעה:</label>
              <input type="date" id="stmt-modal-date" class="form-input" value="${stmt.date || ''}">
            </div>
            <div class="form-group">
              <label class="form-label" for="stmt-modal-time">שעת הגבייה:</label>
              <input type="time" id="stmt-modal-time" class="form-input" value="${stmt.time || ''}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="stmt-modal-interrogators">שמות גובי ההודעה / חוקרים (מופרדים בפסיקים):</label>
            <input type="text" id="stmt-modal-interrogators" class="form-input" value="${this.escapeHtml(interrogatorsStr)}" placeholder="למשל: רס״ב אלי מזרחי, רס״ל דנה כהן">
          </div>

          <div class="form-group">
            <label class="form-label">עדים שהשתתפו ביצירת ההודעה:</label>
            <div class="stmt-witness-checkboxes" style="max-height: 120px; overflow-y: auto; border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 8px; display: flex; flex-direction: column; gap: 6px; background-color: #fff;">
              ${witnesses.map(w => {
                const checked = (stmt.witnessIds || []).includes(w.id) ? 'checked' : '';
                return `
                  <label style="display: flex; align-items: center; gap: 8px; font-size: 13.5px; cursor: pointer;">
                    <input type="checkbox" name="stmt-witness" value="${w.id}" ${checked}>
                    <span>${this.escapeHtml(w.name)}</span>
                  </label>
                `;
              }).join('')}
              ${witnesses.length === 0 ? '<span style="color: var(--text-muted); font-size: 13px;">טרם נוספו עדים למערכת</span>' : ''}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">מספר טענות בהודעה זו:</label>
            <div style="font-size: 13px; color: var(--text-muted);">
              ${(stmt.assertionIds || []).length} טענות רשומות כעת
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" id="stmt-modal-cancel">ביטול</button>
          <button class="btn btn-primary" id="stmt-modal-save">שמור שינויים</button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.container.classList.remove('hidden');

    this.attachEvents();
  }

  attachEvents() {
    const closeBtn = document.getElementById('stmt-modal-close');
    const cancelBtn = document.getElementById('stmt-modal-cancel');
    const saveBtn = document.getElementById('stmt-modal-save');

    const closeHandler = () => this.close();

    closeBtn?.addEventListener('click', closeHandler);
    cancelBtn?.addEventListener('click', closeHandler);

    this.container?.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.close();
      }
    });

    saveBtn?.addEventListener('click', () => {
      const name = document.getElementById('stmt-modal-name')?.value;
      const caseFileId = document.getElementById('stmt-modal-casefile')?.value;
      const date = document.getElementById('stmt-modal-date')?.value;
      const time = document.getElementById('stmt-modal-time')?.value;
      const interrogatorsRaw = document.getElementById('stmt-modal-interrogators')?.value || '';

      const interrogatorNames = interrogatorsRaw
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const checkedWitnesses = Array.from(
        document.querySelectorAll('input[name="stmt-witness"]:checked')
      ).map(cb => cb.value);

      store.updateStatementAttributes(this.currentStatementId, {
        name,
        caseFileId,
        date,
        time,
        interrogatorNames,
        witnessIds: checkedWitnesses
      });

      this.close();
    });
  }

  close() {
    this.container.classList.add('hidden');
    this.container.innerHTML = '';
    this.currentStatementId = null;
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
