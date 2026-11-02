# Implementation Plan - Pulse Backup Restore Fix & Merging Engine

Fix the restore functionality in the **Pulse** time tracker application to support legacy/alternative backup formats and merge restored data into the current workspace.

## Problem Analysis
The uploaded backup file (`tracker_full_backup_2026-11-02__1__e7401da5.json`) uses a legacy/alternative schema:
- Tasks use `title` instead of `name`.
- Intervals use `durationSeconds` and ISO timestamp strings (`start`, `end`, `lastStartISO`, `lastEndISO`) instead of millisecond timestamps (`start: number`, `end: number`, `duration: number`).
- Tasks track total time in `accumulatedSeconds`.

When Pulse tries to load this format without normalization:
1. Task titles appear empty (`t.name` is undefined).
2. Interval calculations yield `NaN` because `i.duration` is missing.

## Proposed Changes

### 1. Robust Schema Normalizer (`/src/pages/apps/PulseApp.tsx`)
Create a backward-compatible parser `normalizePulseBackupData` that:
- Maps legacy `title` to `name`.
- Converts ISO timestamp strings in intervals to millisecond numbers (`Date.parse()`).
- Normalizes interval durations (`durationSeconds` or `duration`) and handles `accumulatedSeconds` gracefully.
- Ensures all projects have valid `id`, `name`, and `createdAt` timestamps.

### 2. Workspace Merge Handler (`/src/pages/apps/PulseApp.tsx`)
- Combine incoming projects with existing projects (preventing duplicate IDs).
- Combine incoming tasks with existing tasks (preventing duplicate IDs).
- Set `activeProjectId` to the restored backup's active project if valid.
- Notify the user with a confirmation message (e.g., `"Successfully merged 4 projects and 3 tasks from backup!"`).

## Verification Plan
1. Test restoring the user's uploaded backup JSON file (`tracker_full_backup_2026-11-02__1__e7401da5.json`).
2. Verify all project names (`General Work`, `1_`, `2`, `3`) and task names (`11`, `21`, `33`) display correctly with accurate accumulated durations.
3. Run `compile_applet` and `lint_applet` to confirm zero errors or type mismatches.
