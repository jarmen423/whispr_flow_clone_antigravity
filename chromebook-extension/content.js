/**
 * Whispr Flow - Content Script
 * 
 * Purpose & Reasoning:
 *     This content script runs on all web pages and provides a communication bridge
 *     between the background service worker and the active page. While the primary
 *     paste functionality is handled via chrome.scripting.executeScript from the
 *     background worker, this content script can be used for enhanced text field
 *     detection and focus management.
 * 
 * Role in Codebase:
 *     This script is injected into every webpage the user visits, enabling the
 *     extension to detect and interact with text input fields for voice transcription
 *     paste operations.
 * 
 * Key Technologies/APIs:
 *     - Chrome Content Scripts API
 *     - DOM Mutation Observer for dynamic content detection
 *     - Chrome Runtime Messaging for background communication
 */

// Content script namespace to avoid global pollution
const WhisprFlow = {
    /**
     * Tracks the last focused input element for paste operations.
     * 
     * Extended Description:
     *     When the background script attempts to paste transcribed text, it needs
     *     to know which element should receive the text. This variable stores a
     *     reference to the last focused input-capable element on the page.
     * 
     * @type {HTMLElement|null}
     */
    lastFocusedInput: null,

    /**
     * Initialize the content script and set up event listeners.
     * 
     * Extended Description:
     *     Sets up focus tracking for input elements across the page. This enables
     *     the extension to maintain awareness of where the user intends to paste
     *     transcribed text, even if focus changes during voice recording.
     * 
     * Key Technologies/APIs:
     *     - DOM Event Listeners (focusin)
     *     - Chrome Runtime onMessage for background communication
     */
    init() {
        // Track focus on input elements
        document.addEventListener('focusin', (event) => {
            const target = event.target;
            if (this.isInputElement(target)) {
                this.lastFocusedInput = target;
            }
        });

        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async response
        });

        console.log('[Whispr Flow] Content script initialized');
    },

    /**
     * Check if an element can accept text input.
     * 
     * Extended Description:
     *     Determines whether a given DOM element is capable of receiving text input.
     *     This includes standard input/textarea elements as well as contentEditable
     *     elements used by rich text editors (e.g., Google Docs, Notion).
     * 
     * Args:
     *     element (HTMLElement): The DOM element to check.
     * 
     * Returns:
     *     boolean: True if the element can accept text input, false otherwise.
     * 
     * Key Technologies/APIs:
     *     - HTMLElement.contentEditable property
     *     - HTMLInputElement/HTMLTextAreaElement detection
     * 
     * @param {HTMLElement} element - The DOM element to check
     * @returns {boolean} True if the element can accept text input
     */
    isInputElement(element) {
        if (!element) return false;

        const tagName = element.tagName?.toUpperCase();

        // Standard form inputs
        if (tagName === 'TEXTAREA') return true;
        if (tagName === 'INPUT') {
            const type = element.type?.toLowerCase();
            const textTypes = ['text', 'search', 'url', 'email', 'password', 'tel', 'number'];
            return textTypes.includes(type) || !type;
        }

        // ContentEditable elements (rich text editors)
        return element.isContentEditable === true;
    },

    /**
     * Get the currently focused input element or the last known focused input.
     * 
     * Extended Description:
     *     Returns the element that should receive pasted text. Prioritizes the
     *     currently active element if it's an input, otherwise falls back to
     *     the last tracked focused input element.
     * 
     * Returns:
     *     HTMLElement|null: The target element for paste operations, or null if none found.
     * 
     * @returns {HTMLElement|null} The target input element
     */
    getTargetInput() {
        const active = document.activeElement;
        if (this.isInputElement(active)) {
            return active;
        }
        return this.lastFocusedInput;
    },

    /**
     * Handle messages from the background script.
     * 
     * Extended Description:
     *     Processes incoming messages from the extension's background service worker.
     *     Currently supports checking for active input fields and paste readiness.
     * 
     * Args:
     *     request (Object): The message request object containing action and data.
     *     sender (Object): Information about the message sender.
     *     sendResponse (Function): Callback to send a response back.
     * 
     * Key Technologies/APIs:
     *     - Chrome Runtime Messaging API
     * 
     * @param {Object} request - The incoming message
     * @param {Object} sender - Message sender info
     * @param {Function} sendResponse - Response callback
     */
    handleMessage(request, sender, sendResponse) {
        switch (request.action) {
            case 'checkInputReady':
                const targetInput = this.getTargetInput();
                sendResponse({
                    ready: !!targetInput,
                    inputType: targetInput?.tagName?.toLowerCase() || null,
                    isContentEditable: targetInput?.isContentEditable || false
                });
                break;

            case 'ping':
                sendResponse({ pong: true, timestamp: Date.now() });
                break;

            default:
                sendResponse({ error: 'Unknown action' });
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WhisprFlow.init());
} else {
    WhisprFlow.init();
}
