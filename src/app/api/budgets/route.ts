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

    // Upsert a single budget configuration per user
    const { error } = await supabase
      .from('budgets')
      .upsert({
        user_id: user.id,
        jumlah: body.jumlah
      }, { onConflict: 'user_id' });

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Budgets berhasil diperbarui' });
  } catch (error: any) {
    console.error('API POST Budgets Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
