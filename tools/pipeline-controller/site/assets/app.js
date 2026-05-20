'use strict';

/**
 * Pipeline Controller — Client-side FSM and state polling.
 * Communicates with the extension server via /api/state and /api/stage/:id/start.
 */

const POLL_INTERVAL = 2000;
const STAGES = ['research', 'plan', 'implement', 'verify'];

let currentState = null;

// --- Polling ---

async function fetchState() {
  try {
    const res = await fetch('/api/state');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    currentState = data;
    render(data);
  } catch (err) {
    console.error('State fetch failed:', err.message);
  }
}

// --- Rendering ---

function render(state) {
  document.getElementById('issue-number').textContent = state.issue;

  for (const stage of state.stages) {
    const card = document.getElementById(`stage-${stage.id}`);
    if (!card) continue;

    // Update card status class
    card.className = `stage-card status-${stage.status}`;

    // Update badge text
    const badge = card.querySelector('.status-badge');
    badge.textContent = stage.status;

    // Update play button state
    const playBtn = card.querySelector('.play-btn');
    if (stage.status === 'ready') {
      playBtn.disabled = false;
      playBtn.setAttribute('aria-disabled', 'false');
      playBtn.textContent = '▶ Start';
    } else if (stage.status === 'running') {
      playBtn.disabled = true;
      playBtn.setAttribute('aria-disabled', 'true');
      playBtn.textContent = '⏳ Running...';
    } else if (stage.status === 'done') {
      playBtn.disabled = true;
      playBtn.setAttribute('aria-disabled', 'true');
      playBtn.textContent = '✅ Complete';
    } else if (stage.status === 'failed') {
      playBtn.disabled = false;
      playBtn.setAttribute('aria-disabled', 'false');
      playBtn.textContent = '🔄 Retry';
    } else {
      playBtn.disabled = true;
      playBtn.setAttribute('aria-disabled', 'true');
      playBtn.textContent = '🔒 Locked';
    }

    // Update ARIA on locked cards
    if (stage.status === 'locked') {
      card.setAttribute('aria-disabled', 'true');
      card.setAttribute('tabindex', '-1');
    } else {
      card.removeAttribute('aria-disabled');
      card.removeAttribute('tabindex');
    }
  }
}

// --- Actions ---

async function startStage(stageId) {
  try {
    const res = await fetch(`/api/stage/${stageId}/start`, { method: 'POST' });
    const data = await res.json();
    if (data.error) {
      console.error('Start failed:', data.error);
      return;
    }
    if (data.state) {
      currentState = data.state;
      render(data.state);
    }
  } catch (err) {
    console.error('Start stage failed:', err.message);
  }
}

async function retryStage(stageId) {
  try {
    const res = await fetch(`/api/stage/${stageId}/retry`, { method: 'POST' });
    const data = await res.json();
    if (data.state) {
      currentState = data.state;
      render(data.state);
    }
  } catch (err) {
    console.error('Retry failed:', err.message);
  }
}

// --- Event listeners ---

document.addEventListener('DOMContentLoaded', () => {
  // Attach play button handlers
  for (const stageId of STAGES) {
    const card = document.getElementById(`stage-${stageId}`);
    const playBtn = card.querySelector('.play-btn');

    playBtn.addEventListener('click', () => {
      if (!currentState) return;
      const stage = currentState.stages.find(s => s.id === stageId);
      if (stage.status === 'ready') {
        startStage(stageId);
      } else if (stage.status === 'failed') {
        retryStage(stageId);
      }
    });
  }

  // Initial fetch then poll
  fetchState();
  setInterval(fetchState, POLL_INTERVAL);
});

// --- Info panel toggle ---

function toggleInfo(stageId) {
  const panel = document.getElementById(`info-${stageId}`);
  if (panel.hidden) {
    panel.hidden = false;
    panel.setAttribute('aria-expanded', 'true');
  } else {
    panel.hidden = true;
    panel.setAttribute('aria-expanded', 'false');
  }
}
