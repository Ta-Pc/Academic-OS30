import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: 'Reset data endpoint not implemented' }, { status: 501 });
}