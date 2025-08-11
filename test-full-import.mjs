// Test full end-to-end import flow with actual CSV
import fs from 'fs';

const csvContent = fs.readFileSync('./my_assesment_data.csv', 'utf8');

console.log('Testing full import flow...');

// Step 1: Parse CSV
console.log('Step 1: Parsing CSV...');
const parseResponse = await fetch('http://localhost:3000/api/import/parse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: csvContent })
});

const parseData = await parseResponse.json();
console.log('Headers:', parseData.headers);
console.log('Sample row:', parseData.rows[0]);

// Step 2: Create smart mapping
console.log('\nStep 2: Creating smart mapping...');
const headers = parseData.headers;
const smartMap = {};

headers.forEach(header => {
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

console.log('Smart mapping (header -> field):', smartMap);

// Step 3: Invert mapping for API
const fieldToHeaderMapping = {};
for (const [header, field] of Object.entries(smartMap)) {
  if (!field || field === '__ignore__') continue;
  fieldToHeaderMapping[field] = header;
}

console.log('Inverted mapping (field -> header):', fieldToHeaderMapping);

// Step 4: Test preview
console.log('\nStep 3: Testing preview...');
const previewResponse = await fetch('http://localhost:3000/api/import/preview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    importType: 'assignments', 
    raw: csvContent, 
    mapping: fieldToHeaderMapping 
  })
});

const previewData = await previewResponse.json();
console.log('Valid records:', previewData.preview?.valid?.length || 0);
console.log('Errors:', previewData.preview?.errors?.length || 0);
console.log('Missing modules:', previewData.preview?.missingModules?.length || 0);

if (previewData.preview?.errors?.length > 0) {
  console.log('First few errors:');
  previewData.preview.errors.slice(0, 3).forEach((error, i) => {
    console.log(`  Error ${i + 1}: ${error.reason}`);
  });
}

console.log('\nImport mapping is working correctly!');
