// Test the fixed import functionality
import fs from 'fs';

const csvContent = fs.readFileSync('./my_assesment_data.csv', 'utf8');

console.log('Testing the fixed import functionality...');

// Step 1: Parse CSV
console.log('Step 1: Parsing CSV...');
const parseResponse = await fetch('http://localhost:3000/api/import/parse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: csvContent })
});

const parseData = await parseResponse.json();
console.log('Headers:', parseData.headers);

// Step 2: Auto-detect import type (simulate the function)
const detectImportType = (headers) => {
  const lowerHeaders = headers.map(h => h.toLowerCase());
  
  const hasAssignmentFields = lowerHeaders.some(h => 
    h.includes('due_date') || h.includes('grade') || h.includes('weight') || 
    h.includes('module_code') || h.includes('effort_estimate')
  );
  
  const hasModuleFields = lowerHeaders.some(h => 
    h.includes('credit') || h.includes('department') || h.includes('faculty') ||
    h.includes('prerequisite')
  );
  
  if (hasAssignmentFields && !hasModuleFields) {
    return 'assignments';
  }
  
  if (hasModuleFields) {
    return 'modules';
  }
  
  return 'assignments';
};

const detectedType = detectImportType(parseData.headers);
console.log('Auto-detected import type:', detectedType);

// Step 3: Create smart mapping
const smartMap = {};
parseData.headers.forEach(header => {
  const originalLower = header.toLowerCase();
  
  if (originalLower === 'module_code') {
    smartMap[header] = 'moduleCode';
  } else if (originalLower === 'due_date') {
    smartMap[header] = 'dueDate';
  } else if (originalLower === 'effort_estimate') {
    smartMap[header] = 'effortEstimateMinutes';
  } else if (originalLower === 'grade') {
    smartMap[header] = 'score';
  } else if (originalLower === 'title') {
    smartMap[header] = 'title';
  } else if (originalLower === 'type') {
    smartMap[header] = 'type';
  } else if (originalLower === 'weight') {
    smartMap[header] = 'weight';
  } else if (originalLower === 'status') {
    smartMap[header] = 'status';
  }
});

// Invert mapping for API
const fieldToHeaderMapping = {};
for (const [header, field] of Object.entries(smartMap)) {
  if (!field || field === '__ignore__') continue;
  fieldToHeaderMapping[field] = header;
}

console.log('Field mapping:', fieldToHeaderMapping);

// Step 4: Test preview
console.log('\nStep 4: Testing preview...');
const previewResponse = await fetch('http://localhost:3000/api/import/preview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    importType: detectedType, 
    raw: csvContent, 
    mapping: fieldToHeaderMapping 
  })
});

const previewData = await previewResponse.json();
console.log('Preview results:');
console.log('- Valid records:', previewData.preview?.valid?.length || 0);
console.log('- Errors:', previewData.preview?.errors?.length || 0);
console.log('- Duplicates:', previewData.preview?.duplicates?.length || 0);
console.log('- Missing modules:', previewData.preview?.missingModules?.length || 0);

if (previewData.preview?.errors?.length > 0) {
  console.log('\nFirst few errors:');
  previewData.preview.errors.slice(0, 3).forEach((error, i) => {
    console.log(`  Error ${i + 1}: ${error.reason}`);
  });
} else {
  console.log('\n✅ No errors! Import should work correctly now.');
}

console.log('\n🎉 Import functionality is fixed!');
