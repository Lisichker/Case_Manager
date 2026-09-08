// ==========================================================================
// WITNESS EDIT POP-UP MODAL COMPONENT
// ==========================================================================

import { store } from '../store.js';

export class WitnessModal {
  constructor() {
    this.container = document.getElementById('modal-container');
    this.currentWitnessId = null;
  }

  open(witnessId) {
    this.currentWitnessId = witnessId;
    const state = store.getState();
    const wit = state.witnesses[witnessId];
    if (!wit) return;

    const stmtCount = (wit.statementIds || []).length;
    const statements = (wit.statementIds || [])
      .map(id => state.statements[id])
      .filter(Boolean);

    const html = `
      <div class="modal-card" style="max-width: 560px;">
        <div class="modal-header">
          <div class="modal-title">עריכת פרטי עד</div>
          <button class="mini-action-btn" id="wit-modal-close" title="סגור">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">מזהה ייחודי (ID במערכת):</label>
            <input type="text" class="form-input" value="${wit.id}" disabled style="background-color: #f1f5f9; cursor: not-allowed;">
          </div>

          <div class="form-group">
            <label class="form-label" for="wit-modal-name">שם מלא של העד:</label>
            <input type="text" id="wit-modal-name" class="form-input" value="${this.escapeHtml(wit.name || '')}" placeholder="שם העד...">
          </div>

          <div class="form-group">
            <label class="form-label" for="wit-modal-role">תפקיד / מעמד ראייתי בתיק:</label>
            <input type="text" id="wit-modal-role" class="form-input" value="${this.escapeHtml(wit.role || '')}" placeholder="למשל: עד תביעה / עד ראייה / חוקר משטרה / עד אליבי...">
          </div>

          <div class="form-group">
            <label class="form-label" for="wit-modal-notes">הערות / רקע על העד ומהימנותו:</label>
            <textarea id="wit-modal-notes" class="form-textarea" rows="3" placeholder="הערות לחקירה נגדית, נקודות תורפה או רקע...">${this.escapeHtml(wit.notes || '')}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">הודעות ועדויות מקושרות (${stmtCount}):</label>
            <div style="font-size: 13px; color: var(--text-secondary); background: #f8fafc; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 8px;">
              ${statements.length === 0 ? '<span style="color: var(--text-muted);">אין עדיין הודעות מקושרות לעד זה</span>' : statements.map(s => `
                <div style="display: flex; justify-content: space-between; padding: 2px 0;">
                  <span><b>${this.escapeHtml(s.name)}</b> ${s.caseFileId ? `(${this.escapeHtml(s.caseFileId)})` : ''}</span>
                  <span style="color: var(--text-muted);">${(s.assertionIds || []).length} טענות</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" id="wit-modal-cancel">ביטול</button>
          <button class="btn btn-primary" id="wit-modal-save">שמור שינויים</button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.container.classList.remove('hidden');

    this.attachEvents();
  }

  attachEvents() {
    const closeHandler = () => this.close();
    document.getElementById('wit-modal-close')?.addEventListener('click', closeHandler);
    document.getElementById('wit-modal-cancel')?.addEventListener('click', closeHandler);

    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) this.close();
    });

    document.getElementById('wit-modal-save')?.addEventListener('click', () => {
      const name = document.getElementById('wit-modal-name')?.value;
      const role = document.getElementById('wit-modal-role')?.value;
      const notes = document.getElementById('wit-modal-notes')?.value;

      store.updateWitnessAttributes(this.currentWitnessId, {
        name,
        role,
        notes
      });

      this.close();
    });
  }

  close() {
    this.container.classList.add('hidden');
    this.container.innerHTML = '';
    this.currentWitnessId = null;
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
