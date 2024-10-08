import { AccountActivity } from "../models/accountStatus";
import mongoose from "mongoose";
import { httpLogger } from "../logger/logger";

export default class AccountActivityController {
	public static async createActivity(
		userId: mongoose.Types.ObjectId | string
	) {
		try {
			const accountActivity = new AccountActivity({
				userId: userId,
				attempts: 1,
				active: true,
			});

			await accountActivity.save();
			return accountActivity;
		} catch (err) {
			console.log((err as Error).message);
		}
	}

	public static async getAccountActivity(
		userId: mongoose.Types.ObjectId | string
	) {
		const accountActivity = await AccountActivity.findOne({
			userId: userId,
		}).exec();

		if (accountActivity) return accountActivity;
	}

	public static async incrementAttempt(
		activityId: mongoose.Types.ObjectId | string
	) {
		const accountActivity = await AccountActivity.findByIdAndUpdate(
			activityId,
			{ $inc: { attempts: 1 } }
		).exec();

		if (accountActivity) await accountActivity.save();
		else console.log(`Account Activity ${activityId} Not Found`);
	}

	public static async lockAccount(
		activityId: mongoose.Types.ObjectId | string
	) {
		const accountActivity = await AccountActivity.findByIdAndUpdate(
			activityId,
			{ active: false, accountUnlockDate: (Date.now() + 24*60*60*1000)}
		).exec();

		if (accountActivity) await accountActivity.save();
		else console.log(`Account Activity ${activityId} Not Fount`);
	}

	public static async getOtp(activityId: mongoose.Types.ObjectId | string) {
		const otp = Math.random().toString(36).substring(2, 7);
		const accountActivity = await AccountActivity.findByIdAndUpdate(
			activityId,
			{ otp: otp }
		).exec();

		if (accountActivity){
            await accountActivity.save();
            return otp;
        }
		else console.log(`Account Activity ${activityId} Not Fount`);
	}

	public static async unlockAccount(
		userId: mongoose.Types.ObjectId | string,
		otp: string
	) {
		const accountActivity = await AccountActivity.findOne({
			userId: userId,
            otp: otp
		}).exec(); 

        if(accountActivity){
            accountActivity.active = true;
            accountActivity.attempts =0;
            await accountActivity.save();
            return true;
        } else return false;
	}

    public static async checkActive(userId: mongoose.Types.ObjectId | string){
        const accountActivity = await AccountActivityController.getAccountActivity(userId);
        if(!accountActivity || accountActivity.active) return true;
        else return false;
    }

    public static async resetAttempts(activityId: mongoose.Types.ObjectId){
        const accountActivity = await AccountActivity.findById(activityId).exec();
        if(accountActivity){
            accountActivity.attempts = 0;
            await accountActivity.save();
        }
    }
}
