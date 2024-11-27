"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartItem = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const CartItemSchema = new mongoose_1.default.Schema({
    userEmail: { type: String, required: true },
    modelName: { type: String, required: true },
    quantity: { type: Number, required: true },
});
exports.CartItem = mongoose_1.default.model('CartItem', CartItemSchema);
