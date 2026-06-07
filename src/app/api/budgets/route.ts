import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || { jumlah: 0 } });
  } catch (error: any) {
    console.error('API GET Budgets Error:', error);
    return NextResponse.json({ success: false, message: error.message, data: { jumlah: 0 } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (typeof body.jumlah !== 'number') {
      return NextResponse.json({ success: false, message: 'Invalid payload: missing jumlah' }, { status: 400 });
    }

    // Check whether a budget row already exists for this user.
    // We avoid ON CONFLICT entirely so no unique constraint is required.
    const { data: existing, error: fetchError } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    let saveError: any = null;

    if (existing) {
      // Row exists — update it
      const { error } = await supabase
        .from('budgets')
        .update({ jumlah: body.jumlah })
        .eq('user_id', user.id);
      saveError = error;
    } else {
      // No row yet — insert a new one
      const { error } = await supabase
        .from('budgets')
        .insert({ user_id: user.id, jumlah: body.jumlah });
      saveError = error;
    }

    if (saveError) throw saveError;

    return NextResponse.json({ success: true, message: 'Budget berhasil diperbarui' });
  } catch (error: any) {
    console.error('API POST Budgets Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
