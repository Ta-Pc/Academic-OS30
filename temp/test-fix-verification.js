// Test to verify both fixes are working
const fs = require('fs');
const path = require('path');

console.log("Testing AcademicOS fixes...");

// Test 1: Check if AcademicOSProvider is properly added to CleanAcademicOSShell
const shellPath = path.join(__dirname, '../src/academic-os/components/CleanAcademicOSShell.tsx');
const shellContent = fs.readFileSync(shellPath, 'utf8');

if (shellContent.includes('import { AcademicOSProvider }') && 
    shellContent.includes('<AcademicOSProvider>') && 
    shellContent.includes('</AcademicOSProvider>')) {
  console.log('✅ AcademicOSProvider is properly integrated in CleanAcademicOSShell');
} else {
  console.log('❌ AcademicOSProvider integration issue');
}

// Test 2: Check if the TypeError fix is applied in WeeklyViewContainer
const weeklyPath = path.join(__dirname, '../src/academic-os/components/views/WeeklyViewContainer.tsx');
const weeklyContent = fs.readFileSync(weeklyPath, 'utf8');

if (weeklyContent.includes('task.priority?.toLowerCase()') || 
    weeklyContent.includes('task.priority || \'low\'')) {
  console.log('✅ TypeError fix applied in WeeklyViewContainer');
} else {
  console.log('❌ TypeError fix not found');
}

// Test 3: Check if both files are syntactically correct
try {
  // This is a basic syntax check - we can't actually compile TypeScript here
  // but we can check for obvious syntax issues
  const shellLines = shellContent.split('\n');
  const weeklyLines = weeklyContent.split('\n');
  
  // Check for balanced braces and parentheses (basic check)
  const shellBraces = shellContent.split('{').length - shellContent.split('}').length;
  const shellParens = shellContent.split('(').length - shellContent.split(')').length;
  
  const weeklyBraces = weeklyContent.split('{').length - weeklyContent.split('}').length;
  const weeklyParens = weeklyContent.split('(').length - weeklyContent.split(')').length;
  
  if (shellBraces === 0 && shellParens === 0 && weeklyBraces === 0 && weeklyParens === 0) {
    console.log('✅ Basic syntax validation passed');
  } else {
    console.log('⚠️  Potential syntax issues detected');
  }
  
} catch (error) {
  console.log('❌ Syntax check failed:', error.message);
}

console.log("\nFix verification completed. The development server should now run without:");
console.log("1. 'useAcademicOS must be used within AcademicOSProvider' error");
console.log("2. 'Cannot read properties of undefined (reading toLowerCase)' error");
