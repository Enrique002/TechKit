## 2025-03-08 - Lazy-cache transformed static catalog arrays

**Learning:** Static data transformations (such as `EXTERNAL_TOOLS_CATALOG.map(...)`) executed inside service getters like `catalogService.getAllTools()` cause redundant array and object allocations + string formatting on every call and component render cycle.
**Action:** Module-level lazy caching for transformed static dataset getters reduces O(N) allocation overhead per call down to O(1) reference lookups across the application.

## 2025-03-09 - Map-based ID lookups and string normalization hoisting in render loops

**Learning:** Querying catalog tools by ID using `Array.prototype.find` inside render cycles or mapping functions (e.g. recent/favorite lists) scales as O(N * M). Additionally, invoking `.toLowerCase().trim()` inside `.filter()` callbacks runs N times per render.
**Action:** Maintain a module-level `Map<string, Tool>` index alongside cached arrays for O(1) ID lookups, and hoist string normalization out of `.filter()` callbacks.
