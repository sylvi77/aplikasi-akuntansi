import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// No force-dynamic — GET is cacheable (s-maxage=60 below).

export async function GET(request: Request) {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .select('*');

    if (error) throw error;

    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } }
    );
  } catch (error: any) {
    console.error('API GET Budgets Error:', error);
    return NextResponse.json({ success: false, message: error.message, data: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json(); 
    if (!Array.isArray(body)) {
       return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }

    const { error } = await supabase
      .from('budgets')
      .upsert(body.map((item: any) => ({
        kategori: item.kategori,
        jumlah: item.jumlah
      })), { onConflict: 'kategori' });

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Budgets berhasil diperbarui' });
  } catch (error: any) {
    console.error('API POST Budgets Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
