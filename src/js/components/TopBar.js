// ==========================================================================
// TOP BAR COMPONENT
// ==========================================================================

import { store } from '../store.js';

export class TopBar {
  constructor() {
    this.tableBtn = document.getElementById('tab-btn-table');
    this.factsBtn = document.getElementById('tab-btn-facts');
    this.witnessesBtn = document.getElementById('tab-btn-witnesses');

    this.lockToggle = document.getElementById('lock-toggle');
    this.lockStatusText = document.getElementById('lock-status-text');

    this.userDisplayName = document.getElementById('user-display-name');
    this.userAvatar = document.getElementById('user-avatar');

    this.settingsBtn = document.getElementById('settings-btn');
    this.settingsMenu = document.getElementById('settings-menu');

    this.saveJsonBtn = document.getElementById('menu-save-json');
    this.loadJsonBtn = document.getElementById('menu-load-json');
    this.editUserBtn = document.getElementById('menu-edit-user');
    this.loadSampleBtn = document.getElementById('menu-load-sample');
    this.clearCaseBtn = document.getElementById('menu-clear-case');

    this.jsonFileInput = document.getElementById('json-file-input');

    this.shareBtn = document.getElementById('btn-share-case');
    this.caseNameBadge = document.getElementById('case-name-badge');
    this.syncIndicatorDot = document.getElementById('sync-indicator-dot');
    this.syncStatusLabel = document.getElementById('sync-status-label');
    this.userBadge = document.getElementById('current-user-badge');

    this.initEvents();
    this.render();
  }

  initEvents() {
    // Share link button (Copies direct URL so team members can join instantly)
    this.shareBtn?.addEventListener('click', async () => {
      const url = window.location.href;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(url);
          this.showToast('📋 הקישור לתיק הועתק ללוח! שלח אותו לעמיתיך להתחברות מיידית.');
        } else {
          prompt('העתק את הקישור לתיק:', url);
        }
      } catch (err) {
        prompt('העתק את הקישור לתיק:', url);
      }
    });

    // Quick rename on avatar / user badge click
    this.userBadge?.addEventListener('click', () => {
      const state = store.getState();
      const newName = prompt('שנה את שמך במערכת (יוצג לשאר העורכים בתיק):', state.editor.username);
      if (newName && newName.trim()) {
        store.setUsername(newName.trim());
        this.showToast(`שם העורך עודכן ל-${newName.trim()}`);
      }
    });

    // Navigation tabs
    this.tableBtn?.addEventListener('click', () => store.setActiveTab('table'));
    this.factsBtn?.addEventListener('click', () => store.setActiveTab('facts'));
    this.witnessesBtn?.addEventListener('click', () => store.setActiveTab('witnesses'));

    // Lock toggle
    this.lockToggle?.addEventListener('change', (e) => {
      store.setLocked(e.target.checked);
    });

    // Settings dropdown toggle
    this.settingsBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.settingsMenu?.classList.toggle('hidden');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.settingsMenu?.contains(e.target) && e.target !== this.settingsBtn) {
        this.settingsMenu?.classList.add('hidden');
      }
    });

    // Save JSON
    this.saveJsonBtn?.addEventListener('click', () => {
      this.settingsMenu?.classList.add('hidden');
      store.exportJson();
      this.showToast('קובץ התיק נשמר בהצלחה');
    });

    // Load JSON trigger
    this.loadJsonBtn?.addEventListener('click', () => {
      this.settingsMenu?.classList.add('hidden');
      this.jsonFileInput?.click();
    });

    this.jsonFileInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          const res = store.importJson(content);
          if (res.success) {
            this.showToast('התיק נטען בהצלחה מקובץ JSON');
          } else {
            alert('שגיאה בטעינת הקובץ: ' + res.error);
          }
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });

    // Edit username
    this.editUserBtn?.addEventListener('click', () => {
      this.settingsMenu?.classList.add('hidden');
      const state = store.getState();
      const newName = prompt('הזן שם עורך:', state.editor.username);
      if (newName && newName.trim()) {
        store.setUsername(newName.trim());
        this.showToast(`שם העורך עודכן ל-${newName.trim()}`);
      }
    });

    // Load sample data
    this.loadSampleBtn?.addEventListener('click', () => {
      this.settingsMenu?.classList.add('hidden');
      if (confirm('האם לטעון נתוני דוגמה משפטיים? פעולה זו תחליף את הנתונים הקיימים.')) {
        store.loadSampleCase();
        this.showToast('נתוני דוגמה משפטיים נטענו בהצלחה');
      }
    });

    // Clear case
    this.clearCaseBtn?.addEventListener('click', () => {
      this.settingsMenu?.classList.add('hidden');
      if (confirm('האם אתה בטוח שברצונך לאפס את כל נתוני התיק? לא ניתן לשחזר פעולה זו.')) {
        store.resetCase();
        this.showToast('התיק אופס בהצלחה');
      }
    });
  }

  showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 200ms ease';
      setTimeout(() => toast.remove(), 200);
    }, 2800);
  }

  render() {
    const state = store.getState();

    // Active tab button styling
    [this.tableBtn, this.factsBtn, this.witnessesBtn].forEach(btn => {
      if (!btn) return;
      const tab = btn.dataset.tab;
      const isActive = tab === state.activeTab;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Switch view sections
    const viewTable = document.getElementById('view-table');
    const viewFacts = document.getElementById('view-facts');
    const viewWitnesses = document.getElementById('view-witnesses');

    viewTable?.classList.toggle('hidden', state.activeTab !== 'table');
    viewFacts?.classList.toggle('hidden', state.activeTab !== 'facts');
    viewWitnesses?.classList.toggle('hidden', state.activeTab !== 'witnesses');

    // Lock mode
    const isLocked = !!state.editor.isLocked;
    if (this.lockToggle) this.lockToggle.checked = isLocked;
    if (this.lockStatusText) {
      this.lockStatusText.textContent = isLocked ? 'נעול לעריכה' : 'פתוח לעריכה';
    }
    document.body.classList.toggle('app-locked', isLocked);

    // Case room badge & link
    if (this.caseNameBadge) {
      const caseId = store.getCaseId ? store.getCaseId() : 'תיק';
      this.caseNameBadge.textContent = `שתף (${caseId})`;
    }

    // Real-time server connection and online users presence
    if (this.syncStatusLabel && this.syncIndicatorDot) {
      const isConnected = store.isWsConnected ? store.isWsConnected() : false;
      const onlineUsers = store.getOnlineUsers ? store.getOnlineUsers() : [];

      if (isConnected) {
        const count = Math.max(1, onlineUsers.length);
        this.syncStatusLabel.textContent = `${count} מחוברים`;
        this.syncIndicatorDot.style.backgroundColor = '#22c55e';
        this.syncIndicatorDot.style.boxShadow = '0 0 0 2px rgba(34, 197, 94, 0.25)';
      } else {
        this.syncStatusLabel.textContent = 'מצב מקומי';
        this.syncIndicatorDot.style.backgroundColor = '#eab308';
        this.syncIndicatorDot.style.boxShadow = '0 0 0 2px rgba(234, 179, 8, 0.25)';
      }
    }

    // Editor info
    if (this.userDisplayName) {
      this.userDisplayName.textContent = state.editor.username || 'עו״ד';
    }
    if (this.userAvatar) {
      const firstChar = (state.editor.username || 'ע').trim().charAt(0);
      this.userAvatar.textContent = firstChar;
    }
  }
}
