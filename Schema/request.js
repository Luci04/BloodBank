import { Schema, model } from "mongoose";

export const requestSchema = new Schema({
    receiverId: {
        type: Schema.Types.ObjectId,
        ref: 'Receiver'
    },
    bloodType: {
        type: String,
        required: true,
    },
    hospitalId: {
        type: Schema.Types.ObjectId,
        ref: 'Hospital'
    }
})

export const request = model('Request', requestSchema);