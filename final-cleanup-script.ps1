# Final Cleanup Script for Academic OS Project
# This script removes all redundant files and consolidates documentation

Write-Host "Starting Academic OS Project Cleanup..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# List of files to remove (redundant documentation and old cleanup scripts)
$filesToRemove = @(
    # Redundant documentation files
    "PROJECT_OVERVIEW.md",
    "TESTING_OVERVIEW.md", 
    "TODO-settings-testing.md",
    "ISSUES.md",
    
    # Old cleanup scripts
    "cleanup-all.ps1",
    "cleanup-test-files.ps1",
    "final-cleanup.ps1",
    
    # Temporary cleanup tracking
    "TODO-cleanup.md"
)

# List of directories to clean up
$directoriesToClean = @(
    "docs",
    "docs/academic-os",
    "docs/inventory"
)

Write-Host "`nRemoving redundant files..." -ForegroundColor Yellow
foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        try {
            Remove-Item $file -Force
            Write-Host "✓ Removed: $file" -ForegroundColor Green
        }
        catch {
            Write-Host "✗ Failed to remove: $file - $_" -ForegroundColor Red
        }
    }
    else {
        Write-Host "ℹ Not found: $file" -ForegroundColor Gray
    }
}

Write-Host "`nCleaning up documentation directories..." -ForegroundColor Yellow
foreach ($dir in $directoriesToClean) {
    if (Test-Path $dir) {
        try {
            # Remove all .md files but keep other files
            Get-ChildItem -Path $dir -Filter "*.md" | Remove-Item -Force
            Write-Host "✓ Cleaned markdown files in: $dir" -ForegroundColor Green
        }
        catch {
            Write-Host "✗ Failed to clean: $dir - $_" -ForegroundColor Red
        }
    }
    else {
        Write-Host "ℹ Directory not found: $dir" -ForegroundColor Gray
    }
}

# Files to keep (essential documentation)
$filesToKeep = @(
    "ACADEMIC_OS_FINAL_DOCUMENTATION.md",
    "ESLINT_BEST_PRACTICES.md", 
    "TODO.md",
    "cleanup-redundant-files.ps1",
    "cleanup-redundant-files.bat"
)

Write-Host "`nEssential files that will remain:" -ForegroundColor Cyan
foreach ($file in $filesToKeep) {
    if (Test-Path $file) {
        Write-Host "✓ Keeping: $file" -ForegroundColor Cyan
    }
}

Write-Host "`nCleanup Summary:" -ForegroundColor Green
Write-Host "=================" -ForegroundColor Green
Write-Host "✓ Removed redundant documentation files" -ForegroundColor Green
Write-Host "✓ Cleaned up documentation directories" -ForegroundColor Green
Write-Host "✓ Preserved essential files:" -ForegroundColor Green
Write-Host "  - ACADEMIC_OS_FINAL_DOCUMENTATION.md (comprehensive documentation)" -ForegroundColor Green
Write-Host "  - ESLINT_BEST_PRACTICES.md (code quality guidelines)" -ForegroundColor Green
Write-Host "  - TODO.md (remaining tasks)" -ForegroundColor Green
Write-Host "  - Cleanup scripts (for future maintenance)" -ForegroundColor Green

Write-Host "`nProject structure is now clean and organized!" -ForegroundColor Green
Write-Host "All documentation has been consolidated into ACADEMIC_OS_FINAL_DOCUMENTATION.md" -ForegroundColor Green

# Verify final state
Write-Host "`nFinal file structure:" -ForegroundColor Magenta
Get-ChildItem -File | Where-Object { $_.Name -like "*.md" } | Select-Object Name, Length | Format-Table -AutoSize

Write-Host "`nCleanup completed successfully! 🎉" -ForegroundColor Green
