import { createRazorpayInstance } from "../config/razorpay.js";
import Order from "../model/orderSchema.js";
import Product from "../model/Product.js";
import crypto from "crypto";

const razorpayInstance = createRazorpayInstance();

export const checkout = async (req, res) => {
  try {
    const { products, shippingAddress, paymentStatus = "pending" } = req.body;

    const userId = req?.user?._id;
    console.log("🚀 ~ checkout ~ userId:", userId);

    if (!products || products.length <= 0) {
      return res.json({
        success: false,
        message: "Products are required",
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of products) {
      const product = await Product.findById(item?._id);
      if (!product) {
        return res.json({
          success: false,
          message: `Product not found: ${item?._id}`,
        });
      }

      if (!product.status) {
        return res.json({
          success: false,
          message: `Product out of stock: ${product?.name}`,
        });
      }

      const quantity = item?.quantity || 1;
      const itemTotal = product.price * quantity;

      totalAmount += itemTotal;

      orderItems.push({
        name: product.name,
        description: product.description,
        productId: product._id,
        quantity,
        price: product.price,
        images: product.images || [],
      });
    }

    // You can apply tax or shipping fees here
    const shippingFee = 0; // Example
    const grandTotal = totalAmount + shippingFee;

    const options = {
      amount: grandTotal * 100, // in paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const orderPaymentInstance = await razorpayInstance.orders.create(options);

    const order = new Order({
      userId,
      products: orderItems,
      totalAmount,
      grandTotal,
      paymentStatus,
      deliveryStatus: "pending",
      shippingAddress,
      razorpayOrderId: orderPaymentInstance.id,
    });

    await order.save();

    return res.json({
      success: true,
      message: "Order placed successfully",
      order: orderPaymentInstance,
    });
  } catch (error) {
    console.error("Checkout Error:", error);
    return res.json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const verifyOrder = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET;

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(orderId + "|" + paymentId);

    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === signature) {
      // ✅ Find the order in DB and update payment status
      const order = await Order.findOne({ razorpayOrderId: orderId });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found in database",
        });
      }

      order.paymentStatus = "paid";
      order.razorpayPaymentId = paymentId;
      order.razorpaySignature = signature;
      await order.save();

      return res.json({
        success: true,
        message: "Payment Verified and Order Updated",
        order,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }
  } catch (error) {
    console.error("Error verifying order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get Order History (Admin sees all, User sees their own)
export const getOrderHistory = async (req, res) => {
  try {
    const { pageSize = 10, page = 1, search = "" } = req.body;
    const isAdmin = req?.user?.role === "admin";
    const userId = req?.user?._id;

    if (!userId) {
      return res.json({
        success: false,
        message: "User not authenticated",
      });
    }

    let query = isAdmin
      ? search
        ? {
            $or: [
              { "products.name": { $regex: search, $options: "i" } },
              { shippingAddress: { $regex: search, $options: "i" } },
              { paymentStatus: { $regex: search, $options: "i" } },
              { deliveryStatus: { $regex: search, $options: "i" } },
            ],
          }
        : {}
      : { userId }; // Normal user only sees their own orders

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(pageSize))
      .limit(Number(pageSize));

    const totalOrders = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total: totalOrders,
        page: Number(page),
        hasMore: Number(page) * Number(pageSize) < totalOrders,
        pageSize: Number(pageSize),
      },
    });
  } catch (error) {
    res.json({
      success: false,
      message: error?.message,
    });
  }
};
