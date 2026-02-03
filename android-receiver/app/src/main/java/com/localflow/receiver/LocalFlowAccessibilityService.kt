package com.localflow.receiver

import android.accessibilityservice.AccessibilityService
import android.content.ClipboardManager
import android.content.Context
import android.os.Bundle
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

/**
 * Accessibility Service for LocalFlow Receiver
 * 
 * This service can:
 * 1. Detect when text input fields are focused
 * 2. Automatically paste received text into them
 * 3. Show a floating action button for manual paste
 * 
 * Requires user to enable in Settings > Accessibility > LocalFlow Receiver
 */
class LocalFlowAccessibilityService : AccessibilityService() {
    
    companion object {
        const val TAG = "LocalFlowAccessibility"
        var instance: LocalFlowAccessibilityService? = null
    }

    private var lastReceivedText: String = ""
    private var pendingPaste = false

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        Log.d(TAG, "Accessibility service connected")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        // We mainly care about window state changes and text input focus
        when (event.eventType) {
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED,
            AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED -> {
                // Could show floating paste button here
            }
            AccessibilityEvent.TYPE_VIEW_FOCUSED -> {
                // Check if focused view is editable
                event.source?.let { node ->
                    if (node.isEditable) {
                        Log.d(TAG, "Editable field focused: ${node.packageName}")
                        // If we have pending text, paste it
                        if (pendingPaste && lastReceivedText.isNotEmpty()) {
                            pasteIntoNode(node, lastReceivedText)
                            pendingPaste = false
                        }
                    }
                }
            }
        }
    }

    override fun onInterrupt() {
        Log.d(TAG, "Accessibility service interrupted")
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
        Log.d(TAG, "Accessibility service destroyed")
    }

    /**
     * Called by ReceiverService when new text arrives
     */
    fun pasteText(text: String) {
        lastReceivedText = text
        
        // Try to find currently focused editable field
        val rootNode = rootInActiveWindow
        if (rootNode != null) {
            val focusedNode = findFocusedEditableNode(rootNode)
            if (focusedNode != null) {
                pasteIntoNode(focusedNode, text)
                return
            }
        }
        
        // If no focused field found, set pending flag
        // Next time an editable field is focused, we'll paste
        pendingPaste = true
        Log.d(TAG, "No focused editable field found, will paste on next focus")
    }

    private fun findFocusedEditableNode(root: AccessibilityNodeInfo): AccessibilityNodeInfo? {
        // Check if this node is focused and editable
        if (root.isFocused && root.isEditable) {
            return root
        }
        
        // Recursively search children
        for (i in 0 until root.childCount) {
            val child = root.getChild(i)
            if (child != null) {
                val result = findFocusedEditableNode(child)
                if (result != null) {
                    return result
                }
            }
        }
        
        return null
    }

    private fun pasteIntoNode(node: AccessibilityNodeInfo, text: String) {
        try {
            // Method 1: Use ACTION_PASTE (if clipboard has content)
            val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = android.content.ClipData.newPlainText("LocalFlow", text)
            clipboard.setPrimaryClip(clip)
            
            val pasteArgs = Bundle()
            val success = node.performAction(AccessibilityNodeInfo.ACTION_PASTE, pasteArgs)
            
            if (success) {
                Log.d(TAG, "Pasted text successfully via ACTION_PASTE")
                return
            }
            
            // Method 2: Set text directly (requires focus)
            if (node.isFocused) {
                val arguments = Bundle()
                arguments.putCharSequence(
                    AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE,
                    text
                )
                val setTextSuccess = node.performAction(
                    AccessibilityNodeInfo.ACTION_SET_TEXT,
                    arguments
                )
                
                if (setTextSuccess) {
                    Log.d(TAG, "Pasted text successfully via ACTION_SET_TEXT")
                    return
                }
            }
            
            Log.w(TAG, "Could not paste text - no method worked")
            
        } catch (e: Exception) {
            Log.e(TAG, "Error pasting text", e)
        }
    }

    /**
     * Alternative: Type character by character (slower but more compatible)
     */
    private fun typeTextSlowly(node: AccessibilityNodeInfo, text: String) {
        // This is a fallback method if the above don't work
        // Implementation would send individual key events
        // For now, we'll rely on clipboard + ACTION_PASTE
        Log.d(TAG, "Slow typing not implemented, relying on clipboard")
    }
}
