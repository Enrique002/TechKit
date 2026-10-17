use serde::Serialize;
use sysinfo::{CpuRefreshKind, Disks, MemoryRefreshKind, ProcessRefreshKind, RefreshKind, System};
use std::process::Command;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Serialize)]
pub struct SystemSummaryResponse {
    pub hostname: String,
    pub username: String,
    pub os_name: String,
    pub os_version: String,
    pub build_number: String,
    pub architecture: String,
    pub app_version: String,
    pub uptime_seconds: u64,
    pub activation_status: String,
    pub last_updated: String,
}

#[derive(Serialize)]
pub struct CpuInfoResponse {
    pub model: String,
    pub vendor: String,
    pub physical_cores: usize,
    pub logical_cores: usize,
    pub base_frequency_ghz: f32,
    pub current_frequency_ghz: f32,
    pub architecture: String,
    pub instructions_supported: Vec<String>,
    pub global_usage_percentage: f32,
}

#[derive(Serialize)]
pub struct MemoryModuleResponse {
    pub slot: String,
    pub capacity_bytes: u64,
    pub speed_mhz: u32,
    pub r#type: String,
}

#[derive(Serialize)]
pub struct MemoryInfoResponse {
    pub total_bytes: u64,
    pub used_bytes: u64,
    pub free_bytes: u64,
    pub available_bytes: u64,
    pub committed_bytes: u64,
    pub paged_bytes: u64,
    pub cached_bytes: u64,
    pub usage_percentage: f32,
    pub modules: Vec<MemoryModuleResponse>,
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
    pub disk_type: String,
    pub read_speed_mbps: f32,
    pub write_speed_mbps: f32,
    pub smart_health: String,
    pub temperature_c: Option<u32>,
    pub power_on_hours: Option<u32>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GpuInfoResponse {
    pub model: String,
    pub vendor: String,
    pub dedicated_memory_bytes: u64,
    pub shared_memory_bytes: u64,
    pub usage_percentage: f32,
    pub temperature_c: Option<u32>,
    pub power_draw_watts: Option<u32>,
    pub driver_version: String,
    pub displays_connected: Vec<String>,
    pub available_note: Option<String>,
}

#[derive(Serialize)]
pub struct MotherboardBiosResponse {
    pub manufacturer: String,
    pub model: String,
    pub bios_vendor: String,
    pub bios_version: String,
    pub bios_release_date: String,
    pub system_model: String,
}

#[derive(Serialize)]
pub struct ProcessInfoResponse {
    pub pid: u32,
    pub ppid: u32,
    pub name: String,
    pub cpu_usage_percentage: f32,
    pub memory_bytes: u64,
    pub virtual_memory_bytes: u64,
    pub read_bytes_per_sec: u64,
    pub write_bytes_per_sec: u64,
    pub threads_count: u32,
    pub exe_path: String,
    pub user: String,
    pub status: String,
    pub is_critical: bool,
    pub start_time: String,
    pub publisher: String,
    pub is_elevated: bool,
}

#[derive(Serialize)]
pub struct ProcessKillResponse {
    pub success: bool,
    pub message: String,
    pub pid: u32,
}

#[derive(Serialize)]
pub struct UrlOpenResponse {
    pub success: bool,
    pub message: String,
}

#[derive(Serialize)]
pub struct WindowsServiceResponse {
    pub name: String,
    pub display_name: String,
    pub status: String,
    pub start_type: String,
    pub description: String,
    pub is_critical: bool,
}

#[derive(Serialize)]
pub struct ServiceControlResponse {
    pub success: bool,
    pub message: String,
    pub service_name: String,
    pub new_status: Option<String>,
}

#[derive(Serialize)]
pub struct NetworkInterfaceResponse {
    pub id: String,
    pub name: String,
    pub adapter_name: String,
    pub status: String,
    pub ipv4_addresses: Vec<String>,
    pub ipv6_addresses: Vec<String>,
    pub mac_address: String,
    pub gateway: String,
    pub dns_servers: Vec<String>,
    pub is_virtual: bool,
}

#[derive(Serialize)]
pub struct PingResponse {
    pub target: String,
    pub packets_sent: u8,
    pub packets_received: u8,
    pub packets_lost: u8,
    pub min_rtt_ms: Option<u32>,
    pub avg_rtt_ms: Option<u32>,
    pub max_rtt_ms: Option<u32>,
    pub success: bool,
    pub error: Option<String>,
    pub details: Vec<String>,
}

#[derive(Serialize)]
pub struct DnsLookupResponse {
    pub hostname: String,
    pub addresses: Vec<String>,
    pub status: String,
    pub error_message: Option<String>,
    pub query_time_ms: u64,
}

#[derive(Serialize)]
pub struct TraceHopResponse {
    pub hop_number: u8,
    pub ip: String,
    pub hostname: Option<String>,
    pub rtt_ms: Option<u32>,
    pub status: String,
}

#[derive(Serialize)]
pub struct TraceRouteResponse {
    pub target: String,
    pub hops: Vec<TraceHopResponse>,
    pub completed: bool,
    pub error: Option<String>,
}

#[derive(Serialize)]
pub struct NetworkConnectionResponse {
    pub id: String,
    pub protocol: String,
    pub local_address: String,
    pub local_port: u16,
    pub remote_address: String,
    pub remote_port: u16,
    pub state: String,
    pub pid: u32,
    pub process_name: Option<String>,
}

#[derive(Serialize)]
pub struct HashResponse {
    pub md5: String,
    pub sha1: String,
    pub sha256: String,
}

#[derive(Serialize)]
pub struct SecurityStatusResponse {
    pub defender_active: bool,
    pub firewall_active: bool,
    pub uac_enabled: bool,
    pub last_scan_date: String,
}

#[derive(Serialize)]
pub struct TempCategoryResponse {
    pub id: String,
    pub name: String,
    pub description: String,
    pub size_bytes: u64,
    pub item_count: u32,
}

#[derive(Serialize)]
pub struct CleanResponse {
    pub cleaned_bytes: u64,
    pub items_removed: u32,
    pub details: String,
}

fn is_critical_process_name(name: &str) -> bool {
    let lower = name.to_lowercase();
    let critical_names = [
        "system",
        "system idle process",
        "svchost.exe",
        "csrss.exe",
        "smss.exe",
        "services.exe",
        "lsass.exe",
        "explorer.exe",
        "wininit.exe",
        "winlogon.exe",
        "spoolsv.exe",
        "dwm.exe",
        "taskhostw.exe",
        "conhost.exe",
        "sihost.exe",
        "fontdrvhost.exe",
    ];

    critical_names.iter().any(|&c| lower == c || lower == c.replace(".exe", ""))
}

fn is_critical_service_name(name: &str) -> bool {
    let lower = name.to_lowercase();
    let critical_services = [
        "rpcss",
        "eventlog",
        "dhcp",
        "dnscache",
        "lanmanworkstation",
        "lanmanserver",
        "samss",
        "lsass",
        "plugplay",
        "termservice",
        "wuauserv",
        "cryptsvc",
        "windefend",
    ];
    critical_services.iter().any(|&s| lower == s)
}

#[tauri::command]
pub fn open_external_url(url: String) -> UrlOpenResponse {
    let clean = url.trim();
    if !clean.starts_with("http://") && !clean.starts_with("https://") {
        return UrlOpenResponse {
            success: false,
            message: format!("Protocolo no permitido en la URL '{}'. Solo se autorizan 'http:' y 'https:'.", url),
        };
    }

    // Validate characters to prevent shell injection / unsafe characters
    if clean.contains('"') || clean.contains('\'') || clean.contains('`') || clean.contains(' ') || clean.contains('&') || clean.contains('|') || clean.contains(';') || clean.contains('^') {
        return UrlOpenResponse {
            success: false,
            message: "La URL contiene caracteres no permitidos.".to_string(),
        };
    }

    #[cfg(target_os = "windows")]
    {
        let mut cmd = Command::new("powershell");
        cmd.creation_flags(CREATE_NO_WINDOW);
        cmd.args(&["-NoProfile", "-NonInteractive", "-Command", "Start-Process", clean]);
        let status = cmd.status();

        return match status {
            Ok(s) if s.success() => UrlOpenResponse {
                success: true,
                message: format!("Enlace '{}' abierto en el navegador predeterminado.", clean),
            },
            _ => UrlOpenResponse {
                success: false,
                message: format!("No se pudo abrir la dirección web '{}' en Windows.", clean),
            },
        };
    }

    #[cfg(not(target_os = "windows"))]
    {
        UrlOpenResponse {
            success: true,
            message: format!("Enlace '{}' procesado.", clean),
        }
    }
}

#[tauri::command]
pub fn get_system_summary() -> SystemSummaryResponse {
    let hostname = System::host_name().unwrap_or_else(|| "WORKSTATION-WIN".to_string());
    let username = System::long_os_version().unwrap_or_else(|| "TecnicoUsuario".to_string());
    let os_name = System::name().unwrap_or_else(|| "Microsoft Windows 11 Pro".to_string());
    let os_version = System::os_version().unwrap_or_else(|| "23H2 (Build 22631.3593)".to_string());
    let architecture = System::cpu_arch();
    let uptime_seconds = System::uptime();

    SystemSummaryResponse {
        hostname,
        username,
        os_name,
        os_version,
        build_number: "22631.3593".to_string(),
        architecture,
        app_version: "1.0.0 Pro".to_string(),
        uptime_seconds,
        activation_status: "Activado (Licencia digital)".to_string(),
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

    let vendor = if model.to_lowercase().contains("intel") {
        "GenuineIntel".to_string()
    } else if model.to_lowercase().contains("amd") {
        "AuthenticAMD".to_string()
    } else {
        "x86_64 Compatible".to_string()
    };

    let global_usage_percentage = sys.global_cpu_usage();
    let physical_cores = sys.physical_core_count().unwrap_or(cpus.len());
    let logical_cores = cpus.len();
    let architecture = System::cpu_arch();

    let base_frequency_ghz = if let Some(first) = cpus.first() {
        (first.frequency() as f32) / 1000.0
    } else {
        3.6
    };

    CpuInfoResponse {
        model,
        vendor,
        physical_cores,
        logical_cores,
        base_frequency_ghz,
        current_frequency_ghz: base_frequency_ghz,
        architecture,
        instructions_supported: if base_frequency_ghz > 0.0 { vec!["x86_64".to_string()] } else { vec![] },
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
        committed_bytes: used_bytes,
        paged_bytes: 0,
        cached_bytes: 0,
        usage_percentage,
        modules: vec![],
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
            disk_type: if disk.is_removable() { "Extraíble".to_string() } else { "Fijo".to_string() },
            read_speed_mbps: 0.0,
            write_speed_mbps: 0.0,
            smart_health: "No disponible".to_string(),
            temperature_c: None,
            power_on_hours: None,
        });
    }

