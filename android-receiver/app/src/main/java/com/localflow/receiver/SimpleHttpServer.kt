package com.localflow.receiver

import io.socket.engineio.server.EngineIoServer
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.PrintWriter
import java.net.ServerSocket
import java.net.Socket

/**
 * Simple HTTP server for Engine.IO WebSocket upgrade
 * 
 * This is a minimal HTTP server that handles the WebSocket upgrade handshake
 * and then delegates to Engine.IO for WebSocket communication.
 */
class SimpleHttpServer(
    private val engineIoServer: EngineIoServer,
    private val port: Int
) {
    private var serverSocket: ServerSocket? = null
    private var running = false

    fun start() {
        running = true
        serverSocket = ServerSocket(port)
        
        Thread {
            while (running) {
                try {
                    val clientSocket = serverSocket?.accept()
                    clientSocket?.let { handleClient(it) }
                } catch (e: Exception) {
                    if (running) {
                        e.printStackTrace()
                    }
                }
            }
        }.start()
    }

    private fun handleClient(socket: Socket) {
        Thread {
            try {
                val reader = BufferedReader(InputStreamReader(socket.getInputStream()))
                val writer = PrintWriter(socket.getOutputStream(), true)

                // Read request line
                val requestLine = reader.readLine() ?: return@Thread
                val parts = requestLine.split(" ")
                if (parts.size < 2) return@Thread

                val method = parts[0]
                val path = parts[1]

                // Read headers
                val headers = mutableMapOf<String, String>()
                var line: String?
                while (reader.readLine().also { line = it } != null) {
                    if (line!!.isEmpty()) break
                    val headerParts = line!!.split(": ", limit = 2)
                    if (headerParts.size == 2) {
                        headers[headerParts[0].lowercase()] = headerParts[1]
                    }
                }

                when {
                    // Engine.IO polling endpoint
                    path.startsWith("/socket.io/") -> {
                        handleEngineIORequest(socket, reader, writer, path, headers, method)
                    }
                    // Health check
                    path == "/health" -> {
                        writer.println("HTTP/1.1 200 OK")
                        writer.println("Content-Type: application/json")
                        writer.println()
                        writer.println("{\"status\":\"ok\"}")
                    }
                    // Default response
                    else -> {
                        writer.println("HTTP/1.1 200 OK")
                        writer.println("Content-Type: text/plain")
                        writer.println()
                        writer.println("LocalFlow Receiver Server")
                        writer.println("Server IP: ${ReceiverService.serverIp}")
                        writer.println("Port: $port")
                    }
                }

                socket.close()
            } catch (e: Exception) {
                e.printStackTrace()
                try {
                    socket.close()
                } catch (_: Exception) {}
            }
        }.start()
    }

    private fun handleEngineIORequest(
        socket: Socket,
        reader: BufferedReader,
        writer: PrintWriter,
        path: String,
        headers: Map<String, String>,
        method: String
    ) {
        try {
            // Check if this is a WebSocket upgrade request
            val upgrade = headers["upgrade"]?.lowercase()
            val connection = headers["connection"]?.lowercase() ?: ""

            if (upgrade == "websocket" && connection.contains("upgrade")) {
                // Handle WebSocket upgrade
                handleWebSocketUpgrade(socket, reader, writer, headers, path)
            } else {
                // Handle HTTP polling (simplified - just return OK)
                writer.println("HTTP/1.1 200 OK")
                writer.println("Content-Type: application/json")
                writer.println("Access-Control-Allow-Origin: *")
                writer.println()
                writer.println("{\"code\":0,\"message\":\"Transport unknown\"}")
            }
        } catch (e: Exception) {
            e.printStackTrace()
            writer.println("HTTP/1.1 500 Internal Server Error")
            writer.println()
        }
    }

    private fun handleWebSocketUpgrade(
        socket: Socket,
        reader: BufferedReader,
        writer: PrintWriter,
        headers: Map<String, String>,
        path: String
    ) {
        val key = headers["sec-websocket-key"] ?: return

        // Send WebSocket accept response
        val magic = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
        val accept = java.util.Base64.getEncoder().encodeToString(
            java.security.MessageDigest.getInstance("SHA-1")
                .digest((key + magic).toByteArray())
        )

        writer.println("HTTP/1.1 101 Switching Protocols")
        writer.println("Upgrade: websocket")
        writer.println("Connection: Upgrade")
        writer.println("Sec-WebSocket-Accept: $accept")
        writer.println()
        writer.flush()

        // Hand off to Engine.IO WebSocket handler
        // This is simplified - in production use a proper WebSocket library
        // For now, we'll close the connection after handshake
        // A full implementation would use a proper WebSocket server library
    }

    fun stop() {
        running = false
        serverSocket?.close()
    }
}
