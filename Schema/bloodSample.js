import { Schema, model } from "mongoose";

export const bloodSampleSchema = new Schema({
    hospitalId: {
        type: Schema.Types.ObjectId,
        ref: 'hospital'
    },
    bloodType: {
        type: String,
        required: true,
    },
    hospitalName: {
        type: String,
        required: [true, 'No Name Provided'],
    }
})

export const bloodSample = model('BloodSample', bloodSampleSchema);