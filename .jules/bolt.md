# Bolt's Journal - Critical Learnings

## 2025-02-14 - Static Catalog Transformation Overhead in React Render Cycle
**Learning:** Re-mapping static catalog objects (`EXTERNAL_TOOLS_CATALOG.map(...)`) and allocating fresh `Tool` arrays on every `getAllTools()` call (invoked per React render or component search) creates significant memory churn and string interpolation overhead.
**Action:** Pre-compute and memoize transformed domain models and lookup maps (`Map<id, Tool>`, `Map<category, Tool[]>`) at module scope for static datasets to achieve O(1) reads and zero allocations.
