pub mod commands;

pub use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            commands::get_system_summary,
            commands::get_cpu_info,
            commands::get_memory_info,
            commands::get_disk_info,
            commands::get_process_list,
            commands::get_service_list,
            commands::get_network_interfaces,
            commands::ping_host,
            commands::compute_text_hashes,
            commands::compute_file_hashes,
            commands::get_security_status,
            commands::get_temp_file_categories,
            commands::clean_temp_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
