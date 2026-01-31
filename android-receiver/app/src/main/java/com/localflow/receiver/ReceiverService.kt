package com.localflow.receiver

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import org.java_websocket.WebSocket
import org.java_websocket.handshake.ClientHandshake
import org.java_websocket.server.WebSocketServer
import org.json.JSONObject
import java.lang.Exception
import java.net.Inet4Address
import java.net.InetSocketAddress
import java.net.NetworkInterface

/**
 * ReceiverService - WebSocket Server
 * 
 * Runs a WebSocket server on port 3002.
 * iPhone PWA connects and sends text to paste.
 */
class ReceiverService : Service() {
    private var webSocketServer: LocalWebSocketServer? = null
    private lateinit var notificationManager: NotificationManager
    private val serverPort = 3002

    companion object {
        const val TAG = "LocalFlowReceiver"
        const val CHANNEL_ID = "localflow_receiver"
        const val NOTIFICATION_ID = 1
        var isRunning = false
        var serverIp: String = ""
    }

    override fun onCreate() {
        super.onCreate()
        notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        createNotificationChannel()
        serverIp = getDeviceIpAddress() ?: "Unknown"
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Start as foreground service
        startForeground(NOTIFICATION_ID, createNotification("Starting server..."))
        
        startWebSocketServer()
        isRunning = true
        
        return START_STICKY
    }

    private fun startWebSocketServer() {
        try {
            webSocketServer = LocalWebSocketServer(serverPort)
            webSocketServer?.start()
            
            Log.d(TAG, "WebSocket server started on port $serverPort")
            Log.d(TAG, "Server address: ws://$serverIp:$serverPort")
            
            updateNotification("Server running on $serverIp:$serverPort")
            
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start server", e)
            updateNotification("Error: ${e.message}")
        }
    }

    inner class LocalWebSocketServer(port: Int) : WebSocketServer(InetSocketAddress(port)) {
        
        override fun onOpen(conn: WebSocket, handshake: ClientHandshake) {
            Log.d(TAG, "Client connected: ${conn.remoteSocketAddress}")
            updateNotification("Client connected - Ready")
            
            // Send connection confirmation
            val response = JSONObject().apply {
                put("type", "connection_confirmed")
                put("serverTime", System.currentTimeMillis())
            }
            conn.send(response.toString())
        }

        override fun onClose(conn: WebSocket, code: Int, reason: String, remote: Boolean) {
            Log.d(TAG, "Client disconnected: $reason")
            updateNotification("Server running on $serverIp:$serverPort")
        }

        override fun onMessage(conn: WebSocket, message: String) {
            Log.d(TAG, "Received message: ${message.take(100)}...")
            
            try {
                val json = JSONObject(message)
                val event = json.optString("event", "")
                val data = json.optJSONObject("data")
                
                when (event) {
                    "paste_text" -> {
                        val text = data?.optString("text", "") ?: ""
                        val wordCount = data?.optInt("wordCount", 0) ?: 0
                        
                        handleReceivedText(text, wordCount)
                        
                        // Send acknowledgment
                        val response = JSONObject().apply {
                            put("type", "received")
                            put("success", true)
                            put("wordCount", wordCount)
                        }
                        conn.send(response.toString())
                    }
                    else -> {
                        Log.w(TAG, "Unknown event: $event")
                    }
                }
                
            } catch (e: Exception) {
                Log.e(TAG, "Error processing message", e)
            }
        }

        override fun onError(conn: WebSocket?, ex: Exception) {
            Log.e(TAG, "WebSocket error", ex)
        }

        override fun onStart() {
            Log.d(TAG, "Server started successfully")
        }
    }

    private fun handleReceivedText(text: String, wordCount: Int) {
        Log.d(TAG, "Received text ($wordCount words): ${text.take(50)}...")
        
        // Copy to clipboard
        copyToClipboard(text)
        
        // Show notification
        showPasteNotification(text, wordCount)
        
        // Try accessibility paste
        LocalFlowAccessibilityService.instance?.pasteText(text)
    }

    private fun copyToClipboard(text: String) {
        try {
            val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = ClipData.newPlainText("LocalFlow", text)
            clipboard.setPrimaryClip(clip)
            Log.d(TAG, "Copied to clipboard")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to copy to clipboard", e)
        }
    }

    private fun showPasteNotification(text: String, wordCount: Int) {
        val truncatedText = if (text.length > 100) text.take(100) + "..." else text
        
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_menu_edit)
            .setContentTitle("Text Received ($wordCount words)")
            .setContentText(truncatedText)
            .setStyle(NotificationCompat.BigTextStyle().bigText(truncatedText))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }

    private fun getDeviceIpAddress(): String? {
        try {
            val interfaces = NetworkInterface.getNetworkInterfaces()
            while (interfaces.hasMoreElements()) {
                val intf = interfaces.nextElement()
                // Skip mobile data (cellular) - only use WiFi
                if (intf.name.contains("wlan") || intf.name.contains("eth")) {
                    val addrs = intf.inetAddresses
                    while (addrs.hasMoreElements()) {
                        val addr = addrs.nextElement()
                        if (!addr.isLoopbackAddress && addr is Inet4Address) {
                            return addr.hostAddress
                        }
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting IP address", e)
        }
        return null
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "LocalFlow Receiver",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "WebSocket server for receiving dictation"
            }
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(content: String): Notification {
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("LocalFlow Receiver")
            .setContentText(content)
            .setSmallIcon(android.R.drawable.ic_menu_info_details)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    private fun updateNotification(content: String) {
        notificationManager.notify(NOTIFICATION_ID, createNotification(content))
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        try {
            webSocketServer?.stop()
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping server", e)
        }
        Log.d(TAG, "Service destroyed")
    }
}
