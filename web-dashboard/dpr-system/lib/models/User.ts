import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    deviceId: string;
    password: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    deviceId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: false,
        unique: true,
        lowercase: true,
        trim: true,
    }
}, {
    timestamps: true,
});

// Prevent recompilation during development
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
