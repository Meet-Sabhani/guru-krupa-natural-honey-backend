import Order from "../model/orderSchema.js";
import Product from "../model/Product.js";

export const checkout = async (req, res) => {
  try {
    const {
      products,
      shippingAddress,
      paymentStatus = "pending",
      totalAmount,
      grandTotal,
    } = req.body;

    const userId = req?.user?._id;
    console.log("🚀 ~ checkout ~ userId:", userId);

    if (!products || products.length <= 0) {
      return res.json({
        success: false,
        message: "Products are required",
      });
    }

    const orderItems = [];

    for (const item of products) {
      const product = await Product.findById(item?._id);
      if (!product) {
        return res.json({
          success: false,
          message: `Product not found: ${item?._id}`,
        });
      }

      orderItems.push({
        name: product?.name,
        description: product?.description,
        productId: product?._id,
        quantity: item?.quantity || 1,
        price: product?.price,
        images: product?.images || [],
      });
    }

    const order = new Order({
      userId,
      products: orderItems,
      totalAmount,
      grandTotal,
      paymentStatus,
      deliveryStatus: "pending",
      shippingAddress,
    });

    await order.save();
    res.json({
      success: true,
      message: "Order placed successfully",
    });
  } catch (error) {
    console.error("Checkout Error:", error);
    res.json({
      success: false,
      message: error?.message,
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
