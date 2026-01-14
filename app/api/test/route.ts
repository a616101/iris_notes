import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    
    return NextResponse.json({
      success: true,
      session,
      env: {
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        hasUrl: !!process.env.NEXTAUTH_URL,
        hasDatabase: !!process.env.DATABASE_URL,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
