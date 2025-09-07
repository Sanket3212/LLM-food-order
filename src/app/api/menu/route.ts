import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://backend-llm-production-afb7.up.railway.app';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE}/menu`);
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      menu: data.menu || [],
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}