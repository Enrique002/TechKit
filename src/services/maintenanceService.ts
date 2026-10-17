import { invoke } from '@tauri-apps/api/core';

export interface TempCleanerCategory {
  id: string;
  name: string;
  description: string;
  sizeBytes: number;
  itemCount: number;
}

export interface CleanResult {
  cleanedBytes: number;
  itemsRemoved: number;
  details: string;
}

const MOCK_TEMP_CATEGORIES: TempCleanerCategory[] = [
  {
    id: 'user_temp',
    name: 'Archivos temporales del usuario (%TEMP%)',
    description: 'Caché de aplicaciones, instaladores temporales y datos residuales.',
    sizeBytes: 1250300400, // ~1.2 GB
    itemCount: 420,
  },
  {
    id: 'system_temp',
    name: 'Archivos temporales del sistema (C:\\Windows\\Temp)',
    description: 'Informes de errores y archivos temporales de servicios de Windows.',
    sizeBytes: 450120300, // ~450 MB
    itemCount: 185,
  },
  {
    id: 'browser_cache',
    name: 'Caché de navegadores web (Edge / Chrome)',
    description: 'Archivos web cacheados e imágenes temporales de navegación.',
    sizeBytes: 890400100, // ~890 MB
    itemCount: 1250,
  },
];

const isTauriEnv = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

export const maintenanceService = {
  async getTempCategories(): Promise<TempCleanerCategory[]> {
    if (isTauriEnv()) {
      try {
        const res = await invoke<any[]>('get_temp_file_categories');
        return res.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          sizeBytes: c.size_bytes || 0,
          itemCount: c.item_count || 0,
        }));
      } catch (err) {
        console.warn('Tauri get_temp_file_categories failed, fallback used:', err);
      }
    }
    return MOCK_TEMP_CATEGORIES;
  },

  async cleanSelectedCategories(categoryIds: string[]): Promise<CleanResult> {
    if (!categoryIds || categoryIds.length === 0) {
      return { cleanedBytes: 0, itemsRemoved: 0, details: 'No se seleccionó ninguna categoría.' };
    }

    if (isTauriEnv()) {
      try {
        const res = await invoke<any>('clean_temp_files', { categoryIds });
        return {
          cleanedBytes: res.cleaned_bytes || 0,
          itemsRemoved: res.items_removed || 0,
          details: res.details || 'Limpieza ejecutada correctamente.',
        };
      } catch (err: any) {
        throw new Error(err?.toString() || 'Error durante la ejecución del proceso de limpieza.');
      }
    }

    // Browser simulation fallback
    const mockCategories = MOCK_TEMP_CATEGORIES.filter((c) => categoryIds.includes(c.id));
    const totalBytes = mockCategories.reduce((sum, c) => sum + c.sizeBytes, 0);
    const totalItems = mockCategories.reduce((sum, c) => sum + c.itemCount, 0);

    return {
      cleanedBytes: totalBytes,
      itemsRemoved: totalItems,
      details: `Limpieza finalizada con éxito. Se liberaron ${totalBytes} bytes y ${totalItems} elementos.`,
    };
  },
};
