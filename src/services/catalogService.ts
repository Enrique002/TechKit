import { CategoryId, CategoryInfo, Tool } from '../types';
import { CATEGORIES, INITIAL_TOOLS, EXTERNAL_TOOLS_CATALOG } from '../data/toolsData';

// Bolt ⚡ Optimization:
// Cache mapped tools list and build an O(1) Map lookup table for getToolById.
// Previously, every call to getAllTools(), getToolById(), getToolsByCategory(), etc.
// re-mapped EXTERNAL_TOOLS_CATALOG (allocating ~35 objects, template strings, and keyword arrays).
// Since components like Sidebar invoke getToolsByCategory 10+ times per render,
// caching eliminates hundreds of redundant allocations per UI render cycle.
let cachedAllTools: Tool[] | null = null;
let cachedToolsMap: Map<string, Tool> | null = null;

function initializeToolsCache(): Tool[] {
  if (cachedAllTools) {
    return cachedAllTools;
  }

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

  cachedAllTools = [...nativeTools, ...externalTools];
  cachedToolsMap = new Map<string, Tool>();
  for (const tool of cachedAllTools) {
    cachedToolsMap.set(tool.id, tool);
  }

  return cachedAllTools;
}

export const catalogService = {
  getCategories(): CategoryInfo[] {
    return CATEGORIES;
  },

  getCategoryById(id: CategoryId): CategoryInfo | undefined {
    return CATEGORIES.find((c) => c.id === id);
  },

  getToolById(id: string): Tool | undefined {
    initializeToolsCache();
    return cachedToolsMap?.get(id);
  },

  getAllTools(): Tool[] {
    return initializeToolsCache();
  },

  getExternalTools(): Tool[] {
    return this.getAllTools().filter((t) => t.type === 'external_app' && Boolean(t.externalDetails));
  },

  getExternalToolsByCategory(category: CategoryId): Tool[] {
    return this.getExternalTools().filter((t) => t.category === category);
  },

  getToolsByCategory(category: CategoryId): Tool[] {
    return this.getAllTools().filter((t) => t.category === category);
  },

  searchTools(options: { query?: string; category?: CategoryId; type?: string }): Tool[] {
    let tools = this.getAllTools();

    if (options.category) {
      tools = tools.filter((t) => t.category === options.category);
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
