import { INITIAL_TOOLS, CATEGORIES } from '../data/toolsData';
import { Tool, CategoryId, CategoryInfo, ToolType } from '../types';

export interface SearchFilters {
  query?: string;
  category?: CategoryId;
  type?: ToolType;
}

export const catalogService = {
  getAllTools(): Tool[] {
    return INITIAL_TOOLS;
  },

  getToolById(id: string): Tool | undefined {
    return INITIAL_TOOLS.find((tool) => tool.id === id);
  },

  getToolsByCategory(categoryId: CategoryId): Tool[] {
    return INITIAL_TOOLS.filter((tool) => tool.category === categoryId);
  },

  getCategories(): CategoryInfo[] {
    return CATEGORIES;
  },

  getCategoryById(id: CategoryId): CategoryInfo | undefined {
    return CATEGORIES.find((cat) => cat.id === id);
  },

  searchTools(filters: SearchFilters): Tool[] {
    let results = INITIAL_TOOLS;

    if (filters.category) {
      results = results.filter((tool) => tool.category === filters.category);
    }

    if (filters.type) {
      results = results.filter((tool) => tool.type === filters.type);
    }

    if (filters.query && filters.query.trim().length > 0) {
      const q = filters.query.trim().toLowerCase();

      results = results.filter((tool) => {
        const nameMatch = tool.name.toLowerCase().includes(q);
        const descMatch = tool.description.toLowerCase().includes(q);
        const categoryMatch = tool.category.toLowerCase().includes(q);
        const typeMatch = tool.type.toLowerCase().includes(q);
        const keywordMatch = tool.keywords.some((kw) =>
          kw.toLowerCase().includes(q)
        );

        return (
          nameMatch ||
          descMatch ||
          categoryMatch ||
          typeMatch ||
          keywordMatch
        );
      });
    }

    return results;
  },
};
