import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({}, {})

export const subscriptionModel = mongoose.model("Subscription", subscriptionSchema)