// ==========================================================================
// FACT SHEET EDIT POP-UP MODAL COMPONENT
// ==========================================================================

import { store } from '../store.js';

export class FactSheetModal {
  constructor() {
    this.container = document.getElementById('modal-container');
    this.currentSheetId = null;
  }

  open(sheetId) {
    this.currentSheetId = sheetId;
    const state = store.getState();
    const sheet = state.factSheets[sheetId];
    if (!sheet) return;

    const factCount = (sheet.factIds || []).length;
    const facts = (sheet.factIds || [])
      .map(id => state.facts[id])
      .filter(Boolean);

    const html = `
      <div class="modal-card" style="max-width: 560px;">
        <div class="modal-header">
          <div class="modal-title">עריכת גיליון עובדות</div>
          <button class="mini-action-btn" id="sheet-modal-close" title="סגור">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">מזהה ייחודי (ID במערכת):</label>
            <input type="text" class="form-input" value="${sheet.id}" disabled style="background-color: #f1f5f9; cursor: not-allowed;">
          </div>

          <div class="form-group">
            <label class="form-label" for="sheet-modal-name">שם גיליון העובדות:</label>
            <input type="text" id="sheet-modal-name" class="form-input" value="${this.escapeHtml(sheet.name || '')}" placeholder="שם הגיליון...">
          </div>

          <div class="form-group">
            <label class="form-label" for="sheet-modal-desc">תיאור / מטרה ראייתית (למשל: סתירת קו התביעה):</label>
            <textarea id="sheet-modal-desc" class="form-textarea" rows="3" placeholder="תיאור מטרת הגיליון, טענות עיקריות...">${this.escapeHtml(sheet.description || '')}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">עובדות הכלולות בגיליון זה (${factCount}):</label>
            <div style="font-size: 13px; color: var(--text-secondary); background: #f8fafc; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 8px; max-height: 120px; overflow-y: auto;">
              ${facts.length === 0 ? '<span style="color: var(--text-muted);">אין עובדות מקושרות לגיליון זה כעת</span>' : facts.map(f => `
                <div style="display: flex; justify-content: space-between; padding: 2px 0;">
                  <span>• ${this.escapeHtml(f.name)}</span>
                  <div style="display: flex; gap: 4px;">
                    ${f.proved ? '<span class="badge-tag proved">הוכח</span>' : ''}
                    ${f.disproved ? '<span class="badge-tag disproved">הופרך</span>' : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" id="sheet-modal-cancel">ביטול</button>
          <button class="btn btn-primary" id="sheet-modal-save">שמור שינויים</button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.container.classList.remove('hidden');

    this.attachEvents();
  }

  attachEvents() {
    const closeHandler = () => this.close();
    document.getElementById('sheet-modal-close')?.addEventListener('click', closeHandler);
    document.getElementById('sheet-modal-cancel')?.addEventListener('click', closeHandler);

    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) this.close();
    });

    document.getElementById('sheet-modal-save')?.addEventListener('click', () => {
      const name = document.getElementById('sheet-modal-name')?.value;
      const description = document.getElementById('sheet-modal-desc')?.value;

      store.updateFactSheetAttributes(this.currentSheetId, {
        name,
        description
      });

      this.close();
    });
  }

  close() {
    this.container.classList.add('hidden');
    this.container.innerHTML = '';
    this.currentSheetId = null;
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
