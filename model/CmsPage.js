import mongoose from "mongoose";

const cmsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String },
    content: { type: String },
  },
  { timestamps: true }
);

const CmsPage = mongoose.model("CmsPage", cmsSchema);
export default CmsPage;
