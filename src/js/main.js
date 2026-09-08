// ==========================================================================
// COURT CASE WITNESS & FACT MANAGER - MAIN ENTRY POINT
// ==========================================================================

import { store } from './store.js';
import { TopBar } from './components/TopBar.js';
import { FactTableTab } from './components/FactTableTab.js';
import { FactsTab } from './components/FactsTab.js';
import { WitnessesTab } from './components/WitnessesTab.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize components
  const topBar = new TopBar();
  const tableTab = new FactTableTab();
  const factsTab = new FactsTab();
  const witnessesTab = new WitnessesTab();

  // Subscribe to store updates (both local actions and real-time cross-tab broadcasts)
  store.subscribe((state, meta) => {
    topBar.render();

    // Re-render active tab view
    if (state.activeTab === 'table') {
      tableTab.render();
    } else if (state.activeTab === 'facts') {
      factsTab.render();
    } else if (state.activeTab === 'witnesses') {
      witnessesTab.render();
    }

    if (meta?.fromSync) {
      // Show brief sync pulse
      const syncDot = document.querySelector('.sync-dot');
      if (syncDot) {
        syncDot.style.backgroundColor = '#38bdf8';
        setTimeout(() => {
          syncDot.style.backgroundColor = '#22c55e';
        }, 600);
      }
    }
  });

  // Hotkey support: Esc closes modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('modal-container');
      if (modal && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        modal.innerHTML = '';
      }
      const settingsMenu = document.getElementById('settings-menu');
      if (settingsMenu && !settingsMenu.classList.contains('hidden')) {
        settingsMenu.classList.add('hidden');
      }
    }
  });

  console.log('Court Case Manager initialized successfully.');
});
