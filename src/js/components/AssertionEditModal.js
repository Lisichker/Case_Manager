// ==========================================================================
// ASSERTION EDIT POP-UP MODAL COMPONENT
// ==========================================================================

import { store } from '../store.js';

export class AssertionEditModal {
  constructor() {
    this.container = document.getElementById('modal-container');
    this.currentAssertionId = null;
  }

  open(assertionId) {
    this.currentAssertionId = assertionId;
    const state = store.getState();
    const asrt = state.assertions[assertionId];
    if (!asrt) return;

    const stmt = state.statements[asrt.statementId];
    const currentColor = asrt.color || 'green';

    const html = `
      <div class="modal-card" style="max-width: 620px;">
        <div class="modal-header">
          <div>
            <div class="modal-title">עריכת טענה מתוך הודעה</div>
            <div style="font-size: 13px; color: var(--text-muted); margin-top: 3px;">
              ${stmt ? `מתוך: <b>${this.escapeHtml(stmt.name)}</b> ${stmt.caseFileId ? `(${this.escapeHtml(stmt.caseFileId)})` : ''}` : ''}
            </div>
          </div>
          <button class="mini-action-btn" id="asrt-edit-modal-close" title="סגור">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-row">
            <div class="form-group" style="flex: 2;">
              <label class="form-label" for="asrt-edit-name">כותרת / שם הטענה:</label>
              <input type="text" id="asrt-edit-name" class="form-input" value="${this.escapeHtml(asrt.name || '')}" placeholder="למשל: זיהוי רכב בזירה">
            </div>

            <div class="form-group" style="flex: 1;">
              <label class="form-label">סיווג צבע ראייתי:</label>
              <div class="color-picker-group" style="height: 38px; justify-content: space-around;">
                <button type="button" class="color-dot-btn green ${currentColor === 'green' ? 'active' : ''}" data-color="green" title="ירוק - חיזוק/סיוע"></button>
                <button type="button" class="color-dot-btn yellow ${currentColor === 'yellow' ? 'active' : ''}" data-color="yellow" title="צהוב - ניטרלי/במחלוקת"></button>
                <button type="button" class="color-dot-btn red ${currentColor === 'red' ? 'active' : ''}" data-color="red" title="אדום - סתירה/שלילה"></button>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="asrt-edit-page">עמוד בהודעה:</label>
              <input type="text" id="asrt-edit-page" class="form-input" value="${this.escapeHtml(asrt.page || '1')}" placeholder="למשל: 3">
            </div>
            <div class="form-group">
              <label class="form-label" for="asrt-edit-lines">שורות:</label>
              <input type="text" id="asrt-edit-lines" class="form-input" value="${this.escapeHtml(asrt.lines || '1-5')}" placeholder="למשל: 14-18">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="asrt-edit-text">תוכן / ציטוט הטענה מתוך העדות:</label>
            <textarea id="asrt-edit-text" class="form-textarea" rows="4" style="line-height: 1.6; font-size: 14px;" placeholder="ציטוט מילה במילה או תמצית דברי העד...">${this.escapeHtml(asrt.text || '')}</textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" id="asrt-edit-cancel">ביטול</button>
          <button class="btn btn-primary" id="asrt-edit-save">שמור שינויים</button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.container.classList.remove('hidden');

    this.attachEvents(currentColor);
  }

  attachEvents(initialColor) {
    let selectedColor = initialColor;

    // Color buttons
    this.container.querySelectorAll('.color-dot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.color-dot-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedColor = btn.dataset.color;
      });
    });

    const closeHandler = () => this.close();
    document.getElementById('asrt-edit-modal-close')?.addEventListener('click', closeHandler);
    document.getElementById('asrt-edit-cancel')?.addEventListener('click', closeHandler);

    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) this.close();
    });

    // Save
    document.getElementById('asrt-edit-save')?.addEventListener('click', () => {
      const name = document.getElementById('asrt-edit-name')?.value;
      const page = document.getElementById('asrt-edit-page')?.value;
      const lines = document.getElementById('asrt-edit-lines')?.value;
      const text = document.getElementById('asrt-edit-text')?.value;

      store.updateAssertion(this.currentAssertionId, {
        name: (name || '').trim(),
        page: (page || '').trim(),
        lines: (lines || '').trim(),
        color: selectedColor,
        text: text || ''
      });

      this.close();
    });
  }

  close() {
    this.container.classList.add('hidden');
    this.container.innerHTML = '';
    this.currentAssertionId = null;
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
