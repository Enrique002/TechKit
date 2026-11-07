import { CategoryId, CategoryInfo, Tool } from '../types';
import { CATEGORIES, INITIAL_TOOLS, EXTERNAL_TOOLS_CATALOG } from '../data/toolsData';

// Module-level caches and lookup maps for catalog data.
// Expected impact: Replaces repetitive O(N) array scans, allocations, and filter closures
// in hot rendering paths (Sidebar badge computation, CategoryPage renders, ExternalToolsView)
// with O(1) indexed Map and pre-grouped category array references.
let cachedAllTools: Tool[] | null = null;
let cachedToolMap: Map<string, Tool> | null = null;
let cachedCategoriesById: Map<CategoryId, CategoryInfo> | null = null;
let cachedToolsByCategory: Map<CategoryId, Tool[]> | null = null;
let cachedExternalTools: Tool[] | null = null;
let cachedExternalToolsByCategory: Map<CategoryId, Tool[]> | null = null;

const EMPTY_TOOL_ARRAY: Tool[] = [];

export const catalogService = {
  getCategories(): CategoryInfo[] {
    return CATEGORIES;
  },

  getCategoryById(id: CategoryId): CategoryInfo | undefined {
    if (!cachedCategoriesById) {
      cachedCategoriesById = new Map(CATEGORIES.map((c) => [c.id, c]));
    }
    return cachedCategoriesById.get(id);
  },

  getToolById(id: string): Tool | undefined {
    if (!cachedToolMap) {
      this.getAllTools();
    }
    return cachedToolMap?.get(id);
  },

  getAllTools(): Tool[] {
    if (!cachedAllTools) {
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

      const all = [...nativeTools, ...externalTools];
      cachedAllTools = all;

      // Build O(1) ID map and category partitions in a single O(N) pass during initial load
      const toolMap = new Map<string, Tool>();
      const byCategory = new Map<CategoryId, Tool[]>();
      const externalList: Tool[] = [];
      const externalByCategory = new Map<CategoryId, Tool[]>();

      for (const tool of all) {
        toolMap.set(tool.id, tool);

        let catList = byCategory.get(tool.category);
        if (!catList) {
          catList = [];
          byCategory.set(tool.category, catList);
        }
        catList.push(tool);

        if (tool.type === 'external_app' && tool.externalDetails) {
          externalList.push(tool);

          let extCatList = externalByCategory.get(tool.category);
          if (!extCatList) {
            extCatList = [];
            externalByCategory.set(tool.category, extCatList);
          }
          extCatList.push(tool);
        }
      }

      cachedToolMap = toolMap;
      cachedToolsByCategory = byCategory;
      cachedExternalTools = externalList;
      cachedExternalToolsByCategory = externalByCategory;
    }

    return cachedAllTools;
  },

  getExternalTools(): Tool[] {
    if (!cachedExternalTools) {
      this.getAllTools();
    }
    return cachedExternalTools || EMPTY_TOOL_ARRAY;
  },

  getExternalToolsByCategory(category: CategoryId): Tool[] {
    if (!cachedExternalToolsByCategory) {
      this.getAllTools();
    }
    return cachedExternalToolsByCategory?.get(category) || EMPTY_TOOL_ARRAY;
  },

  getToolsByCategory(category: CategoryId): Tool[] {
    if (!cachedToolsByCategory) {
      this.getAllTools();
    }
    return cachedToolsByCategory?.get(category) || EMPTY_TOOL_ARRAY;
  },

  searchTools(options: { query?: string; category?: CategoryId; type?: string }): Tool[] {
    // If a category is requested, start directly from the indexed category bucket instead of scanning all tools
    let tools = options.category ? this.getToolsByCategory(options.category) : this.getAllTools();

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
