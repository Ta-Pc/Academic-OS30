// Test reset data functionality
console.log('Testing reset data API...');

fetch('http://localhost:3000/api/data/reset', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ confirmReset: true })
})
.then(res => res.json())
.then(data => {
  console.log('Reset Response:', data);
  if (data.success) {
    console.log('Reset successful!');
    console.log('Summary:', data.summary);
  } else {
    console.log('Reset failed:', data.error);
  }
})
.catch(err => {
  console.error('Error:', err);
});
