## 2025-03-08 - Lazy-cache transformed static catalog arrays

**Learning:** Static data transformations (such as `EXTERNAL_TOOLS_CATALOG.map(...)`) executed inside service getters like `catalogService.getAllTools()` cause redundant array and object allocations + string formatting on every call and component render cycle.
**Action:** Module-level lazy caching for transformed static dataset getters reduces O(N) allocation overhead per call down to O(1) reference lookups across the application.
