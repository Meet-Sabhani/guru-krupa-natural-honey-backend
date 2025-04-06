import { createRazorpayInstance } from "../config/razorpay.js";
import crypto from "crypto";
import Order from "../model/orderSchema.js";

const razorpayInstance = createRazorpayInstance();

// export const createOrder = async (req, res) => {
//   try {
//     const { productId, price } = req.body;

//     if (!price) {
//       return res.json({
//         success: false,
//         message: "Price is required",
//       });
//     }

//     const options = {
//       amount: price * 100, // Razorpay expects amount in paise
//       currency: "INR",
//       receipt: `receipt_order_${Date.now()}`,
//     };

//     const order = await razorpayInstance.orders.create(options);

//     return res.json({
//       success: true,
//       message: "Order created successfully",
//       order,
//     });
//   } catch (error) {
//     console.log("🚀 ~ createOrder ~ error:", error);

//     return res.json({
//       success: false,
//       message: error?.message || "Internal Server Error",
//     });
//   }
// };

// export const verifyOrder = async (req, res) => {
//   try {
//     const { orderId, paymentId, signature } = req.body;

//     const secret = process.env.RAZORPAY_KEY_SECRET;

//     const hmac = crypto.createHmac("sha256", secret);
//     hmac.update(orderId + "|" + paymentId);

//     const generatedSignature = hmac.digest("hex");

//     if (generatedSignature === signature) {
//       // ✅ Find the order in DB and update payment status
//       const order = await Order.findOne({ razorpayOrderId: orderId });

//       if (!order) {
//         return res.status(404).json({
//           success: false,
//           message: "Order not found in database",
//         });
//       }

//       order.paymentStatus = "paid";
//       order.razorpayPaymentId = paymentId;
//       order.razorpaySignature = signature;
//       await order.save();

//       return res.json({
//         success: true,
//         message: "Payment Verified and Order Updated",
//       });
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid payment signature",
//       });
//     }
//   } catch (error) {
//     console.error("Error verifying order:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };
