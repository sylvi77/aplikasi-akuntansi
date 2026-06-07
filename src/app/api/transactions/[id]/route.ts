import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const id = (await params).id;
    
    const { error } = await supabase
      .from('transaksi')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Explicit user_id check as extra safety

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Transaksi berhasil dihapus' });
  } catch (error: any) {
    console.error('API DELETE Transaction Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

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
      .eq('id', id)
      .eq('user_id', user.id); // Explicit user_id check

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Transaksi berhasil diperbarui' });
  } catch (error: any) {
    console.error('API PUT Transaction Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
