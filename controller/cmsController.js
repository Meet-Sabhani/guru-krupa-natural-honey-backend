import CmsPage from "../model/CmsPage.js";
import { generateSlug } from "../utils/slugify.js";

export const createOrUpdateCMS = async (req, res) => {
  try {
    const { _id, title, description, content } = req.body;

    if (_id) {
      const existingCms = await CmsPage.findById(_id);
      if (!existingCms) {
        return res
          .status(404)
          .json({ success: false, message: "CMS page not found" });
      }

      // Update without changing the slug
      existingCms.title = title;
      existingCms.description = description;
      existingCms.content = content;

      const updatedCms = await existingCms.save();
      return res.status(200).json({ success: true, data: updatedCms });
    } else {
      // Create logic
      const slug = generateSlug(title);

      // Check if slug already exists
      const existingSlug = await CmsPage.findOne({ slug });
      if (existingSlug) {
        return res.status(400).json({
          success: false,
          message: "Slug already exists. Choose a different title.",
        });
      }

      const newCms = new CmsPage({ title, description, content, slug });
      await newCms.save();
      return res.status(201).json({ success: true, data: newCms });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get CMS by Slug
export const getCmsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const cms = await CmsPage.findOne({ slug });
    if (!cms)
      return res
        .status(404)
        .json({ success: false, message: "CMS page not found" });
    res.status(200).json({ success: true, data: cms });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all CMS pages
export const getAllCMSPages = async (req, res) => {
  try {
    const cmsPages = await CmsPage.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: cmsPages });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch CMS pages" });
  }
};

// Delete CMS by ID
export const deleteCmsById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCms = await CmsPage.findByIdAndDelete(id);
    if (!deletedCms) {
      return res
        .status(404)
        .json({ success: false, message: "CMS page not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "CMS page deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
