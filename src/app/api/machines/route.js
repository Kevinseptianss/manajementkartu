import { db } from '../../../../lib/firebase';
import { NextResponse } from 'next/server';

// GET all machines
export async function GET(request) {
  try {
    const snapshot = await db.collection('machines').get();
    const machines = [];
    
    snapshot.forEach(doc => {
      machines.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return NextResponse.json({ success: true, data: machines });
  } catch (error) {
    console.error('Error fetching machines:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST new machine
export async function POST(request) {
  try {
    const data = await request.json();
    
    // Initialize ports array based on jumlahPort
    const ports = Array.from({ length: parseInt(data.jumlahPort) }, (_, i) => ({
      id: i + 1,
      portNumber: i + 1,
      status: 'kosong',
      boxKecil: '',
      perdanaNomor: '',
      worker: '',
      pendapatan: 0
    }));
    
    const machineData = {
      ...data,
      ports,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('machines').add(machineData);
    
    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...machineData
      }
    });
  } catch (error) {
    console.error('Error adding machine:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update machine
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
    
    await db.collection('machines').doc(id).update(updatedData);
    
    return NextResponse.json({
      success: true,
      data: { id, ...updatedData }
    });
  } catch (error) {
    console.error('Error updating machine:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE machine
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
    
    await db.collection('machines').doc(id).delete();
    
    return NextResponse.json({
      success: true,
      message: 'Machine deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting machine:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
