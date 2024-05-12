import express from "express";
import ContactsController from "../controllers/contactsControllers.js";

const contactsRouter = express.Router();

contactsRouter.get("/", ContactsController.getAllContacts);

contactsRouter.get("/:id", ContactsController.getOneContact);

contactsRouter.delete("/:id", ContactsController.deleteContact);

contactsRouter.post("/", ContactsController.createContact);

contactsRouter.put("/:id", ContactsController.updateContact);

contactsRouter.patch("/:id/favorite", ContactsController.updateStatusContact);

export default contactsRouter;