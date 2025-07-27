import { db } from '../../../../lib/firebase';
import { NextResponse } from 'next/server';

// GET all racks
export async function GET(request) {
  try {
    const snapshot = await db.collection('racks').get();
    const racks = [];
    
    snapshot.forEach(doc => {
      racks.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return NextResponse.json({ success: true, data: racks });
  } catch (error) {
    console.error('Error fetching racks:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST new rack
export async function POST(request) {
  try {
    const data = await request.json();
    
    const rackData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('racks').add(rackData);
    
    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...rackData
      }
    });
  } catch (error) {
    console.error('Error adding rack:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update rack
export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required for update' },
        { status: 400 }
      );
    }
    
    const updatedData = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    await db.collection('racks').doc(id).update(updatedData);
    
    return NextResponse.json({
      success: true,
      data: { id, ...updatedData }
    });
  } catch (error) {
    console.error('Error updating rack:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE rack
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required for deletion' },
        { status: 400 }
      );
    }
    
    await db.collection('racks').doc(id).delete();
    
    return NextResponse.json({
      success: true,
      message: 'Rack deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting rack:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
