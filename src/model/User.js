"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const SALT_FACTOR = 10;
const UserSchema = new mongoose_1.default.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: false },
    address: { type: String, required: false },
    password: { type: String, required: true },
    admin: { type: Boolean, required: true, default: false },
});
UserSchema.pre('save', function (next) {
    const user = this;
    console.log(user);
    bcrypt_1.default.genSalt(SALT_FACTOR, (error, salt) => {
        if (error) {
            return next(error);
        }
        bcrypt_1.default.hash(user.password, salt, (err, encrypted) => {
            if (err) {
                return next(err);
            }
            user.password = encrypted;
            next();
        });
    });
});
UserSchema.pre('updateOne', function (next) {
    const user = this;
    console.log(user);
    if (user.password) {
        bcrypt_1.default.genSalt(SALT_FACTOR, (error, salt) => {
            if (error) {
                return next(error);
            }
            bcrypt_1.default.hash(user.password, salt, (err, encrypted) => {
                if (err) {
                    return next(err);
                }
                user.password = encrypted;
                next();
            });
        });
    }
    else {
        next();
    }
});
UserSchema.methods.comparePassword = function (candidatePassword, callback) {
    const user = this;
    bcrypt_1.default.compare(candidatePassword, user.password, (error, isMatch) => {
        if (error) {
            callback(error, false);
        }
        callback(null, isMatch);
    });
};
exports.User = mongoose_1.default.model('User', UserSchema);
