// ==========================================================================
// COURT CASE WITNESS & FACT MANAGER - REACTIVE STORE & REAL-TIME SYNC
// ==========================================================================

const STORAGE_KEY = 'court_case_manager_data_v1';
const BROADCAST_CHANNEL_NAME = 'court_case_sync_channel';

// Unique Tab ID to avoid echoing own broadcasts
const TAB_ID = 'tab_' + Math.random().toString(36).substring(2, 9);

function generateId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
}

// Helper to get tab-local active tab
function getInitialTab() {
  if (typeof sessionStorage !== 'undefined') {
    try {
      const saved = sessionStorage.getItem('case_manager_active_tab');
      if (saved && ['table', 'facts', 'witnesses'].includes(saved)) return saved;
    } catch (e) {}
  }
  return 'table';
}

// Initial Empty State
function createDefaultState() {
  return {
    version: 1,
    lastUpdated: Date.now(),
    editor: {
      username: 'עו״ד מגן',
      isLocked: false,
    },
    activeTab: getInitialTab(), // Tab-local: not synchronized across tabs
    selectedWitnessId: null,
    selectedStatementId: null,
    selectedFactSheetId: null,
    collapsed: {
      witnesses: false,
      statements: false,
      factSheets: false,
    },
    witnesses: {},
    statements: {},
    assertions: {},
    factSheets: {},
    facts: {},
    factTable: {
      columns: [
        { id: 'col_1', name: 'זמן האירוע' },
        { id: 'col_2', name: 'מיקום וזירה' },
        { id: 'col_3', name: 'זיהוי הנאשם' },
        { id: 'col_4', name: 'אליבי' }
      ],
      rows: [
        { id: 'row_1', name: 'גרסת המתלונן' },
        { id: 'row_2', name: 'גרסת עד הראייה' },
        { id: 'row_3', name: 'גרסת הנאשם' }
      ],
      cells: {} // key `${rowId}_${colId}` -> array of factIds
    }
  };
}

