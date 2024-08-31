import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';

const userSchema = Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true, 
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
)

userSchema.pre("Save", async function (next) {
    if(!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password, 12)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}
export const User = mongoose.model('User', userSchema);