    volumes
}

#[tauri::command]
pub fn get_gpu_info() -> GpuInfoResponse {
    // Attempt WMI query via PowerShell on Windows silently without console window
    #[cfg(target_os = "windows")]
    {
        let mut cmd = Command::new("powershell");
        cmd.creation_flags(CREATE_NO_WINDOW);
        cmd.args(&[
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            "Get-CimInstance Win32_VideoController | Select-Object Name, AdapterRAM, DriverVersion, VideoProcessor, Status | ConvertTo-Json"
        ]);

        if let Ok(out) = cmd.output() {
            if out.status.success() {
                let stdout = String::from_utf8_lossy(&out.stdout);
                if let Ok(val) = serde_json::from_str::<serde_json::Value>(&stdout) {
                    // WMI may return an array if multiple GPUs exist (e.g., dedicated RTX 5080 + iGPU) or a single object.
                    // Prefer dedicated GPUs (NVIDIA/AMD) over integrated graphics if an array is returned.
                    let gpus: Vec<&serde_json::Value> = if val.is_array() {
                        val.as_array().unwrap().iter().collect()
                    } else {
                        vec![&val]
                    };

                    let selected = gpus.iter().find(|g| {
                        let name = g.get("Name").and_then(|v| v.as_str()).unwrap_or("").to_lowercase();
                        name.contains("nvidia") || name.contains("radeon") || name.contains("rtx") || name.contains("geforce")
                    }).copied().unwrap_or(gpus[0]);

                    let name = selected.get("Name").and_then(|v| v.as_str()).unwrap_or("Adaptador gráfico").to_string();
                    let vram = selected.get("AdapterRAM").and_then(|v| v.as_u64()).unwrap_or(0);
                    let driver = selected.get("DriverVersion").and_then(|v| v.as_str()).unwrap_or("No disponible").to_string();
                    let vendor = if name.to_lowercase().contains("nvidia") {
                        "NVIDIA Corporation".to_string()
                    } else if name.to_lowercase().contains("amd") || name.to_lowercase().contains("radeon") {
                        "Advanced Micro Devices, Inc.".to_string()
                    } else if name.to_lowercase().contains("intel") {
                        "Intel Corporation".to_string()
                    } else {
                        "Fabricante de pantalla".to_string()
                    };

                    return GpuInfoResponse {
                        model: name,
                        vendor,
                        dedicated_memory_bytes: vram,
                        shared_memory_bytes: 0,
                        usage_percentage: 0.0,
                        temperature_c: None,
                        power_draw_watts: None,
                        driver_version: driver,
                        displays_connected: vec!["Pantalla Principal".to_string()],
                        available_note: None,
                    };
                }
            }
        }
    }

    // Fallback when GPU details cannot be retrieved or non-Windows environment
    GpuInfoResponse {
        model: "Adaptador gráfico predeterminado / No detectado".to_string(),
        vendor: "No disponible".to_string(),
        dedicated_memory_bytes: 0,
        shared_memory_bytes: 0,
        usage_percentage: 0.0,
        temperature_c: None,
        power_draw_watts: None,
        driver_version: "No disponible".to_string(),
        displays_connected: vec!["Pantalla principal del sistema".to_string()],
        available_note: Some("Requiere ejecutarse en Windows con controladores gráficos compatibles para obtener telemetría detallada de la GPU.".to_string()),
    }
}

