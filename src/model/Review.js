"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ReviewSchema = new mongoose_1.default.Schema({
    userEmail: { type: String, required: true },
    modelName: { type: String, required: true },
    score: { type: Number, required: true },
    text: { type: String, required: true }
});
ReviewSchema.index({ userEmail: 1, modelName: 1 }, { unique: true });
exports.Review = mongoose_1.default.model('Review', ReviewSchema);
