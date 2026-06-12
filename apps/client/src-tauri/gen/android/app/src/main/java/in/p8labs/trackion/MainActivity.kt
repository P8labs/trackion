package `in`.p8labs.trackion

import android.os.Bundle
import android.view.View
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat


class MainActivity : TauriActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
      enableEdgeToEdge()
        super.onCreate(savedInstanceState)

    }

    override fun onWebViewCreate(webView: WebView) {
        super.onWebViewCreate(webView)

        // Enable Chrome inspect debugging
        WebView.setWebContentsDebuggingEnabled(true)

        // Transparent background
        webView.setBackgroundColor(0x00000000)

        // Better rendering defaults
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.allowFileAccess = true
        webView.settings.allowContentAccess = true
        webView.settings.loadsImagesAutomatically = true
        webView.settings.mediaPlaybackRequiresUserGesture = false

        android.util.Log.i("MainActivity", "Tauri WebView initialized")
    }
}