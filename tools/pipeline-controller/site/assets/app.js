'use strict';

/**
 * Pipeline Controller — app.js
 * Vanilla JavaScript FSM client with 2-second polling.
 * No external dependencies.
 */

(function () {
  var POLL_INTERVAL = 2000;
  var API_STATE_URL = '/api/state';
  var pollTimer = null;
  var lastError = false;

  var stageIds = ['research', 'plan', 'implement', 'verify'];

  /**
   * Fetch current pipeline state from the API.
   */
  function fetchState() {
    fetch(API_STATE_URL)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }
        return response.json();
      })
      .then(function (state) {
        clearError();
        renderState(state);
      })
      .catch(function (err) {
        showError('Connection error: ' + err.message);
      });
  }

  /**
   * Render the pipeline state to the UI.
   */
  function renderState(state) {
    // Update issue badge
    var badge = document.getElementById('issue-badge');
    if (badge && state.issue) {
      badge.textContent = 'Issue #' + state.issue + (state.repo ? ' — ' + state.repo : '');
    }

    // Update status line
    var statusLine = document.getElementById('status-line');
    if (statusLine) {
      statusLine.textContent = 'Last updated: ' + (state.lastUpdated || 'unknown');
    }

    // Update each stage card
    if (!state.stages) return;

    state.stages.forEach(function (stage) {
      var card = document.getElementById('stage-' + stage.id);
      if (!card) return;

      // Remove all status classes
      card.classList.remove('status-locked', 'status-ready', 'status-running', 'status-done', 'status-failed');
      // Add current status class
      card.classList.add('status-' + stage.status);

      // Update badge text
      var badge = card.querySelector('.status-badge');
      if (badge) {
        badge.textContent = stage.status;
      }

      // Update play button state
      var playBtn = card.querySelector('.btn-play');
      if (playBtn) {
        playBtn.disabled = stage.status !== 'ready';
      }

      // Update complete button state
      var completeBtn = card.querySelector('.btn-complete');
      if (completeBtn) {
        completeBtn.disabled = stage.status !== 'running';
      }
    });
  }

  /**
   * Start a stage (set to running).
   */
  function startStage(stageId) {
    fetch('/api/stage/' + stageId + '/start', { method: 'POST' })
      .then(function (response) {
        if (!response.ok) {
          return response.json().then(function (data) {
            throw new Error(data.error || 'Failed to start stage');
          });
        }
        return response.json();
      })
      .then(function () {
        fetchState();
      })
      .catch(function (err) {
        showError('Failed to start ' + stageId + ': ' + err.message);
      });
  }

  /**
   * Complete a stage (set to done).
   */
  function completeStage(stageId) {
    fetch('/api/stage/' + stageId + '/complete', { method: 'POST' })
      .then(function (response) {
        if (!response.ok) {
          return response.json().then(function (data) {
            throw new Error(data.error || 'Failed to complete stage');
          });
        }
        return response.json();
      })
      .then(function () {
        fetchState();
      })
      .catch(function (err) {
        showError('Failed to complete ' + stageId + ': ' + err.message);
      });
  }

  /**
   * Toggle info panel visibility.
   */
  function toggleInfo(stageId) {
    var panel = document.getElementById('info-' + stageId);
    var btn = document.querySelector('.btn-info[data-stage="' + stageId + '"]');
    if (!panel) return;

    var isHidden = panel.hidden;
    panel.hidden = !isHidden;
    if (btn) {
      btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    }
  }

  /**
   * Show error message.
   */
  function showError(message) {
    lastError = true;
    var el = document.getElementById('error-message');
    if (el) {
      el.textContent = message;
      el.hidden = false;
    }
  }

  /**
   * Clear error message.
   */
  function clearError() {
    if (!lastError) return;
    lastError = false;
    var el = document.getElementById('error-message');
    if (el) {
      el.textContent = '';
      el.hidden = true;
    }
  }

  /**
   * Bind event listeners to buttons.
   */
  function bindEvents() {
    document.addEventListener('click', function (e) {
      var target = e.target;

      if (target.classList.contains('btn-play') && !target.disabled) {
        var stageId = target.getAttribute('data-stage');
        if (stageId) startStage(stageId);
      }

      if (target.classList.contains('btn-complete') && !target.disabled) {
        var stageId2 = target.getAttribute('data-stage');
        if (stageId2) completeStage(stageId2);
      }

      if (target.classList.contains('btn-info')) {
        var stageId3 = target.getAttribute('data-stage');
        if (stageId3) toggleInfo(stageId3);
      }
    });
  }

  /**
   * Initialize the application.
   */
  function init() {
    bindEvents();
    fetchState();
    pollTimer = setInterval(fetchState, POLL_INTERVAL);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
