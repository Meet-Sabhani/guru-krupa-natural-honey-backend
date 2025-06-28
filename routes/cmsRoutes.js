import express from "express";
import {
  createOrUpdateCMS,
  deleteCmsById,
  getAllCMSPages,
  getCmsBySlug,
} from "../controller/cmsController.js";

const cmsRoutes = express.Router();

cmsRoutes.post("/cms-create-update", createOrUpdateCMS); // create & update (based on id in body)
cmsRoutes.get("/cms/:slug", getCmsBySlug); // get by slug
cmsRoutes.get("/get-cms", getAllCMSPages);
cmsRoutes.delete("/cms/:id", deleteCmsById);

export default cmsRoutes;
