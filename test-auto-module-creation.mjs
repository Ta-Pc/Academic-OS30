// Test auto-module creation with new data
const testCsvWithNewModules = `module_code,title,type,weight,due_date,status,grade,effort_estimate
NEW101,Test Assignment 1,Quiz,5.0,2025-08-15,pending,0,10
NEW102,Test Assignment 2,Homework,7.5,2025-08-20,pending,0,15
NEW101,Test Assignment 3,Practical,10.0,2025-08-25,pending,0,20`;

console.log('Testing auto-module creation with new modules...');

// Parse CSV
const parseResponse = await fetch('http://localhost:3000/api/import/parse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: testCsvWithNewModules })
});

const parseData = await parseResponse.json();
console.log('Headers:', parseData.headers);

// Create mapping
const fieldToHeaderMapping = {
  moduleCode: 'module_code',
  title: 'title',
  type: 'type',
  weight: 'weight',
  dueDate: 'due_date',
  status: 'status',
  score: 'grade',
  effortEstimateMinutes: 'effort_estimate'
};

// Test preview
console.log('\nTesting preview...');
const previewResponse = await fetch('http://localhost:3000/api/import/preview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    importType: 'assignments', 
    raw: testCsvWithNewModules, 
    mapping: fieldToHeaderMapping 
  })
});

const previewData = await previewResponse.json();
console.log('Preview results:');
console.log('- Valid records:', previewData.preview?.valid?.length || 0);
console.log('- Errors:', previewData.preview?.errors?.length || 0);
console.log('- Duplicates:', previewData.preview?.duplicates?.length || 0);
console.log('- Missing modules:', previewData.preview?.missingModules?.slice(0, 5) || []);

if (previewData.preview?.valid?.length > 0) {
  console.log('\n✅ Preview successful! Now testing actual import...');
  
  // Test actual import (this should auto-create the missing modules)
  const importResponse = await fetch('http://localhost:3000/api/import/ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      importType: 'assignments', 
      raw: testCsvWithNewModules, 
      mapping: fieldToHeaderMapping 
    })
  });
  
  const importResult = await importResponse.json();
  console.log('\nImport results:');
  console.log('- Total records:', importResult.total);
  console.log('- Successful:', importResult.successCount);
  console.log('- Failed:', importResult.failures?.length || 0);
  
  if (importResult.failures?.length > 0) {
    console.log('\nFailures:');
    importResult.failures.slice(0, 3).forEach((failure, i) => {
      console.log(`  ${i + 1}. ${failure.reason}`);
    });
  }
  
  if (importResult.successCount > 0) {
    console.log('\n🎉 Auto-module creation is working!');
    console.log('Modules NEW101 and NEW102 should have been auto-created.');
  }
} else {
  console.log('\n❌ Preview failed - no valid records found');
}
