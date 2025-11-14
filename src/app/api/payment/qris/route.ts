import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, amount, payment_type, metadata } = body;

    if (!user_id || !amount || !payment_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique reference code
    const ref_code = `JWO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // For demo purposes, generate a mock QRIS link
    // In production, integrate with Midtrans/Xendit API
    const qris_link = `https://api.sandbox.midtrans.com/v2/qris/${ref_code}`;

    // Save payment record
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        user_id,
        amount,
        qris_link,
        payment_type,
        ref_code,
        status: 'pending',
        metadata,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating payment:', error);
      return NextResponse.json(
        { error: 'Failed to create payment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      payment_id: payment.id,
      qris_link: payment.qris_link,
      ref_code: payment.ref_code,
      amount: payment.amount,
    });
  } catch (error) {
    console.error('Error in QRIS payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ref_code = searchParams.get('ref_code');

    if (!ref_code) {
      return NextResponse.json(
        { error: 'Missing ref_code' },
        { status: 400 }
      );
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .select('*')
      .eq('ref_code', ref_code)
      .single();

    if (error || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}