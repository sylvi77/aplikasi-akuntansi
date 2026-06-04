import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    
    const { error } = await supabase
      .from('transaksi')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Transaksi berhasil dihapus' });
  } catch (error: any) {
    console.error('API DELETE Transaction Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const body = await request.json();
    
    const updates: any = {};
    if (body.tanggal) updates.tanggal = body.tanggal;
    if (body.deskripsi) updates.deskripsi = body.deskripsi;
    if (body.tipe) updates.tipe = body.tipe;
    if (body.jumlah) updates.jumlah = body.jumlah;
    if (body.kategori) updates.kategori = body.kategori;

    const { error } = await supabase
      .from('transaksi')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Transaksi berhasil diperbarui' });
  } catch (error: any) {
    console.error('API PUT Transaction Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
