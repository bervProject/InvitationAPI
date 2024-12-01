import mongoose, { Schema } from "mongoose";

export interface IName {
    username: String;
    name: String;
    createdAt: Date;
}

const nameSchema = new Schema<IName>({
    username: { type: String, required: true, index: true },
    name: { type: String, required: true },
    createdAt: { type: Date, required: true },
});

nameSchema.index({
    username: 1
}, {unique: true})

const Name = mongoose.model<IName>('Name', nameSchema);
export default Name;
export { nameSchema };