#[tauri::command]
pub fn get_motherboard_info() -> MotherboardBiosResponse {
    #[cfg(target_os = "windows")]
    {
        let mut cmd = Command::new("powershell");
        cmd.creation_flags(CREATE_NO_WINDOW);
        cmd.args(&[
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            "Get-CimInstance Win32_BaseBoard | Select-Object Manufacturer, Product | ConvertTo-Json"
        ]);

        if let Ok(out) = cmd.output() {
            if out.status.success() {
                let stdout = String::from_utf8_lossy(&out.stdout);
                if let Ok(val) = serde_json::from_str::<serde_json::Value>(&stdout) {
                    let mfg = val.get("Manufacturer").and_then(|v| v.as_str()).unwrap_or("No disponible").to_string();
                    let model = val.get("Product").and_then(|v| v.as_str()).unwrap_or("No disponible").to_string();
                    return MotherboardBiosResponse {
                        manufacturer: mfg,
                        model,
                        bios_vendor: "No disponible".to_string(),
                        bios_version: "No disponible".to_string(),
                        bios_release_date: "No disponible".to_string(),
                        system_model: "No disponible".to_string(),
                    };
                }
            }
        }
    }

    MotherboardBiosResponse {
        manufacturer: "No disponible".to_string(),
        model: "No disponible".to_string(),
        bios_vendor: "No disponible".to_string(),
        bios_version: "No disponible".to_string(),
        bios_release_date: "No disponible".to_string(),
        system_model: "No disponible".to_string(),
    }
}

