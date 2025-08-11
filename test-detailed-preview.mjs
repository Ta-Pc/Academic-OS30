// Detailed test to debug the preview API issue
const testData = `module_code,title,type,weight,due_date,status,grade,effort_estimate
INF164,Test Assignment,Quiz,5.0,2025-07-22,graded,85,10`;

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

console.log('Testing detailed preview...');

fetch('http://localhost:3000/api/import/preview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    importType: 'assignments', 
    raw: testData, 
    mapping: smartMap 
  })
})
.then(res => res.json())
.then(data => {
  console.log('Full Preview Response:');
  console.log(JSON.stringify(data, null, 2));
  
  if (data.preview?.errors?.length > 0) {
    console.log('\nDetailed Errors:');
    data.preview.errors.forEach((error, i) => {
      console.log(`Error ${i + 1}:`, error);
    });
  }
})
.catch(err => {
  console.error('Error:', err);
});
