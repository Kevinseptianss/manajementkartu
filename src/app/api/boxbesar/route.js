import { NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';

export async function GET() {
  try {
    const boxBesarRef = db.collection('boxBesar');
    const snapshot = await boxBesarRef.get();
    const boxBesar = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ success: true, data: boxBesar });
  } catch (error) {
    console.error('Error fetching Box Besar:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const boxBesarData = {
      namaBox: data.namaBox,
      deskripsi: data.deskripsi || '',
      rakId: data.rakId || null,
      boxKecilIds: data.boxKecilIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const boxBesarRef = db.collection('boxBesar');
    const docRef = await boxBesarRef.add(boxBesarData);

    return NextResponse.json({ 
      success: true, 
      id: docRef.id,
      data: { id: docRef.id, ...boxBesarData }
    });
  } catch (error) {
    console.error('Error adding Box Besar:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    updateData.updatedAt = new Date().toISOString();

    await db.collection('boxBesar').doc(id).update(updateData);

    return NextResponse.json({ success: true, data: { id, ...updateData } });
  } catch (error) {
    console.error('Error updating Box Besar:', error);
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

    await db.collection('boxBesar').doc(id).delete();

    return NextResponse.json({ success: true, message: 'Box Besar deleted successfully' });
  } catch (error) {
    console.error('Error deleting Box Besar:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
