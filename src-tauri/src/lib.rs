use serde::Serialize;
use sysinfo::{CpuRefreshKind, Disks, MemoryRefreshKind, RefreshKind, System};

#[derive(Serialize)]
pub struct SystemSummaryResponse {
    pub hostname: String,
    pub username: String,
    pub os_name: String,
    pub os_version: String,
    pub architecture: String,
    pub app_version: String,
    pub uptime_seconds: u64,
    pub last_updated: String,
}

#[derive(Serialize)]
pub struct CpuInfoResponse {
    pub model: String,
    pub physical_cores: usize,
    pub logical_cores: usize,
    pub architecture: String,
    pub global_usage_percentage: f32,
}

#[derive(Serialize)]
pub struct MemoryInfoResponse {
    pub total_bytes: u64,
    pub used_bytes: u64,
    pub free_bytes: u64,
    pub available_bytes: u64,
    pub usage_percentage: f32,
}

#[derive(Serialize)]
pub struct DiskVolume {
    pub mount_point: String,
    pub name: String,
    pub file_system: String,
    pub total_bytes: u64,
    pub available_bytes: u64,
    pub used_bytes: u64,
    pub usage_percentage: f32,
    pub is_removable: bool,
}

#[tauri::command]
pub fn get_system_summary() -> SystemSummaryResponse {
    let sys = System::new_all();
    let hostname = System::host_name().unwrap_or_else(|| "WORKSTATION-WIN".to_string());
    let username = System::long_os_version().unwrap_or_else(|| "TecnicoUsuario".to_string());
    let os_name = System::name().unwrap_or_else(|| "Microsoft Windows 11 Pro".to_string());
    let os_version = System::os_version().unwrap_or_else(|| "10.0.22631 Build 22631".to_string());
    let architecture = System::cpu_arch();
    let uptime_seconds = System::uptime();

    SystemSummaryResponse {
        hostname,
        username,
        os_name,
        os_version,
        architecture,
        app_version: "0.2.0 (Fase 2)".to_string(),
        uptime_seconds,
        last_updated: "Consulta realizada".to_string(),
    }
}

#[tauri::command]
pub fn get_cpu_info() -> CpuInfoResponse {
    let mut sys = System::new_with_specifics(
        RefreshKind::nothing().with_cpu(CpuRefreshKind::everything()),
    );
    std::thread::sleep(std::time::Duration::from_millis(100));
    sys.refresh_cpu_all();

    let cpus = sys.cpus();
    let model = if let Some(first_cpu) = cpus.first() {
        first_cpu.brand().trim().to_string()
    } else {
        "Procesador Intel/AMD".to_string()
    };

    let global_usage_percentage = sys.global_cpu_usage();
    let physical_cores = sys.physical_core_count().unwrap_or(cpus.len());
    let logical_cores = cpus.len();
    let architecture = System::cpu_arch();

    CpuInfoResponse {
        model,
        physical_cores,
        logical_cores,
        architecture,
        global_usage_percentage,
    }
}

#[tauri::command]
pub fn get_memory_info() -> MemoryInfoResponse {
    let mut sys = System::new_with_specifics(
        RefreshKind::nothing().with_memory(MemoryRefreshKind::everything()),
    );
    sys.refresh_memory();

    let total_bytes = sys.total_memory();
    let used_bytes = sys.used_memory();
    let free_bytes = sys.free_memory();
    let available_bytes = sys.available_memory();

    let usage_percentage = if total_bytes > 0 {
        (used_bytes as f32 / total_bytes as f32) * 100.0
    } else {
        0.0
    };

    MemoryInfoResponse {
        total_bytes,
        used_bytes,
        free_bytes,
        available_bytes,
        usage_percentage,
    }
}

#[tauri::command]
pub fn get_disk_info() -> Vec<DiskVolume> {
    let disks = Disks::new_with_refreshed_list();
    let mut volumes = Vec::new();

    for disk in disks.list() {
        let mount_point = disk.mount_point().to_string_lossy().to_string();
        let name = disk.name().to_string_lossy().to_string();
        let file_system = disk.file_system().to_string_lossy().to_string();
        let total_bytes = disk.total_space();
        let available_bytes = disk.available_space();
        let used_bytes = total_bytes.saturating_sub(available_bytes);

        let usage_percentage = if total_bytes > 0 {
            (used_bytes as f32 / total_bytes as f32) * 100.0
        } else {
            0.0
        };

        volumes.push(DiskVolume {
            mount_point,
            name: if name.is_empty() { "Disco Local".to_string() } else { name },
            file_system: if file_system.is_empty() { "NTFS".to_string() } else { file_system },
            total_bytes,
            available_bytes,
            used_bytes,
            usage_percentage,
            is_removable: disk.is_removable(),
        });
    }

    volumes
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            get_system_summary,
            get_cpu_info,
            get_memory_info,
            get_disk_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
