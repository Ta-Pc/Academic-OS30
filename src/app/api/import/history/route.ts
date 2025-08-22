import { NextResponse } from 'next/server';

// Mock import history data for testing - in a real implementation, this would come from a database
const mockImportHistory = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    filename: 'modules-2024.csv',
    type: 'modules',
    recordsImported: 15,
    recordsFailed: 0,
    status: 'success' as const,
    duration: 1200,
    user: 'System'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    filename: 'assignments-q1.csv',
    type: 'assignments',
    recordsImported: 8,
    recordsFailed: 2,
    status: 'partial' as const,
    duration: 800,
    user: 'System'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    filename: 'full-import.json',
    type: 'full',
    recordsImported: 25,
    recordsFailed: 0,
    status: 'success' as const,
    duration: 1500,
    user: 'Admin'
  }
];

export async function GET() {
  try {
    // In a real implementation, this would query the database
    // For now, return mock data for testing
    return NextResponse.json({
      success: true,
      history: mockImportHistory
    });
  } catch (error) {
    console.error('Error fetching import history:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch import history',
        history: [] // Return empty array on error
      },
      { status: 500 }
    );
  }
}
