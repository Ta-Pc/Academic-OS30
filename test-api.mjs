// Simple test to verify import API
const testData = `module_code,title,type,weight,due_date,status,grade,effort_estimate
INF164,Test Assignment,Quiz,5.0,2025-07-22,graded,85,10`;

console.log('Testing CSV parse...');

fetch('http://localhost:3000/api/import/parse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: testData })
})
.then(res => res.json())
.then(data => {
  console.log('Parse API Response:', data);
  
  // Test smart mapping with the actual headers
  const headers = data.headers;
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
  
  console.log('Smart mapping would create:', smartMap);
  
  // Test preview API
  console.log('\nTesting preview API...');
  return fetch('http://localhost:3000/api/import/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      importType: 'assignments', 
      raw: testData, 
      mapping: smartMap 
    })
  });
})
.then(res => res.json())
.then(data => {
  console.log('Preview API Response:', data);
})
.catch(err => {
  console.error('Error:', err);
});
