import { CategoryId, CategoryInfo, Tool } from '../types';
import { CATEGORIES, INITIAL_TOOLS, EXTERNAL_TOOLS_CATALOG } from '../data/toolsData';

// Performance Optimization: Cache transformed static catalog tools and create O(1) hash maps.
// Avoids repeated .map() transformations, string interpolations, and array allocations on every render or search call.
let allToolsCache: Tool[] | null = null;
let externalToolsCache: Tool[] | null = null;
let toolsByIdMap: Map<string, Tool> | null = null;
let toolsByCategoryMap: Map<CategoryId, Tool[]> | null = null;
let externalToolsByCategoryMap: Map<CategoryId, Tool[]> | null = null;

function initializeCatalogCache(): void {
  if (allToolsCache !== null) return;

  const nativeTools = INITIAL_TOOLS;
  const externalTools: Tool[] = EXTERNAL_TOOLS_CATALOG.map((ext) => ({
    id: ext.id,
    name: ext.name,
    description: ext.shortDescription,
    category: ext.category,
    type: 'external_app',
    status: ext.installationStatus === 'installed' ? 'available' : 'requires_download',
    compatibility: ext.windowsCompatibility,
    permissions: ext.requiresAdmin ? 'Administrador requerido' : 'Usuario estándar',
    officialUrl: ext.officialUrl,
    keywords: [ext.name, ext.categoryDisplayName, ext.licenseType, ...ext.mainFeatures, ...ext.solvesProblems],
    instructions: `Tipo de Licencia: ${ext.licenseType}\nFunciones Principales: ${ext.mainFeatures.join(', ')}\nProblemas que resuelve: ${ext.solvesProblems.join(', ')}\n${ext.warnings ? `\nAdvertencia: ${ext.warnings}` : ''}`,
    externalDetails: ext,
  }));

  allToolsCache = [...nativeTools, ...externalTools];
  externalToolsCache = allToolsCache.filter((t) => t.type === 'external_app' && Boolean(t.externalDetails));

  toolsByIdMap = new Map<string, Tool>();
  toolsByCategoryMap = new Map<CategoryId, Tool[]>();
  externalToolsByCategoryMap = new Map<CategoryId, Tool[]>();

  for (const tool of allToolsCache) {
    toolsByIdMap.set(tool.id, tool);

    const catList = toolsByCategoryMap.get(tool.category) || [];
    catList.push(tool);
    toolsByCategoryMap.set(tool.category, catList);

    if (tool.type === 'external_app' && tool.externalDetails) {
      const extCatList = externalToolsByCategoryMap.get(tool.category) || [];
      extCatList.push(tool);
      externalToolsByCategoryMap.set(tool.category, extCatList);
    }
  }
}

export const catalogService = {
  getCategories(): CategoryInfo[] {
    return CATEGORIES;
  },

  getCategoryById(id: CategoryId): CategoryInfo | undefined {
    return CATEGORIES.find((c) => c.id === id);
  },

  getToolById(id: string): Tool | undefined {
    initializeCatalogCache();
    // O(1) Map lookup replacing linear array scan
    return toolsByIdMap!.get(id);
  },

  getAllTools(): Tool[] {
    initializeCatalogCache();
    // Returns pre-built array reference; O(1) operation
    return allToolsCache!;
  },

  getExternalTools(): Tool[] {
    initializeCatalogCache();
    // Returns pre-filtered array reference; O(1) operation
    return externalToolsCache!;
  },

  getExternalToolsByCategory(category: CategoryId): Tool[] {
    initializeCatalogCache();
    // O(1) Map lookup
    return externalToolsByCategoryMap!.get(category) || [];
  },

  getToolsByCategory(category: CategoryId): Tool[] {
    initializeCatalogCache();
    // O(1) Map lookup replacing array filter
    return toolsByCategoryMap!.get(category) || [];
  },

  searchTools(options: { query?: string; category?: CategoryId; type?: string }): Tool[] {
    initializeCatalogCache();

    let tools = this.getAllTools();

    if (options.category) {
      tools = this.getToolsByCategory(options.category);
    }

    if (options.type) {
      tools = tools.filter((t) => t.type === options.type);
    }

    if (options.query && options.query.trim().length > 0) {
      const q = options.query.toLowerCase().trim();
      tools = tools.filter((t) => {
        const inName = t.name.toLowerCase().includes(q);
        const inDesc = t.description.toLowerCase().includes(q);
        const inKeywords = t.keywords.some((k) => k.toLowerCase().includes(q));
        const inInst = t.instructions ? t.instructions.toLowerCase().includes(q) : false;
        return inName || inDesc || inKeywords || inInst;
      });
    }

    return tools;
  },
};