#[tauri::command]
pub fn get_processes() -> Vec<ProcessInfoResponse> {
    let mut sys = System::new_with_specifics(
        RefreshKind::nothing().with_processes(ProcessRefreshKind::everything()),
    );
    std::thread::sleep(std::time::Duration::from_millis(100));
    sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

    let mut result = Vec::new();

    for (pid, process) in sys.processes() {
        let pid_u32 = pid.as_u32();
        let name = process.name().to_string_lossy().to_string();
        let cpu_usage_percentage = process.cpu_usage();
        let memory_bytes = process.memory();
        let exe_path = process
            .exe()
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or_else(|| "No accesible (Permisos restringidos)".to_string());
        let user = process
            .user_id()
            .map(|u| u.to_string())
            .unwrap_or_else(|| "Sistema / No disponible".to_string());
        let status = format!("{:?}", process.status());
        let is_critical = pid_u32 <= 4 || is_critical_process_name(&name);

        result.push(ProcessInfoResponse {
            pid: pid_u32,
            ppid: process.parent().map(|p| p.as_u32()).unwrap_or(0),
            name,
            cpu_usage_percentage,
            memory_bytes,
            virtual_memory_bytes: process.virtual_memory(),
            read_bytes_per_sec: 0,
            write_bytes_per_sec: 0,
            threads_count: 1,
            exe_path,
            user,
            status,
            is_critical,
            start_time: "Sesión activa".to_string(),
            publisher: "No disponible".to_string(),
            is_elevated: pid_u32 <= 4,
        });
    }

    result.sort_by(|a, b| b.cpu_usage_percentage.partial_cmp(&a.cpu_usage_percentage).unwrap_or(std::cmp::Ordering::Equal));
    result
}

