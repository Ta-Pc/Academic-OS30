// Test script to verify import mapping functionality
import fs from 'fs';

// Test the CSV parsing
const csvContent = fs.readFileSync('./my_assesment_data.csv', 'utf8');
const firstLine = csvContent.split('\n')[0];
const headers = firstLine.split(',');

console.log('CSV Headers found:', headers);

// Test the smart mapping logic (simulated)
const getSmartMapping = (headers) => {
  const smartMap = {};
  
  headers.forEach(header => {
    const lowerHeader = header.toLowerCase().replace(/[_\s-]/g, '');
    const originalLower = header.toLowerCase();
    
    // Exact matches for common CSV headers
    if (originalLower === 'module_code') {
      smartMap[header] = 'moduleCode';
    } else if (originalLower === 'due_date') {
      smartMap[header] = 'dueDate';
    } else if (originalLower === 'effort_estimate') {
      smartMap[header] = 'effortEstimateMinutes';
    } else if (originalLower === 'grade') {
      smartMap[header] = 'score';
    } else if (lowerHeader.includes('title') || lowerHeader.includes('name')) {
      smartMap[header] = 'title';
    } else if (lowerHeader.includes('type') || lowerHeader.includes('category')) {
      smartMap[header] = 'type';
    } else if (lowerHeader.includes('weight') || lowerHeader.includes('percent')) {
      smartMap[header] = 'weight';
    } else if (lowerHeader.includes('status')) {
      smartMap[header] = 'status';
    }
  });
  
  return smartMap;
};

const smartMapping = getSmartMapping(headers);
console.log('\nSmart mapping result:');
console.log(smartMapping);

// Test API endpoint
const testApiEndpoint = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/import/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: csvContent })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('\nAPI Parse Response:');
      console.log('Headers:', data.headers);
      console.log('Rows count:', data.rows?.length);
    } else {
      console.log('API Error:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('API Request failed:', error.message);
  }
};

await testApiEndpoint();