// Sample Case Data (ת"פ 28418-02-25)
export function getSampleCaseData() {
  const wit1 = 'wit_1';
  const wit2 = 'wit_2';
  const wit3 = 'wit_3';

  const stmt1 = 'stmt_1';
  const stmt2 = 'stmt_2';
  const stmt3 = 'stmt_3';

  const asrt1 = 'asrt_1';
  const asrt2 = 'asrt_2';
  const asrt3 = 'asrt_3';
  const asrt4 = 'asrt_4';
  const asrt5 = 'asrt_5';

  const sheet1 = 'sheet_1';
  const sheet2 = 'sheet_2';

  const fact1 = 'fact_1';
  const fact2 = 'fact_2';
  const fact3 = 'fact_3';

  return {
    version: 1,
    lastUpdated: Date.now(),
    editor: {
      username: 'עו״ד מגן (סנגוריה)',
      isLocked: false,
    },
    activeTab: getInitialTab(),
    selectedWitnessId: wit1,
    selectedStatementId: stmt1,
    selectedFactSheetId: sheet1,
    collapsed: {
      witnesses: false,
      statements: false,
      factSheets: false,
    },
    witnesses: {
      [wit1]: {
        id: wit1,
        name: 'דוד לוי (עד ראייה)',
        statementIds: [stmt1]
      },
      [wit2]: {
        id: wit2,
        name: 'רס״ב אלי כהן (חוקר משטרה)',
        statementIds: [stmt2]
      },
      [wit3]: {
        id: wit3,
        name: 'רוני ברק (מנהל עבודה - עד הגנה)',
        statementIds: [stmt3]
      }
    },
    statements: {
      [stmt1]: {
        id: stmt1,
        name: 'הודעת עד ראייה במשטרה',
        witnessIds: [wit1],
        interrogatorNames: ['רס״ל מיכל ששון'],
        assertionIds: [asrt1, asrt2],
        date: '2025-01-14',
        time: '18:45',
        caseFileId: 'ת/4'
      },
      [stmt2]: {
        id: stmt2,
        name: 'דוח תפיסה ובדיקת מצלמות',
        witnessIds: [wit2],
        interrogatorNames: ['רס״ב אלי כהן'],
        assertionIds: [asrt3],
        date: '2025-01-15',
        time: '10:30',
        caseFileId: 'ת/2'
      },
      [stmt3]: {
        id: stmt3,
        name: 'הצהרת מעסיק ויומן נוכחות',
        witnessIds: [wit3],
        interrogatorNames: ['עו״ד כהן'],
        assertionIds: [asrt4, asrt5],
        date: '2025-01-22',
        time: '11:00',
        caseFileId: 'נ/1'
      }
    },
    assertions: {
      [asrt1]: {
        id: asrt1,
        statementId: stmt1,
        name: 'זיהוי קסדה שחורה ומעיל כהה',
        page: '2',
        lines: '14-18',
        color: 'yellow',
        text: 'העד ציין כי האדם שעזב את הזירה חבש קסדה מלאה עם משקף כהה ולבש מעיל גשם שחור ללא סימני זיהוי מיוחדים.',
        order: 0
      },
      [asrt2]: {
        id: asrt2,
        statementId: stmt1,
        name: 'מרחק תצפית וערפל',
        page: '3',
        lines: '6-11',
        color: 'red',
        text: 'העד עמד במרחק כ-45 מטרים, ירד גשם שוטף והתאורה ברחוב הייתה חלשה ומקוטעת עקב ענפי עצים.',
        order: 1
      },
      [asrt3]: {
        id: asrt3,
        statementId: stmt2,
        name: 'רכב החשוד לא נצפה בצומת הרצל',
        page: '1',
        lines: '22-26',
        color: 'green',
        text: 'בדיקת מצלמות העירייה בצומת הרצל בין 14:00 ל-15:00 הראתה כי רכבו של הנאשם לא חלף בצומת כלל.',
        order: 0
      },
      [asrt4]: {
        id: asrt4,
        statementId: stmt3,
        name: 'החתמת שעון נוכחות במפעל',
        page: '1',
        lines: '8-12',
        color: 'green',
        text: 'כרטיס העובד המגנטי של הנאשם הוחתם בכניסה למפעל בשעה 07:45 וביציאה בשעה 16:30.',
        order: 0
      },
      [asrt5]: {
        id: asrt5,
        statementId: stmt3,
        name: 'שיחת עבודה פרונטלית בשעה 14:20',
        page: '2',
        lines: '3-9',
        color: 'green',
        text: 'מנהל העבודה מאשר כי בשעה 14:20 בדיוק הנאשם ניגש אליו במחסן וביקש חומרי גלם נוספים.',
        order: 1
      }
    },
    factSheets: {
      [sheet1]: {
        id: sheet1,
        name: 'טענת אליבי - נוכחות במפעל',
        factIds: [fact1, fact2]
      },
      [sheet2]: {
        id: sheet2,
        name: 'מהימנות זיהוי בזירה',
        factIds: [fact3]
      }
    },
    facts: {
      [fact1]: {
        id: fact1,
        name: 'הנאשם שהה במפעל בשעת האירוע (14:15-14:30)',
        sheetIds: [sheet1],
        proved: true,
        disproved: false,
        strengtheningAssertions: [
          { assertionId: asrt4, proved: true, disproved: false },
          { assertionId: asrt5, proved: true, disproved: false }
        ],
        denyingAssertions: []
      },
      [fact2]: {
        id: fact2,
        name: 'רכב הנאשם לא היה בזירת העבירה',
        sheetIds: [sheet1],
        proved: true,
        disproved: false,
        strengtheningAssertions: [
          { assertionId: asrt3, proved: true, disproved: false }
        ],
        denyingAssertions: []
      },
      [fact3]: {
        id: fact3,
        name: 'עד הראייה זיהה בוודאות את הנאשם',
        sheetIds: [sheet2],
        proved: false,
        disproved: true,
        strengtheningAssertions: [
          { assertionId: asrt1, proved: false, disproved: false }
        ],
        denyingAssertions: [
          { assertionId: asrt2, proved: true, disproved: false }
        ]
      }
    },
    factTable: {
      columns: [
        { id: 'col_1', name: 'זמן האירוע' },
        { id: 'col_2', name: 'מיקום וזירה' },
        { id: 'col_3', name: 'זיהוי הנאשם' },
        { id: 'col_4', name: 'אליבי' }
      ],
      rows: [
        { id: 'row_1', name: 'גרסת המתלונן' },
        { id: 'row_2', name: 'גרסת עד הראייה' },
        { id: 'row_3', name: 'גרסת הנאשם' }
      ],
      cells: {
        'row_2_col_3': [fact3],
        'row_3_col_4': [fact1],
        'row_3_col_2': [fact2]
      }
    }
  };
}

class CaseStore {
  constructor() {
    this.listeners = new Set();
    this.caseId = this.getCaseIdFromUrl();
    this.onlineUsers = [];
    this.wsConnected = false;
    this.state = this.loadFromStorage() || getSampleCaseData();
    this.initRealTimeSync();
    this.initWebSocket();
  }

