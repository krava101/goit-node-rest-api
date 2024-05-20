import express from "express";
import ContactsController from "../controllers/contactsControllers.js";

const contactsRouter = express.Router();
const jsonParser = express.json();

contactsRouter.get("/", ContactsController.getAllContacts);

contactsRouter.get("/:id", ContactsController.getOneContact);

contactsRouter.delete("/:id", ContactsController.deleteContact);

contactsRouter.post("/", jsonParser, ContactsController.createContact);

contactsRouter.put("/:id", jsonParser, ContactsController.updateContact);

contactsRouter.patch("/:id/favorite", jsonParser, ContactsController.updateStatusContact);

export default contactsRouter;