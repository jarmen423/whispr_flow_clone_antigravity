/**
 * Whispr Flow - Chrome Extension Popup
 * 
 * Purpose & Reasoning:
 *     Manages the popup UI for the Whispr Flow Chrome extension. Handles
 *     displaying connection status, configuring the Device ID, and toggling
 *     auto-paste functionality. Firebase credentials are pre-configured,
 *     so users only need to enter their Device ID from the mobile app.
 * 
 * Role in Codebase:
 *     This script provides the frontend interface for the extension popup,
 *     communicating with the background service worker via Chrome messaging.
 * 
 * Key Technologies/APIs:
 *     - Chrome Storage API for persisting settings
 *     - Chrome Runtime Messaging for background communication
 */

document.addEventListener('DOMContentLoaded', async () => {
  // DOM elements
  const connectionStatus = document.getElementById('connection-status');
  const statusText = document.getElementById('status-text');
  const statusDot = connectionStatus.querySelector('.status-dot');
  const deviceIdDisplay = document.getElementById('device-id-display');
  const autoPasteToggle = document.getElementById('auto-paste-toggle');
  const lastReceivedSection = document.getElementById('last-received-section');
  const lastReceivedText = document.getElementById('last-received-text');
  const deviceIdInput = document.getElementById('device-id-input');
  const saveBtn = document.getElementById('save-btn');

  /**
   * Load and display the current connection status from the background worker.
   * 
   * Extended Description:
   *     Queries the background service worker for the current connection state,
   *     device ID, last received transcription, and auto-paste setting. Updates
   *     the popup UI to reflect the current status.
   * 
   * Key Technologies/APIs:
   *     - Chrome Runtime sendMessage for background communication
   */
  async function loadStatus() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getStatus' });

      if (response) {
        // Update status display
        if (response.isRunning) {
          statusText.textContent = 'Connected';
          statusDot.className = 'status-dot connected';
        } else if (response.deviceId) {
          statusText.textContent = 'Connecting...';
          statusDot.className = 'status-dot warning';
        } else {
          statusText.textContent = 'Enter Device ID';
          statusDot.className = 'status-dot disconnected';
        }

        // Update device ID display
        if (response.deviceId) {
          deviceIdDisplay.textContent = response.deviceId;
          deviceIdInput.value = response.deviceId;
        }

        // Update auto-paste toggle
        autoPasteToggle.checked = response.autoPaste;

        // Show last received transcription
        if (response.lastReceived) {
          lastReceivedText.textContent = response.lastReceived.text;
          lastReceivedSection.classList.remove('hidden');
        }
      }
    } catch (err) {
      console.error('[Whispr] Failed to load status:', err);
    }
  }

  /**
   * Load saved settings from Chrome storage.
   * 
   * Extended Description:
   *     Retrieves the saved Device ID and auto-paste preference from Chrome's
   *     local storage API and populates the form fields.
   * 
   * Key Technologies/APIs:
   *     - Chrome Storage local API
   */
  async function loadSettings() {
    const settings = await chrome.storage.local.get(['deviceId', 'autoPaste']);

    if (settings.deviceId) {
      deviceIdInput.value = settings.deviceId;
    }
    if (settings.autoPaste !== undefined) {
      autoPasteToggle.checked = settings.autoPaste;
    }
  }

  /**
   * Save settings and initiate connection.
   * 
   * Extended Description:
   *     Validates the Device ID input, sends the settings to the background
   *     service worker, and triggers a connection to Firebase with the
   *     pre-configured credentials. Updates button state during the process.
   */
  saveBtn.addEventListener('click', async () => {
    const deviceId = deviceIdInput.value.trim();
    const autoPaste = autoPasteToggle.checked;

    if (!deviceId) {
      alert('Please enter your Device ID from the iPhone app');
      return;
    }

    saveBtn.textContent = 'Connecting...';
    saveBtn.disabled = true;

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'saveSettings',
        deviceId,
        autoPaste
      });

      if (response.success) {
        saveBtn.textContent = 'Connected!';
        setTimeout(() => {
          saveBtn.textContent = 'Save & Connect';
          saveBtn.disabled = false;
        }, 2000);
        await loadStatus();
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      console.error('[Whispr] Failed to save settings:', err);
      saveBtn.textContent = 'Error - Try Again';
      saveBtn.disabled = false;
    }
  });

  /**
   * Handle auto-paste toggle changes.
   * 
   * Extended Description:
   *     Sends the updated auto-paste preference to the background worker
   *     when the user toggles the checkbox.
   */
  autoPasteToggle.addEventListener('change', async () => {
    await chrome.runtime.sendMessage({
      action: 'setAutoPaste',
      enabled: autoPasteToggle.checked
    });
  });

  // Initial load
  await loadSettings();
  await loadStatus();
});
