use tauri_plugin_prevent_default::PlatformOptions;

#[tauri::command]
async fn handle_window_action(
    _app: tauri::AppHandle,
    window: tauri::Window,
    action: &str,
) -> Result<(), String> {
    let rs = match action {
        "close" => window.close(),
        "hide" => window.hide(),
        "min" => window.minimize(),
        "max" => {
            if window.is_maximized().unwrap() {
                window.unmaximize().unwrap()
            } else {
                window.maximize().unwrap()
            }
            Ok(())
        }

        _ => Ok(()),
    };

    if rs.is_err() {
        return Err("Failed to execute the action".to_string());
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let prevent = tauri_plugin_prevent_default::Builder::new()
        .platform(
            PlatformOptions::new()
                .general_autofill(false)
                .password_autosave(false)
                .browser_accelerator_keys(false)
                .default_context_menus(false)
                .default_script_dialogs(false)
                .built_in_error_page(false)
                .pinch_zoom(false)
                .swipe_navigation(false),
        )
        .build();

    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(prevent);

    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            use tauri_plugin_deep_link::DeepLinkExt;
            println!("new instance: {argv:?}");
            let _ = app.deep_link().register_all();
        }));
    }

    builder = builder.invoke_handler(tauri::generate_handler![handle_window_action]);

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
