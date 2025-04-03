import { NextResponse } from 'next/server';
 
import PaymentMethod from '@/models/PaymentMethod';
import connectDB from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const data = await request.json();
    
    const updatedMethod = await PaymentMethod.findByIdAndUpdate(
      params.id,
      { ...data },
      { new: true, runValidators: true }
    );

    if (!updatedMethod) {
      return NextResponse.json({ 
        success: false,
        message: 'Payment method not found'
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      result: updatedMethod
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      message: error.message
    }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const deletedMethod = await PaymentMethod.findByIdAndDelete(params.id);

    if (!deletedMethod) {
      return NextResponse.json({ 
        success: false,
        message: 'Payment method not found'
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Payment method deleted successfully'
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      message: error.message
    }, { status: 500 });
  }
} 