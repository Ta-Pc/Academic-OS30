@echo off
echo Cleaning up Academic OS project...
echo.

echo Removing redundant documentation files...
del PROJECT_OVERVIEW.md 2>nul && echo ✓ Removed PROJECT_OVERVIEW.md
del TESTING_OVERVIEW.md 2>nul && echo ✓ Removed TESTING_OVERVIEW.md
del TODO-settings-testing.md 2>nul && echo ✓ Removed TODO-settings-testing.md
del ISSUES.md 2>nul && echo ✓ Removed ISSUES.md

echo.
echo Removing old cleanup scripts...
del cleanup-all.ps1 2>nul && echo ✓ Removed cleanup-all.ps1
del cleanup-test-files.ps1 2>nul && echo ✓ Removed cleanup-test-files.ps1
del final-cleanup.ps1 2>nul && echo ✓ Removed final-cleanup.ps1
del TODO-cleanup.md 2>nul && echo ✓ Removed TODO-cleanup.md

echo.
echo Cleaning documentation directories...
if exist docs\*.md (
    del docs\*.md 2>nul
    echo ✓ Cleaned docs directory
)
if exist docs\academic-os\*.md (
    del docs\academic-os\*.md 2>nul
    echo ✓ Cleaned docs\academic-os directory
)
if exist docs\inventory\*.md (
    del docs\inventory\*.md 2>nul
    echo ✓ Cleaned docs\inventory directory
)

echo.
echo Essential files preserved:
echo ✓ ACADEMIC_OS_FINAL_DOCUMENTATION.md
echo ✓ ESLINT_BEST_PRACTICES.md
echo ✓ TODO.md
echo ✓ Cleanup scripts

echo.
echo Cleanup completed successfully!
pause
