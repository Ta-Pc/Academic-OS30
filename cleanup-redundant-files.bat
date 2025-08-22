@echo off
echo === Academic OS Redundant Files Cleanup ===
echo Starting cleanup process...

:: Files to remove
set filesToRemove=(
PROJECT_OVERVIEW.md
TESTING_OVERVIEW.md
ISSUES.md
TODO-settings-testing.md
cleanup-all.ps1
cleanup-test-files.ps1
final-cleanup.ps1
docs\settings-testing-guide.md
docs\e2e-testing-guide.md
docs\e2e-test-update-summary.md
docs\legacy-test-cleanup-summary.md
docs\pr-ui-component.md
docs\troubleshooting-guide.md
docs\ui-migration-plan.md
docs\academic-os\COMPLETION.md
docs\academic-os\FINALIZATION.md
docs\academic-os\IMPLEMENTATION.md
docs\academic-os\RECON.md
docs\inventory\api_routes.md
docs\inventory\legacy_docs.md
docs\inventory\legacy_scripts.md
docs\inventory\legacy_tests.md
docs\inventory\seed_refs.md
docs\inventory\unused_components.md
)

set removedCount=0
set skippedCount=0

for %%f in (%filesToRemove%) do (
    if exist "%%f" (
        del "%%f" 2>nul
        if !errorlevel! equ 0 (
            echo ✓ Removed: %%f
            set /a removedCount+=1
        ) else (
            echo ✗ Error removing: %%f
            set /a skippedCount+=1
        )
    ) else (
        echo ℹ Not found: %%f
        set /a skippedCount+=1
    )
)

:: Clean test-results directory
if exist "test-results" (
    rd /s /q "test-results" 2>nul
    if !errorlevel! equ 0 (
        echo ✓ Cleared test-results directory
    ) else (
        echo ✗ Error clearing test-results
    )
)

echo.
echo === Summary ===
echo Files removed: %removedCount%
echo Files skipped: %skippedCount%

echo.
echo ✅ Cleanup completed!
echo Essential files preserved:
echo   - ACADEMIC_OS_FINAL_DOCUMENTATION.md
echo   - ESLINT_BEST_PRACTICES.md
echo   - TODO.md
