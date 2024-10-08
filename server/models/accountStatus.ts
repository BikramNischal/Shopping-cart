import mongoose, { Schema, model } from "mongoose";

export interface IAccountActivity {
	userId: mongoose.Types.ObjectId;
	active: boolean;
	otp: string;
	otpExpireDate: Date;
    accountUnlockDate: Date;
	attempts: number;
}

const accoutAcitivitySchema = new Schema<IAccountActivity>({
	userId: { type: Schema.Types.ObjectId, required: true },
	active: { type: Boolean },
	otp: { type: String },
	otpExpireDate: { type: Date },
    accountUnlockDate: {type: Date},
	attempts: { type: Number, default: 1 },
});

export const AccountActivity = model<IAccountActivity>(
	"AccountActivity",
	accoutAcitivitySchema
);
