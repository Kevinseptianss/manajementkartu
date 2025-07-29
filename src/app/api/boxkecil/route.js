import { NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';

export async function GET() {
  try {
    const boxKecilRef = db.collection('boxKecil');
    const snapshot = await boxKecilRef.get();
    const boxKecil = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ success: true, data: boxKecil });
  } catch (error) {
    console.error('Error fetching Box Kecil:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const boxKecilData = {
      namaBoxKecil: data.namaBoxKecil,
      deskripsi: data.deskripsi || '',
      boxBesarId: data.boxBesarId || null,
      rakId: data.rakId || null,
      totalKartu: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const boxKecilRef = db.collection('boxKecil');
    const docRef = await boxKecilRef.add(boxKecilData);

    return NextResponse.json({ 
      success: true, 
      id: docRef.id,
      data: { id: docRef.id, ...boxKecilData }
    });
  } catch (error) {
    console.error('Error adding Box Kecil:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    updateData.updatedAt = new Date().toISOString();

    await db.collection('boxKecil').doc(id).update(updateData);

    return NextResponse.json({ success: true, data: { id, ...updateData } });
  } catch (error) {
    console.error('Error updating Box Kecil:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    await db.collection('boxKecil').doc(id).delete();

    return NextResponse.json({ success: true, message: 'Box Kecil deleted successfully' });
  } catch (error) {
    console.error('Error deleting Box Kecil:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
