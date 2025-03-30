import Product from "../model/Product.js";

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json({
      success: true,
      message: "Product created successfully",
      newProduct,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.json({ success: false, error: error.errors });
    }
    res.json({ success: false, error: error.message });
  }
};

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const { search = "", pageSize = 10, page = 1 } = req.body;
    const isNumericSearch = !isNaN(search) && search.trim() !== "";

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } }, // Case-insensitive search for name
            { description: { $regex: search, $options: "i" } }, // Case-insensitive search for description
            ...(isNumericSearch ? [{ price: Number(search) }] : []),
          ],
        }
      : {};

    const products = await Product.find(query)
      .skip((Number(page) - 1) * Number(pageSize))
      .limit(Number(pageSize));

    const totalProducts = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        total: totalProducts,
        page: Number(page),
        hasMore: Number(page) * Number(pageSize) < totalProducts,
        pageSize: Number(pageSize),
      },
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

export const getActiveProducts = async (req, res) => {
  try {
    const { search = "", pageSize = 10, page = 1 } = req.body;
    const isNumericSearch = !isNaN(search) && search.trim() !== "";

    const query = {
      status: true, // Fetch only active products
      ...(search
        ? {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { description: { $regex: search, $options: "i" } },
              ...(isNumericSearch ? [{ price: Number(search) }] : []),
            ],
          }
        : {}),
    };

    const products = await Product.find(query)
      .skip((Number(page) - 1) * Number(pageSize))
      .limit(Number(pageSize));

    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total: totalProducts,
        page: Number(page),
        hasMore: Number(page) * Number(pageSize) < totalProducts,
        pageSize: Number(pageSize),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const productStatusChange = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId) {
      return res.json({ success: false, message: "Product ID is required" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    // Toggle status
    product.status = !product.status;
    await product.save();

    res.json({
      success: true,
      message: "Product status updated successfully",
      status: product.status,
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

// Get a single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a product by ID
export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedProduct) {
      return res.json({ success: false, message: "Product not found" });
    }
    res.json({
      success: true,
      message: "Product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    res.json({ error: error.message });
  }
};

// Delete a product by ID
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.json({ message: "Product not found" });
    }
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};
