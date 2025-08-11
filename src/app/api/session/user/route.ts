import { NextResponse } from 'next/server';

export async function GET() {
  // Return a stub user for compatibility with import flows and e2e tests
  // User features have been removed but some tests still expect this endpoint
  return NextResponse.json({
    user: {
      id: 'stub-user',
      name: 'Academic OS User',
      email: 'user@academic-os.local'
    }
  });
}
