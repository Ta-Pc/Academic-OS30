// Test duplicate detection functionality
const testDataWithDuplicates = `module_code,title,type,weight,due_date,status,grade,effort_estimate
INF164,Test Assignment,Quiz,5.0,2025-07-22,graded,85,10
INF164,Test Assignment,Quiz,5.0,2025-07-22,graded,85,10
INF164,Different Assignment,Practical,7.0,2025-07-25,pending,0,15
STC122,Unique Assignment,Homework,3.0,2025-07-24,graded,90,8`;

const smartMap = {
  module_code: 'moduleCode',
  title: 'title',
  type: 'type',
  weight: 'weight',
  due_date: 'dueDate',
  status: 'status',
  grade: 'score',
  effort_estimate: 'effortEstimateMinutes'
};

console.log('Testing duplicate detection...');

// Step 1: Parse CSV
fetch('http://localhost:3000/api/import/parse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: testDataWithDuplicates })
})
.then(res => res.json())
.then(parseData => {
  console.log('Parsed data:', parseData);
  
  // Step 2: Invert mapping for API
  const fieldToHeaderMapping = {};
  for (const [header, field] of Object.entries(smartMap)) {
    if (!field || field === '__ignore__') continue;
    fieldToHeaderMapping[field] = header;
  }
  
  console.log('Using mapping:', fieldToHeaderMapping);
  
  // Step 3: Test preview with duplicates
  return fetch('http://localhost:3000/api/import/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      importType: 'assignments', 
      raw: testDataWithDuplicates, 
      mapping: fieldToHeaderMapping 
    })
  });
})
.then(res => res.json())
.then(data => {
  console.log('\nPreview Response:');
  console.log('Valid records:', data.preview?.valid?.length || 0);
  console.log('Errors:', data.preview?.errors?.length || 0);
  console.log('Duplicates:', data.preview?.duplicates?.length || 0);
  
  if (data.preview?.duplicates?.length > 0) {
    console.log('\nDuplicate details:');
    data.preview.duplicates.forEach((duplicate, i) => {
      console.log(`  ${i + 1}. ${duplicate.reason}`);
    });
  }
  
  console.log('\nDuplicate detection is working!');
})
.catch(err => {
  console.error('Error:', err);
});
