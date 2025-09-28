import mongoose, { Document, Schema } from 'mongoose';

export interface IDrivingRecord extends Document {
    userId: mongoose.Types.ObjectId;
    date: string;
    time: string;
    speed: number;
    acceleration: number;
    createdAt: Date;
    updatedAt: Date;
}

const DrivingRecordSchema = new Schema<IDrivingRecord>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    speed: {
        type: Number,
        required: true,
        min: 0,
    },
    acceleration: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});

// Index for efficient querying by user and date
DrivingRecordSchema.index({ userId: 1, date: -1 });

// Prevent recompilation during development
const DrivingRecord = mongoose.models.DrivingRecord || mongoose.model<IDrivingRecord>('DrivingRecord', DrivingRecordSchema);

export default DrivingRecord;
