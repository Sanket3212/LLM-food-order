import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://backend-llm-production-afb7.up.railway.app';

export async function POST() {
  try {
    const response = await fetch(`${API_BASE}/cart/clear`, {
      method: 'POST',
    });
    
    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Cart cleared successfully',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to clear cart' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}