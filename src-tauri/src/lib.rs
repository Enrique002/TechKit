pub mod commands;

pub use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_system_summary,
            get_cpu_info,
            get_memory_info,
            get_disk_info,
            get_gpu_info,
            get_motherboard_info,
            get_processes,
            kill_process,
            kill_process_tree,
            open_external_url,
            get_windows_services,
            control_windows_service,
            get_network_interfaces,
            ping_host,
            dns_lookup,
            trace_route,
            get_active_connections,
            get_temp_file_categories,
            clean_temp_files,
            compute_text_hashes,
            compute_file_hashes,
            get_security_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