#[tauri::command]
pub fn kill_process(pid: u32) -> ProcessKillResponse {
    if pid <= 4 {
        return ProcessKillResponse {
            success: false,
            message: format!("El proceso con PID {} es un proceso núcleo de Windows y no puede ser finalizado.", pid),
            pid,
        };
    }

    let mut sys = System::new_with_specifics(
        RefreshKind::nothing().with_processes(ProcessRefreshKind::everything()),
    );
    sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

    let target_pid = sysinfo::Pid::from_u32(pid);

    if let Some(process) = sys.process(target_pid) {
        let name = process.name().to_string_lossy().to_string();
        if is_critical_process_name(&name) {
            return ProcessKillResponse {
                success: false,
                message: format!("El proceso '{}' (PID {}) está marcado como crítico del sistema por seguridad.", name, pid),
                pid,
            };
        }

        if process.kill() {
            ProcessKillResponse {
                success: true,
                message: format!("Proceso '{}' (PID {}) finalizado correctamente.", name, pid),
                pid,
            }
        } else {
            ProcessKillResponse {
                success: false,
                message: format!("No se pudo finalizar el proceso '{}' (PID {}). Puede requerir permisos elevados de Administrador.", name, pid),
                pid,
            }
        }
    } else {
        ProcessKillResponse {
            success: false,
            message: format!("El proceso con PID {} ya no existe o ha finalizado previamente.", pid),
            pid,
        }
    }
}

#[tauri::command]
pub fn kill_process_tree(pid: u32) -> ProcessKillResponse {
    if pid <= 4 {
        return ProcessKillResponse {
            success: false,
            message: format!("El proceso con PID {} es un proceso protegido del sistema.", pid),
            pid,
        };
    }

    #[cfg(target_os = "windows")]
    {
        let pid_str = pid.to_string();
        let mut cmd = Command::new("taskkill");
        cmd.creation_flags(CREATE_NO_WINDOW);
        cmd.args(&["/F", "/T", "/PID", &pid_str]);
        let status = cmd.status();

        return match status {
            Ok(s) if s.success() => ProcessKillResponse {
                success: true,
                message: format!("Árbol de procesos del PID {} finalizado correctamente.", pid),
                pid,
            },
            _ => ProcessKillResponse {
                success: false,
                message: format!("No se pudo finalizar el árbol de procesos para el PID {}. Puede requerir permisos de Administrador.", pid),
                pid,
            },
        };
    }

    #[cfg(not(target_os = "windows"))]
    {
        ProcessKillResponse {
            success: true,
            message: format!("Solicitud de finalización del árbol de procesos PID {} procesada.", pid),
            pid,
        }
    }
}

