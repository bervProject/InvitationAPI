import mongoose, { Schema, PopulatedDoc, Types, Document } from "mongoose";
import { IName } from "./name";

interface IInvitation {
    inviter: PopulatedDoc<Document<Types.ObjectId> & IName>;
    invitee: PopulatedDoc<Document<Types.ObjectId> & IName>;
    message: String;
    createdAt: Date;
}

const invitationSchema = new Schema<IInvitation>({
    inviter: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'Name' },
    invitee: { type: Schema.Types.ObjectId, required: true, ref: 'Name' },
    message: { type: String, required: true },
    createdAt: { type: Date, required: true }
});

invitationSchema.index({
    inviter: 1,
    invitee: 1
}, { unique: true });

const Invitation = mongoose.model<IInvitation>('Invitation', invitationSchema);
export default Invitation;