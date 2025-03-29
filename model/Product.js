import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    images: [{ type: String, required: true }],
    features: [{ type: String, required: true }],
    stock: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    category: { type: String, required: true },
    additionalInformation: {
      ProductSpecifications: [
        {
          label: String,
          value: String,
        },
      ],
      NutritionalInformation: [
        {
          label: String,
          value: String,
        },
      ],
    },
    descriptionInputBoxs: [{ type: String, required: false }],
    descriptionSuggestUses: [{ type: String, required: false }],
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
