## 2025-03-08 - Lazy-cache transformed static catalog arrays

**Learning:** Static data transformations (such as `EXTERNAL_TOOLS_CATALOG.map(...)`) executed inside service getters like `catalogService.getAllTools()` cause redundant array and object allocations + string formatting on every call and component render cycle.
**Action:** Module-level lazy caching for transformed static dataset getters reduces O(N) allocation overhead per call down to O(1) reference lookups across the application.

## 2025-03-08 - Hoist string lowercasing/trimming outside filter loops & memoize list operations

**Learning:** Computing query normalization (`searchTerm.toLowerCase().trim()`) inside `.filter(item => ...)` loops executes string allocation and transformations N times per filter pass. Combined with un-memoized sorting on large lists (100+ processes/items), this causes significant CPU and heap churn on unrelated component re-renders.
**Action:** Extract query sanitization outside the filter loop body and wrap filter/sort pipelines in `useMemo` with minimal reactive dependencies.
