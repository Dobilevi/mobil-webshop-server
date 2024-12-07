import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICartItem extends Document {
    userEmail: string,
    modelName: string,
    quantity: number
}

const CartItemSchema: Schema<ICartItem> = new mongoose.Schema({
    userEmail: { type: String, required: true },
    modelName: { type: String, required: true },
    quantity: { type: Number, required: true },
});

export const CartItem: Model<ICartItem> = mongoose.model<ICartItem>('CartItem', CartItemSchema);
