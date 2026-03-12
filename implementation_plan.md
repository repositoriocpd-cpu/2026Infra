# Implementation Plan - Payment Process Control Module

Creating a robust administrative module for managing payment processes with a focus on traceability and modern UI.

## Proposed Changes

### UI Components
- **Dashboard**: Use Chart.js for visualizing process status and location distribution. Stat cards for quick metrics.
- **Process Management**: A searchable, filterable table display.
- **Modals**: 
  - Centralized modal system for all CRUD operations.
  - Configuration modals for managing auxiliary tables (Suppliers, Locations, etc.).
- **Timeline**: A visual history of process movements.
- **Side Menu**: Integrated navigation for switching between Dashboard, Processes, and Settings.

### Data Structure (LocalStorage)
- `processes`: Array of process objects `{ id, ppAno, supplierId, statusId, locationId, objectId, remainingDays, history: [...] }`.
- `suppliers`, `statuses`, `locations`, `objects`, `users`: Simple entity arrays for lookups.

### Logic
- **CRUD Operations**: Generic helper functions for LocalStorage management.
- **Auto-Calculations**: 
  - `ppAno`: Logic to find last ID for the current year.
  - `remainingDays`: Difference between target date and current date, with color class return (e.g., `< 3` red, `< 7` yellow).
- **Exports**:
  - `jsPDF` or simple HTML-to-PDF for reports.
  - `SheetJS` or CSV generation for Excel.

## Verification Plan

### Automated Tests
- N/A (Single-file HTML focus, manual verification in browser).

### Manual Verification
1.  **Dashboard**: Confirm charts update after adding processes.
2.  **CRUD**: Create, read, update, and delete a process; verify LocalStorage state.
3.  **Calculations**: Verify PP/ANO increments correctly and color coding matches day ranges.
4.  **Exports**: Trigger PDF/Excel downloads and check content.
5.  **Permissions**: Toggle simulation of user roles and verify access restrictions.
