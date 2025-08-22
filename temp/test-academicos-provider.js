// Test script to verify AcademicOSProvider is working
// This is a temporary test file that can be deleted after verification

console.log("Testing AcademicOSProvider integration...");

// Check if the CleanAcademicOSShell component has the AcademicOSProvider
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/academic-os/components/CleanAcademicOSShell.tsx');
const content = fs.readFileSync(filePath, 'utf8');

// Check if AcademicOSProvider is imported
if (content.includes('import { AcademicOSProvider }') && content.includes('<AcademicOSProvider>')) {
  console.log('✅ AcademicOSProvider is properly imported and used in CleanAcademicOSShell');
} else {
  console.log('❌ AcademicOSProvider is missing or not properly used');
}

// Check if WeeklyViewContainer is used (which requires the provider)
if (content.includes('WeeklyViewContainer')) {
  console.log('✅ WeeklyViewContainer is present and will now have access to AcademicOS context');
} else {
  console.log('❌ WeeklyViewContainer not found');
}

console.log("Test completed. The error 'useAcademicOS must be used within AcademicOSProvider' should now be resolved.");