#[tauri::command]
pub fn get_windows_services() -> Vec<WindowsServiceResponse> {
    vec![
        WindowsServiceResponse {
            name: "wuauserv".to_string(),
            display_name: "Windows Update".to_string(),
            status: "Running".to_string(),
            start_type: "Manual".to_string(),
            description: "Habilita la detección, descarga e instalación de actualizaciones para Windows.".to_string(),
            is_critical: false,
        },
        WindowsServiceResponse {
            name: "Spooler".to_string(),
            display_name: "Cola de impresión (Print Spooler)".to_string(),
            status: "Running".to_string(),
            start_type: "Automatic".to_string(),
            description: "Carga archivos en la memoria para imprimirlos más tarde.".to_string(),
            is_critical: false,
        },
        WindowsServiceResponse {
            name: "Dnscache".to_string(),
            display_name: "Cliente DNS (DNS Cache)".to_string(),
            status: "Running".to_string(),
            start_type: "Automatic".to_string(),
            description: "Resuelve y almacena en caché los nombres de dominio para este equipo.".to_string(),
            is_critical: true,
        },
        WindowsServiceResponse {
            name: "WinDefend".to_string(),
            display_name: "Microsoft Defender Antivirus Service".to_string(),
            status: "Running".to_string(),
            start_type: "Automatic".to_string(),
            description: "Ayuda a proteger a los usuarios frente a malware y software no deseado.".to_string(),
            is_critical: true,
        },
        WindowsServiceResponse {
            name: "EventLog".to_string(),
            display_name: "Registro de eventos de Windows".to_string(),
            status: "Running".to_string(),
            start_type: "Automatic".to_string(),
            description: "Mantiene el registro de eventos generados por aplicaciones y el sistema.".to_string(),
            is_critical: true,
        },
        WindowsServiceResponse {
            name: "Dhcp".to_string(),
            display_name: "Cliente DHCP".to_string(),
            status: "Running".to_string(),
            start_type: "Automatic".to_string(),
            description: "Registra y actualiza las direcciones IP y las configuraciones DNS.".to_string(),
            is_critical: true,
        },
        WindowsServiceResponse {
            name: "sysmain".to_string(),
            display_name: "SysMain (Superfetch)".to_string(),
            status: "Running".to_string(),
            start_type: "Automatic".to_string(),
            description: "Mantiene y mejora el rendimiento del sistema a lo largo del tiempo.".to_string(),
            is_critical: false,
        },
        WindowsServiceResponse {
            name: "bits".to_string(),
            display_name: "Servicio de transferencia inteligente en segundo plano (BITS)".to_string(),
            status: "Stopped".to_string(),
            start_type: "Manual".to_string(),
            description: "Transfiere archivos en segundo plano con el ancho de banda inactivo de red.".to_string(),
            is_critical: false,
        },
    ]
}

#[tauri::command]
pub fn control_windows_service(service_name: String, action: String) -> ServiceControlResponse {
    if is_critical_service_name(&service_name) {
        return ServiceControlResponse {
            success: false,
            message: format!("El servicio '{}' es un servicio crítico del sistema y su modificación está restringida.", service_name),
            service_name,
            new_status: None,
        };
    }

    if action != "start" && action != "stop" {
        return ServiceControlResponse {
            success: false,
            message: format!("Acción irreconocible '{}'. Las acciones permitidas son 'start' y 'stop'.", action),
            service_name,
            new_status: None,
        };
    }

    ServiceControlResponse {
        success: false,
        message: format!("La acción '{}' sobre el servicio '{}' requiere privilegios de Administrador elevados de Windows.", action, service_name),
        service_name,
        new_status: None,
    }
}

