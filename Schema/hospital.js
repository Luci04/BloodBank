import { bloodSampleSchema } from "./bloodSample.js";
import { Schema, model, SchemaType } from "mongoose";

export const hospitalSchema = new Schema({
    name: {
        type: String,
        required: [true, 'No Name Provided'],
    },
    username: {
        type: String,
        required: [true, 'No Username Provided'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'No Password Provided'],
    },
})

export const hospital = model('Hospital', hospitalSchema);