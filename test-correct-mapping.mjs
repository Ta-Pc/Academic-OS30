// Test to verify the buildFieldMapping function works correctly
const mapping = {
  module_code: 'moduleCode',
  title: 'title',
  type: 'type',
  weight: 'weight',
  due_date: 'dueDate',
  status: 'status',
  grade: 'score',
  effort_estimate: 'effortEstimateMinutes'
};

console.log('Original mapping (header -> field):', mapping);

// Simulate buildFieldMapping function
const buildFieldMapping = () => {
  const fieldToHeader = {};
  for (const [header, field] of Object.entries(mapping)) {
    if (!field || field === '__ignore__') continue;
    fieldToHeader[field] = header;
  }
  return fieldToHeader;
};

const fieldToHeaderMapping = buildFieldMapping();
console.log('Inverted mapping (field -> header):', fieldToHeaderMapping);

// Test the preview API with the correct mapping
const testData = `module_code,title,type,weight,due_date,status,grade,effort_estimate
INF164,Test Assignment,Quiz,5.0,2025-07-22,graded,85,10`;

console.log('\nTesting preview API with inverted mapping...');

fetch('http://localhost:3000/api/import/preview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    importType: 'assignments', 
    raw: testData, 
    mapping: fieldToHeaderMapping 
  })
})
.then(res => res.json())
.then(data => {
  console.log('Preview Response with correct mapping:');
  console.log(JSON.stringify(data, null, 2));
})
.catch(err => {
  console.error('Error:', err);
});
