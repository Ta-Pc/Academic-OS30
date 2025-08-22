<#
.SYNOPSIS
Cleanup script for Academic OS project - removes redundant markdown files
#>

Write-Host "=== Academic OS Redundant Files Cleanup ===" -ForegroundColor Green
Write-Host "Starting cleanup process..." -ForegroundColor Yellow

# Files to remove
$filesToRemove = @(
    "PROJECT_OVERVIEW.md",
    "TESTING_OVERVIEW.md", 
    "ISSUES.md",
    "TODO-settings-testing.md",
    "cleanup-all.ps1",
    "cleanup-test-files.ps1",
    "final-cleanup.ps1",
    "docs/settings-testing-guide.md",
    "docs/e2e-testing-guide.md",
    "docs/e2e-test-update-summary.md",
    "docs/legacy-test-cleanup-summary.md",
    "docs/pr-ui-component.md",
    "docs/troubleshooting-guide.md",
    "docs/ui-migration-plan.md",
    "docs/academic-os/COMPLETION.md",
    "docs/academic-os/FINALIZATION.md", 
    "docs/academic-os/IMPLEMENTATION.md",
    "docs/academic-os/RECON.md",
    "docs/inventory/api_routes.md",
    "docs/inventory/legacy_docs.md",
    "docs/inventory/legacy_scripts.md",
    "docs/inventory/legacy_tests.md",
    "docs/inventory/seed_refs.md",
    "docs/inventory/unused_components.md"
)

$removedCount = 0
$skippedCount = 0

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        try {
            Remove-Item $file -Force -ErrorAction Stop
            Write-Host "✓ Removed: $file" -ForegroundColor Red
            $removedCount++
        }
        catch {
            Write-Host "✗ Error removing $file : $($_.Exception.Message)" -ForegroundColor Yellow
            $skippedCount++
        }
    }
    else {
        Write-Host "ℹ Not found: $file" -ForegroundColor Gray
        $skippedCount++
    }
}

# Clean test-results directory
if (Test-Path "test-results" -PathType Container) {
    $testFiles = Get-ChildItem "test-results" -File
    if ($testFiles.Count -gt 0) {
        try {
            Remove-Item "test-results/*" -Force -Recurse
            Write-Host "✓ Cleared test-results directory" -ForegroundColor Green
        }
        catch {
            Write-Host "✗ Error clearing test-results" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Green
Write-Host "Files removed: $removedCount" -ForegroundColor White
Write-Host "Files skipped: $skippedCount" -ForegroundColor White

Write-Host "`n✅ Cleanup completed!" -ForegroundColor Green
Write-Host "Essential files preserved:" -ForegroundColor White
Write-Host "  - ACADEMIC_OS_FINAL_DOCUMENTATION.md" -ForegroundColor White
Write-Host "  - ESLINT_BEST_PRACTICES.md" -ForegroundColor White
Write-Host "  - TODO.md" -ForegroundColor White
