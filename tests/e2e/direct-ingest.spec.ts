import { test, expect } from '@playwright/test';

test.describe('Direct API Import Test', () => {
  test('directly test ingest API with correct mapping', async ({ request }) => {
    const csvContent = `Code,Title,Credit Hours
NODate1,Test Module 1,12
NODate2,Test Module 2,16`;

    // Get user session
    const userResp = await request.get('/api/session/user');
    const userData = await userResp.json();
    const userId = userData.user?.id;
    expect(userId).toBeTruthy();

    // Get existing terms instead of creating new one
    const termsResp = await request.get('/api/terms');
    const termsData = await termsResp.json();
    console.log('Available terms:', termsData);
    
    let termId = termsData.terms?.[0]?.id;
    
    if (!termId) {
      // Create a term if none exist
      const termResp = await request.post('/api/terms', {
        data: {
          title: 'Test Term',
          startDate: '2025-08-01',
          endDate: '2025-11-30'
        }
      });
      const termData = await termResp.json();
      console.log('Term creation response:', termData);
      termId = termData.term?.id;
    }
    
    expect(termId).toBeTruthy();

    // Test with correct field -> header mapping but NO termId first
    const correctMapping = {
      code: 'Code',
      title: 'Title', 
      creditHours: 'Credit Hours'
    };

    console.log('Testing with mapping:', correctMapping);
    console.log('CSV content:', csvContent);

    const ingestResp = await request.post('/api/import/ingest', {
      data: {
        importType: 'modules',
        raw: csvContent,
        mapping: correctMapping,
        userId,
        termId
      }
    });

    const ingestResult = await ingestResp.json();
    console.log('Ingest result:', JSON.stringify(ingestResult, null, 2));

    // Should succeed
    expect(ingestResult.successCount).toBe(2);
    expect(ingestResult.total).toBe(2);
    expect(ingestResult.failures?.length || 0).toBe(0);

    // Verify modules exist
    const modulesResp = await request.get('/api/modules');
    const modulesData = await modulesResp.json();
    const testModules = modulesData.modules?.filter((m: any) => ['NODate1', 'NODate2'].includes(m.code)) || [];
    expect(testModules.length).toBe(2);
    
    testModules.forEach((m: any) => {
      expect(m.startDate).toBeTruthy();
      expect(m.endDate).toBeTruthy();
    });
  });
});
