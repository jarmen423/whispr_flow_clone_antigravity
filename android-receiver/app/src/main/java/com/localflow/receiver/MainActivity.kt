package com.localflow.receiver

import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import com.localflow.receiver.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private var isServiceRunning = false

    companion object {
        const val PERMISSION_REQUEST_CODE = 1001
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupUI()
        checkPermissions()
    }

    private fun setupUI() {
        // Load saved server URL
        val prefs = getSharedPreferences("LocalFlowReceiver", MODE_PRIVATE)
        val savedUrl = prefs.getString("server_url", "http://192.168.1.100:3002")
        binding.serverUrlInput.setText(savedUrl)

        // Connect button
        binding.connectButton.setOnClickListener {
            toggleConnection()
        }

        // Accessibility settings button
        binding.accessibilityButton.setOnClickListener {
            openAccessibilitySettings()
        }

        // Update UI state
        updateConnectionState()
    }

    private fun toggleConnection() {
        if (isServiceRunning) {
            stopReceiverService()
        } else {
            startReceiverService()
        }
    }

    private fun startReceiverService() {
        val serverUrl = binding.serverUrlInput.text.toString().trim()
        
        if (serverUrl.isEmpty()) {
            Toast.makeText(this, "Please enter server URL", Toast.LENGTH_SHORT).show()
            return
        }

        // Save URL
        getSharedPreferences("LocalFlowReceiver", MODE_PRIVATE)
            .edit()
            .putString("server_url", serverUrl)
            .apply()

        // Start service
        val intent = Intent(this, ReceiverService::class.java).apply {
            putExtra("server_url", serverUrl)
        }
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }

        isServiceRunning = true
        updateConnectionState()
        Toast.makeText(this, "Receiver started", Toast.LENGTH_SHORT).show()
    }

    private fun stopReceiverService() {
        stopService(Intent(this, ReceiverService::class.java))
        isServiceRunning = false
        updateConnectionState()
        Toast.makeText(this, "Receiver stopped", Toast.LENGTH_SHORT).show()
    }

    private fun updateConnectionState() {
        binding.apply {
            if (isServiceRunning) {
                connectButton.text = "Stop Receiver"
                connectButton.setBackgroundColor(ContextCompat.getColor(this@MainActivity, android.R.color.holo_red_dark))
                statusText.text = "● Connected and listening"
                statusText.setTextColor(ContextCompat.getColor(this@MainActivity, android.R.color.holo_green_dark))
            } else {
                connectButton.text = "Start Receiver"
                connectButton.setBackgroundColor(ContextCompat.getColor(this@MainActivity, android.R.color.holo_green_dark))
                statusText.text = "○ Not connected"
                statusText.setTextColor(ContextCompat.getColor(this@MainActivity, android.R.color.darker_gray))
            }
        }
    }

    private fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        startActivity(intent)
        Toast.makeText(this, "Enable 'LocalFlow Receiver' accessibility service", Toast.LENGTH_LONG).show()
    }

    private fun checkPermissions() {
        val permissions = mutableListOf<String>()
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) 
                != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        if (permissions.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, permissions.toTypedArray(), PERMISSION_REQUEST_CODE)
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
                Toast.makeText(this, "Permissions granted", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(this, "Some permissions denied. Notifications may not work.", Toast.LENGTH_LONG).show()
            }
        }
    }

    override fun onResume() {
        super.onResume()
        // Check if service is actually running
        isServiceRunning = ReceiverService.isRunning
        updateConnectionState()
    }
}
