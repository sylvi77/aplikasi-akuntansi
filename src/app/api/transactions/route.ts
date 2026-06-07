import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('transaksi')
      .select('id, tanggal, deskripsi, tipe, jumlah, kategori, createdAt')
      // RLS automatically filters by user_id = auth.uid()
      .order('tanggal', { ascending: false })
      .limit(200);

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('API GET Transactions Error:', error);
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

    const { data, error } = await supabase
      .from('transaksi')
      .insert([
        {
          tanggal: body.tanggal,
          deskripsi: body.deskripsi,
          tipe: body.tipe,
          jumlah: body.jumlah,
          kategori: body.kategori,
          user_id: user.id, // Associate transaction with the logged-in user
        },
      ])
      .select('id, tanggal, deskripsi, tipe, jumlah, kategori, createdAt')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data, message: 'Transaksi berhasil ditambahkan' });
  } catch (error: any) {
    console.error('API POST Transactions Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

