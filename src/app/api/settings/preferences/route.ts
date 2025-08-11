import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get system preferences and user settings
    const preferences = {
      // System settings
      academicYear: process.env.ACADEMIC_YEAR || '2024-2025',
      timezone: process.env.TIMEZONE || 'UTC',
      dateFormat: process.env.DATE_FORMAT || 'dd/MM/yyyy',
      
      // User preferences (these would typically come from a user settings table)
      defaultView: 'week-view',
      notificationsEnabled: true,
      emailDigest: true,
      reminderThreshold: 24, // hours
      priorityThreshold: 7, // days
      
      // Display preferences
      theme: 'light',
      compactMode: false,
      showCompleted: true,
      itemsPerPage: 25,
      
      // Academic preferences
      defaultSemester: 'current',
      gradeScale: '100',
      passingGrade: 50,
    };

    return NextResponse.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the preferences object
    const validKeys = [
      'academicYear', 'timezone', 'dateFormat', 'defaultView',
      'notificationsEnabled', 'emailDigest', 'reminderThreshold',
      'priorityThreshold', 'theme', 'compactMode', 'showCompleted',
      'itemsPerPage', 'defaultSemester', 'gradeScale', 'passingGrade'
    ];
    
    const preferences: Record<string, unknown> = {};
    for (const key of validKeys) {
      if (body[key] !== undefined) {
        preferences[key] = body[key];
      }
    }
    
    // In a real implementation, you would save these to a user preferences table
    // For now, we'll just return the updated preferences
    
    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      data: preferences
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
