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

    val rootView: View = findViewById(android.R.id.content)
    
    ViewCompat.setOnApplyWindowInsetsListener(rootView) { v, insets ->
      val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
      val imeVisible = insets.isVisible(WindowInsetsCompat.Type.ime())
      val imeHeight = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom
  
      val bottomPadding = if (imeVisible) imeHeight else systemBars.bottom
      
      v.setPadding(
          systemBars.left,
          systemBars.top,
          systemBars.right,
          bottomPadding
      )
      insets
    }

  }

  override fun onWebViewCreate(webView: WebView) {
    super.onWebViewCreate(webView)

    webView.setBackgroundColor(0x00000000)
    
    webView.fitsSystemWindows = true

    android.util.Log.i("MainActivity", "WebView created, waiting for Rust hide() call...")
  }
}