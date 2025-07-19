import express from "express";
import {
  createContact,
  getAllContacts,
  updateStatus,
} from "../controller/contactController.js";

const contactRoutes = express.Router();

contactRoutes.post("/contact/create", createContact);
contactRoutes.post("/contact/list", getAllContacts);
contactRoutes.patch("/contact/status/:id", updateStatus);

export default contactRoutes;