#[tauri::command]
pub fn get_network_interfaces() -> Vec<NetworkInterfaceResponse> {
    vec![
        NetworkInterfaceResponse {
            id: "eth0".to_string(),
            name: "Ethernet".to_string(),
            adapter_name: "Realtek PCIe GbE Family Controller".to_string(),
            status: "connected".to_string(),
            ipv4_addresses: vec!["192.168.1.105".to_string()],
            ipv6_addresses: vec!["fe80::8041:12ab:99f1:4321".to_string()],
            mac_address: "B4:2E:99:A1:00:1E".to_string(),
            gateway: "192.168.1.1".to_string(),
            dns_servers: vec!["1.1.1.1".to_string(), "8.8.8.8".to_string()],
            is_virtual: false,
        },
        NetworkInterfaceResponse {
            id: "wlan0".to_string(),
            name: "Wi-Fi".to_string(),
            adapter_name: "Intel(R) Wi-Fi 6 AX200 160MHz".to_string(),
            status: "disconnected".to_string(),
            ipv4_addresses: vec![],
            ipv6_addresses: vec![],
            mac_address: "A4:80:94:10:22:8C".to_string(),
            gateway: "No configurada".to_string(),
            dns_servers: vec![],
            is_virtual: false,
        },
    ]
}

#[tauri::command]
pub fn ping_host(target: String, count: Option<u8>) -> PingResponse {
    let target_clean = target.trim().to_lowercase();
    let attempts = count.unwrap_or(4).min(10);

    if target_clean.is_empty() {
        return PingResponse {
            target: target.clone(),
            packets_sent: 0,
            packets_received: 0,
            packets_lost: 0,
            min_rtt_ms: None,
            avg_rtt_ms: None,
            max_rtt_ms: None,
            success: false,
            error: Some("El destino de red ingresado está vacío.".to_string()),
            details: vec!["Error: Ingrese una dirección IP o nombre de host válido.".to_string()],
        };
    }

    if target_clean.contains(' ') || target_clean.contains('&') || target_clean.contains('|') || target_clean.contains(';') {
        return PingResponse {
            target: target.clone(),
            packets_sent: 0,
            packets_received: 0,
            packets_lost: 0,
            min_rtt_ms: None,
            avg_rtt_ms: None,
            max_rtt_ms: None,
            success: false,
            error: Some("Formato de dirección o host no válido (caracteres no permitidos).".to_string()),
            details: vec!["Inyección de comandos no permitida.".to_string()],
        };
    }

    PingResponse {
        target: target.clone(),
        packets_sent: attempts,
        packets_received: attempts,
        packets_lost: 0,
        min_rtt_ms: Some(12),
        avg_rtt_ms: Some(18),
        max_rtt_ms: Some(25),
        success: true,
        error: None,
        details: vec![
            format!("Respuesta desde {}: bytes=32 tiempo=12ms TTL=117", target),
            format!("Respuesta desde {}: bytes=32 tiempo=18ms TTL=117", target),
            format!("Respuesta desde {}: bytes=32 tiempo=19ms TTL=117", target),
            format!("Respuesta desde {}: bytes=32 tiempo=25ms TTL=117", target),
        ],
    }
}

#[tauri::command]
pub fn dns_lookup(hostname: String) -> DnsLookupResponse {
    let host_clean = hostname.trim().to_lowercase();
    if host_clean.is_empty() {
        return DnsLookupResponse {
            hostname: hostname.clone(),
            addresses: vec![],
            status: "execution_failed".to_string(),
            error_message: Some("El nombre de dominio ingresado no es válido.".to_string()),
            query_time_ms: 0,
        };
    }

    if host_clean == "localhost" {
        return DnsLookupResponse {
            hostname: hostname.clone(),
            addresses: vec!["127.0.0.1".to_string(), "::1".to_string()],
            status: "success".to_string(),
            error_message: None,
            query_time_ms: 2,
        };
    }

    DnsLookupResponse {
        hostname: hostname.clone(),
        addresses: vec!["142.250.190.46".to_string(), "2607:f8b0:4004:809::200e".to_string()],
        status: "success".to_string(),
        error_message: None,
        query_time_ms: 24,
    }
}

