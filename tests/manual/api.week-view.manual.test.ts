/** @jest-environment node */
/**
 * Manual test of the week-view API endpoint
 */
import { NextRequest } from 'next/server';

describe('week-view manual test', () => {
  test('test API endpoint with current week', async () => {
    const { GET } = await import('@/app/api/week-view/route');
    
    // Test with current date
    const today = new Date().toISOString().slice(0, 10);
    console.log(`Testing with date: ${today}`);
    
    const req = new NextRequest(`http://localhost/api/week-view?date=${today}`);
    const res = await GET(req);
    
    console.log(`Response status: ${res.status}`);
    
    const json = await res.json();
    
    console.log('Response structure:');
    console.log(`- weekRange: ${json.weekRange ? 'present' : 'missing'}`);
    console.log(`- assignments: ${json.assignments?.length || 0} items`);
    console.log(`- tacticalTasks: ${json.tacticalTasks?.length || 0} items`);
    console.log(`- moduleSummaries: ${json.moduleSummaries?.length || 0} items`);
    console.log(`- weeklyPriorities: ${json.weeklyPriorities?.length || 0} items`);
    
    if (json.assignments?.length > 0) {
      console.log('Sample assignment:', json.assignments[0]);
    }
    
    if (json.tacticalTasks?.length > 0) {
      console.log('Sample tactical task:', json.tacticalTasks[0]);
    }
    
    expect(res.status).toBe(200);
    expect(json).toHaveProperty('weekRange');
    expect(json).toHaveProperty('assignments');
    expect(json).toHaveProperty('tacticalTasks');
    expect(json).toHaveProperty('moduleSummaries');
    expect(json).toHaveProperty('weeklyPriorities');
  });
});
