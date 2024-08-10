import mongoose, { Schema } from "mongoose";

interface IInvitation {
    inviter: String;
    invitee: String;
    message: String;
    createdAt: Date;
}

const invitationSchema = new Schema<IInvitation>({
    inviter: { type: String, required: true, index: true },
    invitee: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, required: true },
});

invitationSchema.index({
    inviter: 1,
    invitee: 1
}, {unique: true})

const Invitation = mongoose.model<IInvitation>('Invitation', invitationSchema);
export default Invitation;