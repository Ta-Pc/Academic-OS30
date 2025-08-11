import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'Week view API is working',
    timestamp: new Date().toISOString(),
  })
}
