import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../model/userModel.js";
import transporter from "../config/nodemailer.js";

const adminLoginCredentials = {
  email: "admin@mailinator.com",
  password: "Admin@123",
  id: 1,
};

const generateToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const register = async (req, res) => {
  const { name, email, password, phoneNumber } = req.body;

  if (!name || !email || !password || !phoneNumber) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      name,
      email,
      password: hashPassword,
      phoneNumber,
    });
    const savedUser = await newUser.save();

    if (!savedUser) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to create user" });
    }

    const token = generateToken(savedUser);

    // Sending mail
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Meets Web",
      text: `Welcome to Meets Web. Your account has been created with this email: ${email}`,
    };

    await transporter.sendMail(mailOptions);

    return res
      .status(201)
      .json({ success: true, token, data: savedUser.toObject() });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password" });
    }

    const token = generateToken(user);

    return res.json({ success: true, token, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  return res.json({
    success: true,
    message: "Logged out successfully",
  });
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (
    email !== adminLoginCredentials.email ||
    password !== adminLoginCredentials.password
  ) {
    return res
      .status(402)
      .json({ success: false, message: "Invalid admin credentials" });
  }

  try {
    const token = generateToken(adminLoginCredentials);
    return res.json({
      success: true,
      token,
      message: "Admin logged in successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Send Verification OTP to user Email

export const sendVerifyOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);
    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: "Account already Verified",
      });
    }

    const OTP = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = OTP;
    user.verifyOtpExpireAT = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMail,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your OTP is ${OTP}. Verify your account using this OTP.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Verification OTP Sent on Email",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || otp) {
    return res.json({
      success: false,
      message: "Missing Details",
    });
  }

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.verifyOtpExpireAT < Date.now()) {
      return res.json({
        success: false,
        message: "OTP Expired",
      });
    }

    user.isAccountVerified = true;
    user.verifyOtpExpireAT = 0;

    await user.save();

    return res.json({
      success: true,
      message: "OPT Verified Successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
