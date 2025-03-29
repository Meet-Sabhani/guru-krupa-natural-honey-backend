import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../model/userModel.js";
import transporter from "../config/nodemailer.js";

const adminLoginCredentials = {
  email: "admin@mailinator.com",
  password: "Admin@123",
  id: 1,
  role: "admin",
};

const generateToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    if (!name || !email || !password || !phoneNumber) {
      return res.json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Normalize email (trim whitespace, convert to lowercase)
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await userModel.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      name,
      email: normalizedEmail,
      password: hashPassword,
      phoneNumber,
    });

    const savedUser = await newUser.save();
    if (!savedUser) {
      return res.json({
        success: false,
        message: "Failed to Register",
      });
    }

    const token = generateToken(savedUser.toObject()); // Ensure plain object

    // Sending mail
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Meets Web",
      text: `Welcome to Meets Web. Your account has been created with this email: ${email}`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      token,
      data: savedUser.toObject(), // Ensure plain object response
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Missing required fields",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userModel.findOne({ email: normalizedEmail });

    if (!user) {
      return res.json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Incorrect password",
      });
    }

    const token = generateToken(user.toObject()); // ✅ Convert to plain object

    return res.json({
      success: true,
      token,
      data: user.toObject(), // ✅ Convert to plain object before sending response
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from request params

    if (!userId) {
      return res.json({
        success: false,
        message: "userId is required",
      });
    }

    const user = await userModel.findById(userId).lean(); // Use lean() for optimization

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  return res.json({
    success: true,
    message: "Logged out successfully",
  });
};

export const getUsers = async (req, res) => {
  try {
    const { search = "", pageSize = 10, page = 1 } = req.body;

    const isNumericSearch = !isNaN(search) && search.trim() !== "";

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } }, // Case-insensitive search for name
            { email: { $regex: search, $options: "i" } }, // Case-insensitive search for email
            ...(isNumericSearch ? [{ phoneNumber: Number(search) }] : []), // Exact match for phone number
          ],
        }
      : {};

    const users = await userModel
      .find(query, "-password")
      .skip((Number(page) - 1) * Number(pageSize))
      .limit(Number(pageSize));

    const totalUsers = await userModel.countDocuments(query);

    return res.json({
      success: true,
      data: users,
      pagination: {
        total: totalUsers,
        page: Number(page),
        hasMore: Number(page) * Number(pageSize) < totalUsers,
        pageSize: Number(pageSize),
      },
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (
    email !== adminLoginCredentials.email ||
    password !== adminLoginCredentials.password
  ) {
    return res.json({ success: false, message: "Invalid admin credentials" });
  }

  try {
    const token = generateToken(adminLoginCredentials);
    return res.json({
      success: true,
      token,
      data: adminLoginCredentials,
      message: "Admin logged in successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
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
      from: process.env.SENDER_EMAIL,
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

  if (!userId || !otp) {
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
