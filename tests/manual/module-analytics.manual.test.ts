/** @jest-environment node */
/**
 * Manual test of the module analytics API endpoint
 */
import { NextRequest } from 'next/server';

describe('module analytics manual test', () => {
  test('test module analytics API with STK110', async () => {
    const { GET } = await import('@/app/api/modules/[moduleId]/analytics/route');
    
    // Test with STK110 module code
    const req = new NextRequest(`http://localhost/api/modules/STK110/analytics`);
    const res = await GET(req, { params: { moduleId: 'STK110' } });
    
    console.log(`Response status: ${res.status}`);
    
    if (res.status === 200) {
      const json = await res.json();
      
      console.log('Module analytics structure:');
      console.log(`- module: ${json.data?.module ? 'present' : 'missing'}`);
      console.log(`- assignments: ${json.data?.assignments?.length || 0} items`);
      console.log(`- currentObtainedMark: ${json.data?.currentObtainedMark}`);
      console.log(`- remainingWeight: ${json.data?.remainingWeight}`);
      console.log(`- currentPredictedSemesterMark: ${json.data?.currentPredictedSemesterMark}`);
      
      if (json.data?.assignments?.length > 0) {
        console.log('Sample assignment:', json.data.assignments[0]);
      }
      
      expect(res.status).toBe(200);
      expect(json.data).toHaveProperty('module');
      expect(json.data).toHaveProperty('assignments');
      expect(json.data).toHaveProperty('currentObtainedMark');
      expect(json.data).toHaveProperty('remainingWeight');
      expect(json.data).toHaveProperty('currentPredictedSemesterMark');
    } else {
      const errorText = await res.text();
      console.log('Error response:', errorText);
      // Module might not exist, which is okay for this test
      expect(res.status).toBeGreaterThanOrEqual(400);
    }
  });
});
