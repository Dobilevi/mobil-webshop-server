import mongoose, { Document, Model, Schema } from 'mongoose';

interface IMobile extends Document {
    name: string,
    modelName: string,
    company: string,
    picture: string,
    price: number
    stock: number;
}

const MobileSchema: Schema<IMobile> = new mongoose.Schema({
    name: { type: String, required: true },
    modelName: { type: String, required: true, unique: true },
    company: { type: String, required: true },
    picture: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true }
});

export const Mobile: Model<IMobile> = mongoose.model<IMobile>('Mobile', MobileSchema);
