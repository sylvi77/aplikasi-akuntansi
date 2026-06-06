import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Remove force-dynamic so the Cache-Control header below is honoured by the CDN.
// Mutations (POST) always bypass cache automatically.

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('transaksi')
      .select('id, tanggal, deskripsi, tipe, jumlah, kategori, createdAt')
      .order('tanggal', { ascending: false })
      .limit(200); // safety cap — prevents huge payloads as data grows

    if (error) throw error;

    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } }
    );
  } catch (error: any) {
    console.error('API GET Transactions Error:', error);
    return NextResponse.json({ success: false, message: error.message, data: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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

