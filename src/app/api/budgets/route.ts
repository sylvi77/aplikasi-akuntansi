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
      .select('*');
      // RLS automatically filters by user_id

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('API GET Budgets Error:', error);
    return NextResponse.json({ success: false, message: error.message, data: [] }, { status: 500 });
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
    if (!Array.isArray(body)) {
       return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }

    // Best effort per-user update. Note: if kategori is the primary key globally,
    // this may require database schema adjustments to (kategori, user_id).
    // For now, we will delete existing budgets for the user and insert new ones to avoid onConflict issues.
    
    // 1. Delete all current budgets for this user
    await supabase.from('budgets').delete().eq('user_id', user.id);

    // 2. Insert new budgets
    if (body.length > 0) {
      const { error } = await supabase
        .from('budgets')
        .insert(body.map((item: any) => ({
          kategori: item.kategori,
          jumlah: item.jumlah,
          user_id: user.id
        })));

      if (error) throw error;
    }

    return NextResponse.json({ success: true, message: 'Budgets berhasil diperbarui' });
  } catch (error: any) {
    console.error('API POST Budgets Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
