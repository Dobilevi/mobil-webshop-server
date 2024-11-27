import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

const SALT_FACTOR = 10;

export interface IUser extends Document {
    username: string;
    email: string;
    name?: string;
    address?: string;
    password: string;
    admin: boolean;
    comparePassword: (candidatePassword: string, callback: (error: Error | null, isMatch: boolean) => void) => void;
}

const UserSchema: Schema<IUser> = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: false },
    address: { type: String, required: false },
    password: { type: String, required: true },
    admin: { type: Boolean, required: true, default: false },
});

UserSchema.pre<IUser>('save', function(next) {
    const user = this;
    console.log(user);

    bcrypt.genSalt(SALT_FACTOR, (error, salt) => {
        if (error) {
            return next(error);
        }
        bcrypt.hash(user.password, salt, (err, encrypted) => {
            if (err) {
                return next(err);
            }
            user.password = encrypted;
            next();
        });
    });
});

UserSchema.pre<IUser>('updateOne', function(next) {
    const user = this;
    console.log(user);

    if (user.password) {
        bcrypt.genSalt(SALT_FACTOR, (error, salt) => {
            if (error) {
                return next(error);
            }
            bcrypt.hash(user.password, salt, (err, encrypted) => {
                if (err) {
                    return next(err);
                }
                user.password = encrypted;
                next();
            });
        });
    } else {
        next();
    }
});

UserSchema.methods.comparePassword = function(candidatePassword: string, callback: (error: Error | null, isMatch: boolean) => void): void {
    const user = this;
    bcrypt.compare(candidatePassword, user.password, (error, isMatch) => {
        if (error) {
            callback(error, false);
        }
        callback(null, isMatch);
    });
}

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