  // Parse case room ID from URL query string ?case=...
  getCaseIdFromUrl() {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const caseParam = params.get('case');
        if (caseParam && caseParam.trim()) {
          return caseParam.trim();
        }
      } catch (e) {}
    }
    return 'ת"פ 28418-02-25';
  }

  getCaseId() {
    return this.caseId;
  }

  getOnlineUsers() {
    return this.onlineUsers;
  }

  isWsConnected() {
    return this.wsConnected;
  }

  // Extract only shared case domain data (no tab-local UI state)
  getDomainData() {
    return {
      version: this.state.version || 1,
      lastUpdated: this.state.lastUpdated || Date.now(),
      witnesses: this.state.witnesses,
      statements: this.state.statements,
      assertions: this.state.assertions,
      factSheets: this.state.factSheets,
      facts: this.state.facts,
      factTable: this.state.factTable,
      editor: this.state.editor
    };
  }

  // Load persisted state from localStorage
  loadFromStorage() {
    if (typeof localStorage === 'undefined' || typeof localStorage.getItem !== 'function') return null;
    try {
      const storageKey = `${STORAGE_KEY}_${this.caseId}`;
      const dataStr = localStorage.getItem(storageKey) || localStorage.getItem(STORAGE_KEY);
      if (dataStr) {
        const parsed = JSON.parse(dataStr);
        if (parsed && parsed.witnesses && parsed.facts) {
          const defaultState = createDefaultState();
          return {
            ...defaultState,
            witnesses: parsed.witnesses || {},
            statements: parsed.statements || {},
            assertions: parsed.assertions || {},
            factSheets: parsed.factSheets || {},
            facts: parsed.facts || {},
            factTable: parsed.factTable || defaultState.factTable,
            editor: { ...defaultState.editor, ...(parsed.editor || {}) },
            lastUpdated: parsed.lastUpdated || Date.now(),
            // Tab-local UI state:
            activeTab: getInitialTab(),
            selectedWitnessId: Object.keys(parsed.witnesses || {})[0] || null,
            selectedStatementId: null,
            selectedFactSheetId: Object.keys(parsed.factSheets || {})[0] || null,
            collapsed: {
              witnesses: false,
              statements: false,
              factSheets: false,
            }
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored case data:', e);
    }
    return null;
  }

  // Save domain data to localStorage, broadcast to tabs and send to WebSocket server
  persistAndBroadcast(skipBroadcast = false) {
    this.state.lastUpdated = Date.now();
    const domainData = this.getDomainData();

    // LocalStorage persistence
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      try {
        const storageKey = `${STORAGE_KEY}_${this.caseId}`;
        localStorage.setItem(storageKey, JSON.stringify(domainData));
      } catch (e) {
        console.error('LocalStorage save error:', e);
      }
    }

    // WebSocket send to server for multi-user sync across the internet
    if (!skipBroadcast && this.socket && this.socket.readyState === 1 /* OPEN */) {
      try {
        this.socket.send(JSON.stringify({
          type: 'UPDATE_CASE',
          caseId: this.caseId,
          sender: TAB_ID,
          data: domainData
        }));
      } catch (err) {
        console.warn('[WS] Send error:', err);
      }
    }

    // BroadcastChannel for tabs on the same computer
    if (!skipBroadcast && this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'SYNC_DOMAIN_DATA',
          sender: TAB_ID,
          data: domainData
        });
      } catch (e) {
        console.warn('Broadcast error:', e);
      }
    }

    this.notify();
  }

  // Apply domain data updates without disturbing local tab UI state
  applyIncomingData(data) {
    if (!data || !data.witnesses || !data.facts) return;

    // Real-time synchronization of all case data:
    this.state.witnesses = data.witnesses || {};
    this.state.statements = data.statements || {};
    this.state.assertions = data.assertions || {};
    this.state.factSheets = data.factSheets || {};
    this.state.facts = data.facts || {};
    this.state.factTable = data.factTable || { columns: [], rows: [], cells: {} };
    if (data.editor) {
      this.state.editor = { ...this.state.editor, ...data.editor };
    }
    this.state.lastUpdated = data.lastUpdated || Date.now();

    // Ensure local selections remain valid without overwriting the user's selected tab or collapse state!
    if (this.state.selectedWitnessId && !this.state.witnesses[this.state.selectedWitnessId]) {
      const remaining = Object.keys(this.state.witnesses);
      this.state.selectedWitnessId = remaining[0] || null;
    }
    if (this.state.selectedStatementId && !this.state.statements[this.state.selectedStatementId]) {
      this.state.selectedStatementId = null;
    }
    if (this.state.selectedFactSheetId && !this.state.factSheets[this.state.selectedFactSheetId]) {
      const remaining = Object.keys(this.state.factSheets);
      this.state.selectedFactSheetId = remaining[0] || null;
    }

    this.notify({ fromSync: true });
  }

  // Initialize WebSocket connection for multi-user internet sync
  initWebSocket() {
    if (typeof window === 'undefined' || !window.location || !window.location.host) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?case=${encodeURIComponent(this.caseId)}`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.wsConnected = true;
        this.sendPresence();
        this.notify({ wsStatus: 'connected' });
      };

      this.socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'INIT_STATE' && msg.data) {
            this.applyIncomingData(msg.data);
          } else if (msg.type === 'SYNC_DOMAIN_DATA' && msg.data) {
            if (msg.sender !== TAB_ID) {
              this.applyIncomingData(msg.data);
            }
          } else if (msg.type === 'PRESENCE_UPDATE' && msg.users) {
            this.onlineUsers = msg.users;
            this.notify({ presenceUpdate: true, users: msg.users });
          } else if (msg.type === 'REQUEST_SEED') {
            // Send current domain data to server to initialize file
            if (this.socket && this.socket.readyState === 1) {
              this.socket.send(JSON.stringify({
                type: 'SEED_CASE',
                caseId: this.caseId,
                data: this.getDomainData()
              }));
            }
          }
        } catch (err) {
          console.error('[WS] Parse error:', err);
        }
      };

      this.socket.onclose = () => {
        this.wsConnected = false;
        this.notify({ wsStatus: 'disconnected' });
        // Reconnect after 3 seconds
        setTimeout(() => {
          this.initWebSocket();
        }, 3000);
      };

      this.socket.onerror = () => {
        this.wsConnected = false;
      };
    } catch (err) {
      console.warn('WebSocket connection not available:', err);
    }
  }

  sendPresence() {
    if (this.socket && this.socket.readyState === 1) {
      try {
        this.socket.send(JSON.stringify({
          type: 'SET_USER',
          caseId: this.caseId,
          username: this.state.editor.username || 'עו״ד',
          tabId: TAB_ID
        }));
      } catch (e) {}
    }
  }

  // Initialize BroadcastChannel and Storage event listener for same-origin tabs
  initRealTimeSync() {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          const msg = event.data;
          if (!msg || msg.sender === TAB_ID) return;

          if ((msg.type === 'SYNC_DOMAIN_DATA' || msg.type === 'SYNC_STATE') && (msg.data || msg.state)) {
            this.applyIncomingData(msg.data || msg.state);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    // Fallback/redundancy via window storage event
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        const storageKey = `${STORAGE_KEY}_${this.caseId}`;
        if ((e.key === storageKey || e.key === STORAGE_KEY) && e.newValue) {
          try {
            const fresh = JSON.parse(e.newValue);
            if (fresh && fresh.lastUpdated > (this.state.lastUpdated || 0)) {
              this.applyIncomingData(fresh);
            }
          } catch (err) {
            console.error('Storage event sync error:', err);
          }
        }
      });
    }
  }

  // Subscribe to state changes
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(meta = {}) {
    for (const listener of this.listeners) {
      try {
        listener(this.state, meta);
      } catch (e) {
        console.error('Listener notification error:', e);
      }
    }
  }

  getState() {
    return this.state;
  }

  // Set active tab (LOCAL to this browser tab only - does not broadcast!)
  setActiveTab(tabName) {
    this.state.activeTab = tabName;
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem('case_manager_active_tab', tabName);
      } catch (e) {}
    }
    this.notify({ localTabChange: true });
  }

  // Set lock mode
  setLocked(isLocked) {
    this.state.editor.isLocked = !!isLocked;
    this.persistAndBroadcast();
  }

  // Set editor username
  setUsername(username) {
    if (!username || !username.trim()) return;
    this.state.editor.username = username.trim();
    this.persistAndBroadcast();
  }

  // Reset to empty case
  resetCase() {
    this.state = createDefaultState();
    this.persistAndBroadcast();
  }

  // Load sample case
  loadSampleCase() {
    this.state = getSampleCaseData();
    this.persistAndBroadcast();
  }

  // Export JSON
  exportJson() {
    const jsonStr = JSON.stringify(this.state, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `תיק_משפטי_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Import JSON
  importJson(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.witnesses || !parsed.facts || !parsed.factTable) {
        throw new Error('מבנה קובץ ה-JSON אינו תקין');
      }
      this.state = {
        ...createDefaultState(),
        ...parsed,
        lastUpdated: Date.now()
      };
      this.persistAndBroadcast();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // -------------------------------------------------------------
  // WITNESSES & STATEMENTS & ASSERTIONS
  // -------------------------------------------------------------

  selectWitness(witnessId) {
    this.state.selectedWitnessId = witnessId;
    const wit = this.state.witnesses[witnessId];
    if (wit && wit.statementIds && wit.statementIds.length > 0) {
      if (!wit.statementIds.includes(this.state.selectedStatementId)) {
        this.state.selectedStatementId = wit.statementIds[0];
      }
    } else {
      this.state.selectedStatementId = null;
    }
    this.notify({ localSelectionChange: true });
  }

  selectStatement(statementId) {
    this.state.selectedStatementId = statementId;
    this.notify({ localSelectionChange: true });
  }

  addWitness(name = 'עד חדש') {
    if (this.state.editor.isLocked) return;
    const id = generateId('wit');
    this.state.witnesses[id] = {
      id,
      name,
      statementIds: []
    };
    this.state.selectedWitnessId = id;
    this.state.selectedStatementId = null;
    this.persistAndBroadcast();
    return id;
  }

  renameWitness(witnessId, newName) {
    if (this.state.editor.isLocked || !this.state.witnesses[witnessId]) return;
    this.state.witnesses[witnessId].name = newName.trim() || 'עד ללא שם';
    this.persistAndBroadcast();
  }

  deleteWitness(witnessId) {
    if (this.state.editor.isLocked || !this.state.witnesses[witnessId]) return;
    const wit = this.state.witnesses[witnessId];

    // Remove its statements
    if (wit.statementIds) {
      for (const sId of wit.statementIds) {
        this.deleteStatement(sId, false);
      }
    }

    delete this.state.witnesses[witnessId];
    if (this.state.selectedWitnessId === witnessId) {
      const remaining = Object.keys(this.state.witnesses);
      this.state.selectedWitnessId = remaining.length > 0 ? remaining[0] : null;
      if (this.state.selectedWitnessId) {
        const nextWit = this.state.witnesses[this.state.selectedWitnessId];
        this.state.selectedStatementId = nextWit.statementIds?.[0] || null;
      } else {
        this.state.selectedStatementId = null;
      }
    }
    this.persistAndBroadcast();
  }

  addStatement(witnessId, name = 'הודעה חדשה') {
    if (this.state.editor.isLocked) return;
    const sId = generateId('stmt');
    const today = new Date().toISOString().slice(0, 10);
    this.state.statements[sId] = {
      id: sId,
      name,
      witnessIds: witnessId ? [witnessId] : [],
      interrogatorNames: [],
      assertionIds: [],
      date: today,
      time: '12:00',
      caseFileId: ''
    };

    if (witnessId && this.state.witnesses[witnessId]) {
      this.state.witnesses[witnessId].statementIds.push(sId);
    }

    this.state.selectedStatementId = sId;
    this.persistAndBroadcast();
    return sId;
  }

  updateStatementAttributes(statementId, attributes) {
    if (this.state.editor.isLocked || !this.state.statements[statementId]) return;
    const current = this.state.statements[statementId];
    this.state.statements[statementId] = {
      ...current,
      name: attributes.name !== undefined ? attributes.name : current.name,
      witnessIds: attributes.witnessIds || current.witnessIds,
      interrogatorNames: attributes.interrogatorNames || current.interrogatorNames,
      date: attributes.date !== undefined ? attributes.date : current.date,
      time: attributes.time !== undefined ? attributes.time : current.time,
      caseFileId: attributes.caseFileId !== undefined ? attributes.caseFileId : current.caseFileId
    };

    // Keep witness statementIds list consistent
    if (attributes.witnessIds) {
      for (const wit of Object.values(this.state.witnesses)) {
        if (attributes.witnessIds.includes(wit.id)) {
          if (!wit.statementIds.includes(statementId)) {
            wit.statementIds.push(statementId);
          }
        }
      }
    }

    this.persistAndBroadcast();
  }

  deleteStatement(statementId, persist = true) {
    if (this.state.editor.isLocked || !this.state.statements[statementId]) return;
    const stmt = this.state.statements[statementId];

    // Remove assertions
    if (stmt.assertionIds) {
      for (const aId of stmt.assertionIds) {
        delete this.state.assertions[aId];
        this.removeAssertionFromAllFacts(aId);
      }
    }

    // Remove statementId from witnesses
    for (const wit of Object.values(this.state.witnesses)) {
      if (wit.statementIds) {
        wit.statementIds = wit.statementIds.filter(id => id !== statementId);
      }
    }

    delete this.state.statements[statementId];
    if (this.state.selectedStatementId === statementId) {
      this.state.selectedStatementId = null;
    }

    if (persist) this.persistAndBroadcast();
  }

  addAssertion(statementId, assertionData = {}) {
    if (this.state.editor.isLocked || !this.state.statements[statementId]) return;
    const stmt = this.state.statements[statementId];
    const aId = generateId('asrt');
    const order = stmt.assertionIds ? stmt.assertionIds.length : 0;

    this.state.assertions[aId] = {
      id: aId,
      statementId,
      name: assertionData.name || 'טענה חדשה',
      page: assertionData.page || '1',
      lines: assertionData.lines || '1-5',
      color: assertionData.color || 'green',
      text: assertionData.text || '',
      order
    };

    if (!stmt.assertionIds) stmt.assertionIds = [];
    stmt.assertionIds.push(aId);

    this.persistAndBroadcast();
    return aId;
  }

  updateAssertion(assertionId, updates) {
    if (this.state.editor.isLocked || !this.state.assertions[assertionId]) return;
    this.state.assertions[assertionId] = {
      ...this.state.assertions[assertionId],
      ...updates
    };
    this.persistAndBroadcast();
  }

  moveAssertion(statementId, assertionId, direction) {
    if (this.state.editor.isLocked || !this.state.statements[statementId]) return;
    const stmt = this.state.statements[statementId];
    const idx = stmt.assertionIds.indexOf(assertionId);
    if (idx === -1) return;

    if (direction === 'up' && idx > 0) {
      const temp = stmt.assertionIds[idx - 1];
      stmt.assertionIds[idx - 1] = stmt.assertionIds[idx];
      stmt.assertionIds[idx] = temp;
    } else if (direction === 'down' && idx < stmt.assertionIds.length - 1) {
      const temp = stmt.assertionIds[idx + 1];
      stmt.assertionIds[idx + 1] = stmt.assertionIds[idx];
      stmt.assertionIds[idx] = temp;
    }

    // Update order values
    stmt.assertionIds.forEach((id, i) => {
      if (this.state.assertions[id]) {
        this.state.assertions[id].order = i;
      }
    });

    this.persistAndBroadcast();
  }

  deleteAssertion(assertionId) {
    if (this.state.editor.isLocked || !this.state.assertions[assertionId]) return;
    const asrt = this.state.assertions[assertionId];
    const stmt = this.state.statements[asrt.statementId];
    if (stmt && stmt.assertionIds) {
      stmt.assertionIds = stmt.assertionIds.filter(id => id !== assertionId);
    }
    delete this.state.assertions[assertionId];
    this.removeAssertionFromAllFacts(assertionId);
    this.persistAndBroadcast();
  }

  removeAssertionFromAllFacts(assertionId) {
    for (const fact of Object.values(this.state.facts)) {
      if (fact.strengtheningAssertions) {
        fact.strengtheningAssertions = fact.strengtheningAssertions.filter(a => a.assertionId !== assertionId);
      }
      if (fact.denyingAssertions) {
        fact.denyingAssertions = fact.denyingAssertions.filter(a => a.assertionId !== assertionId);
      }
    }
  }

  // -------------------------------------------------------------
  // FACT SHEETS & FACTS
  // -------------------------------------------------------------

  selectFactSheet(sheetId) {
    this.state.selectedFactSheetId = sheetId;
    this.notify({ localSelectionChange: true });
  }

  addFactSheet(name = 'גיליון עובדות חדש') {
    if (this.state.editor.isLocked) return;
    const id = generateId('sheet');
    this.state.factSheets[id] = {
      id,
      name,
      factIds: []
    };
    this.state.selectedFactSheetId = id;
    this.persistAndBroadcast();
    return id;
  }

  renameFactSheet(sheetId, newName) {
    if (this.state.editor.isLocked || !this.state.factSheets[sheetId]) return;
    this.state.factSheets[sheetId].name = newName.trim() || 'גיליון עובדות';
    this.persistAndBroadcast();
  }

  deleteFactSheet(sheetId) {
    if (this.state.editor.isLocked || !this.state.factSheets[sheetId]) return;
    delete this.state.factSheets[sheetId];

    // Remove sheetId references from facts
    for (const fact of Object.values(this.state.facts)) {
      if (fact.sheetIds) {
        fact.sheetIds = fact.sheetIds.filter(id => id !== sheetId);
      }
    }

    if (this.state.selectedFactSheetId === sheetId) {
      const remaining = Object.keys(this.state.factSheets);
      this.state.selectedFactSheetId = remaining.length > 0 ? remaining[0] : null;
    }
    this.persistAndBroadcast();
  }

  addFact(sheetId, factName = 'עובדה חדשה') {
    if (this.state.editor.isLocked) return;
    const factId = generateId('fact');
    this.state.facts[factId] = {
      id: factId,
      name: factName,
      sheetIds: sheetId ? [sheetId] : [],
      proved: false,
      disproved: false,
      strengtheningAssertions: [],
      denyingAssertions: []
    };

    if (sheetId && this.state.factSheets[sheetId]) {
      this.state.factSheets[sheetId].factIds.push(factId);
    }

    this.persistAndBroadcast();
    return factId;
  }

  renameFact(factId, newName) {
    if (this.state.editor.isLocked || !this.state.facts[factId]) return;
    this.state.facts[factId].name = newName.trim() || 'עובדה ללא שם';
    this.persistAndBroadcast();
  }

  setFactStatus(factId, { proved, disproved }) {
    if (this.state.editor.isLocked || !this.state.facts[factId]) return;
    const fact = this.state.facts[factId];
    if (proved !== undefined) fact.proved = !!proved;
    if (disproved !== undefined) fact.disproved = !!disproved;

    // If both get checked, let the last checked take precedence or allow separate flags
    this.persistAndBroadcast();
  }

  linkFactToSheet(sheetId, factId) {
    if (this.state.editor.isLocked || !this.state.factSheets[sheetId] || !this.state.facts[factId]) return;
    const sheet = this.state.factSheets[sheetId];
    const fact = this.state.facts[factId];

    if (!sheet.factIds.includes(factId)) sheet.factIds.push(factId);
    if (!fact.sheetIds.includes(sheetId)) fact.sheetIds.push(sheetId);

    this.persistAndBroadcast();
  }

  unlinkFactFromSheet(sheetId, factId) {
    if (this.state.editor.isLocked || !this.state.factSheets[sheetId] || !this.state.facts[factId]) return;
    const sheet = this.state.factSheets[sheetId];
    const fact = this.state.facts[factId];

    sheet.factIds = sheet.factIds.filter(id => id !== factId);
    fact.sheetIds = fact.sheetIds.filter(id => id !== sheetId);

    this.persistAndBroadcast();
  }

  deleteFact(factId) {
    if (this.state.editor.isLocked || !this.state.facts[factId]) return;
    // Remove from all sheets
    for (const sheet of Object.values(this.state.factSheets)) {
      sheet.factIds = sheet.factIds.filter(id => id !== factId);
    }
    // Remove from factTable cells
    for (const cellKey of Object.keys(this.state.factTable.cells)) {
      this.state.factTable.cells[cellKey] = this.state.factTable.cells[cellKey].filter(id => id !== factId);
    }
    delete this.state.facts[factId];
    this.persistAndBroadcast();
  }

  addAssertionToFact(factId, assertionId, type = 'strengthening') {
    if (this.state.editor.isLocked || !this.state.facts[factId] || !this.state.assertions[assertionId]) return;
    const fact = this.state.facts[factId];
    const targetList = type === 'strengthening' ? fact.strengtheningAssertions : fact.denyingAssertions;

    // Avoid duplicate additions in the same list
    if (!targetList.some(item => item.assertionId === assertionId)) {
      targetList.push({
        assertionId,
        proved: false,
        disproved: false
      });
    }

    this.persistAndBroadcast();
  }

  removeAssertionFromFact(factId, assertionId, type = 'strengthening') {
    if (this.state.editor.isLocked || !this.state.facts[factId]) return;
    const fact = this.state.facts[factId];
    if (type === 'strengthening') {
      fact.strengtheningAssertions = fact.strengtheningAssertions.filter(item => item.assertionId !== assertionId);
    } else {
      fact.denyingAssertions = fact.denyingAssertions.filter(item => item.assertionId !== assertionId);
    }
    this.persistAndBroadcast();
  }

  setFactAssertionStatus(factId, assertionId, type, { proved, disproved }) {
    if (this.state.editor.isLocked || !this.state.facts[factId]) return;
    const fact = this.state.facts[factId];
    const targetList = type === 'strengthening' ? fact.strengtheningAssertions : fact.denyingAssertions;
    const entry = targetList.find(item => item.assertionId === assertionId);
    if (entry) {
      if (proved !== undefined) entry.proved = !!proved;
      if (disproved !== undefined) entry.disproved = !!disproved;
    }
    this.persistAndBroadcast();
  }

  // -------------------------------------------------------------
  // FACT TABLE MATRIX
  // -------------------------------------------------------------

  addTableColumn(name = 'עמודה חדשה') {
    if (this.state.editor.isLocked) return;
    const colId = generateId('col');
    this.state.factTable.columns.push({ id: colId, name });
    this.persistAndBroadcast();
    return colId;
  }

  renameTableColumn(colId, newName) {
    if (this.state.editor.isLocked) return;
    const col = this.state.factTable.columns.find(c => c.id === colId);
    if (col) {
      col.name = newName.trim() || 'עמודה';
      this.persistAndBroadcast();
    }
  }

  moveTableColumn(colId, direction) {
    if (this.state.editor.isLocked) return;
    const cols = this.state.factTable.columns;
    const idx = cols.findIndex(c => c.id === colId);
    if (idx === -1) return;

    if (direction === 'left' && idx < cols.length - 1) { // Note RTL: left is higher index
      const temp = cols[idx + 1];
      cols[idx + 1] = cols[idx];
      cols[idx] = temp;
    } else if (direction === 'right' && idx > 0) {
      const temp = cols[idx - 1];
      cols[idx - 1] = cols[idx];
      cols[idx] = temp;
    }
    this.persistAndBroadcast();
  }

  deleteTableColumn(colId) {
    if (this.state.editor.isLocked) return;
    this.state.factTable.columns = this.state.factTable.columns.filter(c => c.id !== colId);
    // Clean cells
    for (const key of Object.keys(this.state.factTable.cells)) {
      if (key.endsWith(`_${colId}`)) {
        delete this.state.factTable.cells[key];
      }
    }
    this.persistAndBroadcast();
  }

  addTableRow(name = 'שורה חדשה') {
    if (this.state.editor.isLocked) return;
    const rowId = generateId('row');
    this.state.factTable.rows.push({ id: rowId, name });
    this.persistAndBroadcast();
    return rowId;
  }

  renameTableRow(rowId, newName) {
    if (this.state.editor.isLocked) return;
    const row = this.state.factTable.rows.find(r => r.id === rowId);
    if (row) {
      row.name = newName.trim() || 'שורה';
      this.persistAndBroadcast();
    }
  }

  moveTableRow(rowId, direction) {
    if (this.state.editor.isLocked) return;
    const rows = this.state.factTable.rows;
    const idx = rows.findIndex(r => r.id === rowId);
    if (idx === -1) return;

    if (direction === 'up' && idx > 0) {
      const temp = rows[idx - 1];
      rows[idx - 1] = rows[idx];
      rows[idx] = temp;
    } else if (direction === 'down' && idx < rows.length - 1) {
      const temp = rows[idx + 1];
      rows[idx + 1] = rows[idx];
      rows[idx] = temp;
    }
    this.persistAndBroadcast();
  }

  deleteTableRow(rowId) {
    if (this.state.editor.isLocked) return;
    this.state.factTable.rows = this.state.factTable.rows.filter(r => r.id !== rowId);
    // Clean cells
    for (const key of Object.keys(this.state.factTable.cells)) {
      if (key.startsWith(`${rowId}_`)) {
        delete this.state.factTable.cells[key];
      }
    }
    this.persistAndBroadcast();
  }

  addFactToCell(rowId, colId, factId) {
    if (this.state.editor.isLocked || !this.state.facts[factId]) return;
    const cellKey = `${rowId}_${colId}`;
    if (!this.state.factTable.cells[cellKey]) {
      this.state.factTable.cells[cellKey] = [];
    }
    if (!this.state.factTable.cells[cellKey].includes(factId)) {
      this.state.factTable.cells[cellKey].push(factId);
    }
    this.persistAndBroadcast();
  }

  removeFactFromCell(rowId, colId, factId) {
    if (this.state.editor.isLocked) return;
    const cellKey = `${rowId}_${colId}`;
    if (this.state.factTable.cells[cellKey]) {
      this.state.factTable.cells[cellKey] = this.state.factTable.cells[cellKey].filter(id => id !== factId);
    }
    this.persistAndBroadcast();
  }

  toggleCollapse(section) {
    if (this.state.collapsed[section] !== undefined) {
      this.state.collapsed[section] = !this.state.collapsed[section];
      this.notify();
    }
  }
}

export const store = new CaseStore();