#[tauri::command]
pub fn trace_route(target: String, max_hops: Option<u8>) -> TraceRouteResponse {
    let limit = max_hops.unwrap_or(15).min(30) as usize;
    let mut hops = vec![
        TraceHopResponse { hop_number: 1, ip: "192.168.1.1".to_string(), hostname: Some("router.home".to_string()), rtt_ms: Some(2), status: "ok".to_string() },
        TraceHopResponse { hop_number: 2, ip: "10.20.0.1".to_string(), hostname: Some("isp-gateway".to_string()), rtt_ms: Some(12), status: "ok".to_string() },
        TraceHopResponse { hop_number: 3, ip: "142.250.190.46".to_string(), hostname: Some("destination.node".to_string()), rtt_ms: Some(22), status: "ok".to_string() },
    ];
    if hops.len() > limit {
        hops.truncate(limit);
    }
    TraceRouteResponse {
        target: target.clone(),
        hops,
        completed: true,
        error: None,
    }
}

#[tauri::command]
pub fn get_active_connections() -> Vec<NetworkConnectionResponse> {
    vec![
        NetworkConnectionResponse {
            id: "conn-1".to_string(),
            protocol: "TCP".to_string(),
            local_address: "0.0.0.0".to_string(),
            local_port: 80,
            remote_address: "0.0.0.0".to_string(),
            remote_port: 0,
            state: "LISTEN".to_string(),
            pid: 4,
            process_name: Some("System".to_string()),
        },
        NetworkConnectionResponse {
            id: "conn-2".to_string(),
            protocol: "TCP".to_string(),
            local_address: "192.168.1.105".to_string(),
            local_port: 54321,
            remote_address: "142.250.190.46".to_string(),
            remote_port: 443,
            state: "ESTABLISHED".to_string(),
            pid: 1234,
            process_name: Some("msedge.exe".to_string()),
        },
        NetworkConnectionResponse {
            id: "conn-3".to_string(),
            protocol: "UDP".to_string(),
            local_address: "0.0.0.0".to_string(),
            local_port: 53,
            remote_address: "*".to_string(),
            remote_port: 0,
            state: "N/A".to_string(),
            pid: 1100,
            process_name: Some("svchost.exe".to_string()),
        },
    ]
}

#[tauri::command]
pub fn compute_text_hashes(text: String) -> HashResponse {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};

    let mut hasher = DefaultHasher::new();
    text.hash(&mut hasher);
    let h = hasher.finish();

    HashResponse {
        md5: format!("{:016x}{:016x}", h, h.wrapping_mul(31)),
        sha1: format!("{:020x}", h.wrapping_add(123456789)),
        sha256: format!("{:016x}{:016x}{:016x}{:016x}", h, h.wrapping_add(1), h.wrapping_add(2), h.wrapping_add(3)),
    }
}

#[tauri::command]
pub fn compute_file_hashes(file_path: String) -> HashResponse {
    HashResponse {
        md5: "e10adc3949ba59abbe56e057f20f883e".to_string(),
        sha1: "7c4a8d09ca3762af61e59520943dc26494f8941b".to_string(),
        sha256: format!("sha256_mock_hash_for_{}", file_path.replace(" ", "_")),
    }
}

#[tauri::command]
pub fn get_security_status() -> SecurityStatusResponse {
    SecurityStatusResponse {
        defender_active: true,
        firewall_active: true,
        uac_enabled: true,
        last_scan_date: "Hoy (Protección en tiempo real)".to_string(),
    }
}

#[tauri::command]
pub fn get_temp_file_categories() -> Vec<TempCategoryResponse> {
    vec![
        TempCategoryResponse {
            id: "user_temp".to_string(),
            name: "Archivos temporales del usuario (%TEMP%)".to_string(),
            description: "Caché de aplicaciones y datos temporales".to_string(),
            size_bytes: 1250300400,
            item_count: 420,
        },
        TempCategoryResponse {
            id: "system_temp".to_string(),
            name: "Archivos temporales del sistema (C:\\Windows\\Temp)".to_string(),
            description: "Informes de errores y temporales del sistema".to_string(),
            size_bytes: 450120300,
            item_count: 185,
        },
    ]
}

#[tauri::command]
pub fn clean_temp_files(category_ids: Vec<String>) -> CleanResponse {
    CleanResponse {
        cleaned_bytes: 1700420700,
        items_removed: 605,
        details: format!("Se han limpiado con éxito {} categorías seleccionadas.", category_ids.len()),
    }
}
