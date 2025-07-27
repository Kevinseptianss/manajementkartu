import { db } from '../../../../lib/firebase';
import { NextResponse } from 'next/server';

// GET all SIM cards
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const box = searchParams.get('box');
    
    let query = db.collection('simcards');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (box) {
      query = query.where('box', '==', box);
    }
    
    const snapshot = await query.get();
    const simCards = [];
    
    snapshot.forEach(doc => {
      simCards.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return NextResponse.json({ success: true, data: simCards });
  } catch (error) {
    console.error('Error fetching SIM cards:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST new SIM card
export async function POST(request) {
  try {
    const data = await request.json();
    
    // Add timestamp
    const simCardData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('simcards').add(simCardData);
    
    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...simCardData
      }
    });
  } catch (error) {
    console.error('Error adding SIM card:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update SIM card
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
    
    await db.collection('simcards').doc(id).update(updatedData);
    
    return NextResponse.json({
      success: true,
      data: { id, ...updatedData }
    });
  } catch (error) {
    console.error('Error updating SIM card:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE SIM card
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
    
    await db.collection('simcards').doc(id).delete();
    
    return NextResponse.json({
      success: true,
      message: 'SIM card deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting SIM card:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
