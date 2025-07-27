import { db } from '../../../../../../lib/firebase';
import { NextResponse } from 'next/server';

// PUT update machine port
export async function PUT(request, { params }) {
  try {
    const { machineId } = params;
    const data = await request.json();
    const { portId, ...portData } = data;
    
    // Get the machine document
    const machineDoc = await db.collection('machines').doc(machineId).get();
    
    if (!machineDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Machine not found' },
        { status: 404 }
      );
    }
    
    const machineData = machineDoc.data();
    
    // Update the specific port
    const updatedPorts = machineData.ports.map(port => 
      port.id === portId ? { ...port, ...portData } : port
    );
    
    // Update the machine document
    await db.collection('machines').doc(machineId).update({
      ports: updatedPorts,
      updatedAt: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      data: {
        id: machineId,
        ...machineData,
        ports: updatedPorts
      }
    });
  } catch (error) {
    console.error('Error updating port:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
