import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

// MongoDB Schema Setup
const MemorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  mediaUrl: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const Memory = mongoose.models.Memory || mongoose.model('Memory', MemorySchema);

// 1. Get all memories from MongoDB
export async function GET() {
  try {
    await connectToDatabase();
    const memories = await Memory.find().sort({ date: -1 });
    return Response.json({ success: true, data: memories });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. Save a new memory to MongoDB
export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const newMemory = await Memory.create(body);
    return Response.json({ success: true, data: newMemory }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
