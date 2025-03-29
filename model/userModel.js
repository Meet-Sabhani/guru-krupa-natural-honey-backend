import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: Number, required: true },
  verifyOtp: { type: String, default: "" },
  verifyOtpExpireAT: { type: Number, default: 0 },
  isAccountVerified: { type: Boolean, default: false },
  resetOtp: { type: String, default: "" },
  resetOtpExpireAT: { type: Number, default: 0 },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
