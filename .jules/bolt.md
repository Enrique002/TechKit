# Bolt's Performance Journal

## 2025-05-18 - Static Catalog Re-mapping Bottleneck
**Learning:** `catalogService.getAllTools()` mapped `EXTERNAL_TOOLS_CATALOG` on every function call. Because `Sidebar.tsx` queried `catalogService.getToolsByCategory()` for each category during every render pass, this caused hundreds of redundant tool object allocations per render frame.
**Action:** Always cache static catalog item mappings at module level in services, and use React `useMemo` for derived tool lookups in layout components like `Sidebar`.
