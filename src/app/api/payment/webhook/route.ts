import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ref_code, status, transaction_status } = body;

    if (!ref_code) {
      return NextResponse.json(
        { error: 'Missing ref_code' },
        { status: 400 }
      );
    }

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('ref_code', ref_code)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment status
    const paymentStatus = transaction_status === 'settlement' || status === 'paid' ? 'paid' : 'failed';
    
    const { error: updateError } = await supabase
      .from('payments')
      .update({ 
        status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Error updating payment:', updateError);
      return NextResponse.json(
        { error: 'Failed to update payment' },
        { status: 500 }
      );
    }

    // Process based on payment type
    if (paymentStatus === 'paid') {
      if (payment.payment_type === 'subscription') {
        await processSubscriptionPayment(payment);
      } else if (payment.payment_type === 'booking') {
        await processBookingPayment(payment);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    console.error('Error in webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processSubscriptionPayment(payment: any) {
  const metadata = payment.metadata || {};
  const plan_id = metadata.plan_id;
  const duration_days = metadata.duration_days || 30;

  if (!plan_id) {
    console.error('Missing plan_id in payment metadata');
    return;
  }

  const start_date = new Date();
  const end_date = new Date();
  end_date.setDate(end_date.getDate() + duration_days);

  // Create or update subscription
  const { error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: payment.user_id,
      plan_id,
      status: 'active',
      start_date: start_date.toISOString(),
      end_date: end_date.toISOString(),
      payment_ref: payment.ref_code,
    });

  if (error) {
    console.error('Error creating subscription:', error);
    return;
  }

  // Update chat_usage to set is_premium = true
  const { error: chatUsageError } = await supabase
    .from('chat_usage')
    .upsert(
      {
        user_id: payment.user_id,
        is_premium: true,
        chat_limit: 999999, // Unlimited for premium
        updated_at: new Date().toISOString(),
      },
      { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      }
    );

  if (chatUsageError) {
    console.error('Error updating chat_usage:', chatUsageError);
  } else {
    console.log('Successfully updated is_premium for user:', payment.user_id);
  }
}

async function processBookingPayment(payment: any) {
  const metadata = payment.metadata || {};
  const booking_id = metadata.booking_id;

  if (!booking_id) {
    console.error('Missing booking_id in payment metadata');
    return;
  }

  // Update booking status
  const { error: bookingError } = await supabase
    .from('bookings')
    .update({
      status: 'paid',
      payment_ref: payment.ref_code,
    })
    .eq('id', booking_id);

  if (bookingError) {
    console.error('Error updating booking:', bookingError);
    return;
  }

  // Get booking details
  const { data: booking } = await supabase
    .from('bookings')
    .select('user_id, professional_id')
    .eq('id', booking_id)
    .single();

  if (booking) {
    // Check if chat channel already exists
    const { data: existingChannel } = await supabase
      .from('chat_channels')
      .select('id')
      .eq('user_id', booking.user_id)
      .eq('professional_id', booking.professional_id)
      .single();

    if (existingChannel) {
      // Update existing channel with booking_id
      const { error: updateError } = await supabase
        .from('chat_channels')
        .update({ booking_id })
        .eq('id', existingChannel.id);

      if (updateError) {
        console.error('Error updating chat channel:', updateError);
      }
    } else {
      // Create new chat channel
      const { error: channelError } = await supabase
        .from('chat_channels')
        .insert({
          user_id: booking.user_id,
          professional_id: booking.professional_id,
          booking_id,
        });

      if (channelError) {
        console.error('Error creating chat channel:', channelError);
      }
    }
  }
}