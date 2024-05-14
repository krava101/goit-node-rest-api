import { createContactSchema, updateContactSchema, updateStatusContactSchema } from "../schemas/contactsSchemas.js";
import { isValidObjectId } from "mongoose";
import Contact from "../models/contact.js";

const getAllContacts = async (_, res, next) => {
  try {
    const contacts = await Contact.find();
    res.status(200).send(contacts);
  } catch (err){
    next(err);
  }
};

const getOneContact = async (req, res, next) => {
  const { id } = req.params;
  const valId = isValidObjectId(id);
  if (!valId) {
    return res.status(400).send({ message: "Not found" });
  } else {
    try {
      const contact = await Contact.findById(id);
      contact ? res.status(200).send(contact) : res.status(404).send({ message: "Not found" });
    } catch (err) {
      next(err);
    }
  }
};

const deleteContact = async (req, res, next) => {
  const { id } = req.params;
  const valId = isValidObjectId(id);
  if (!valId) {
    return res.status(400).send({ message: "Not found" });
  } else {
    try {
      const contact = await Contact.findByIdAndDelete(id);
      contact ? res.status(200).send(contact) : res.status(404).send({message: "Not found" });
    } catch (err) {
      next(err);
    }
  }
};

const createContact = async (req, res, next) => {
  const contactValidate = createContactSchema.validate(req.body);
  if (contactValidate.error) {
    return res.status(400).send({message: contactValidate.error.details[0].message });
  } else {
    try {
      const contact = await Contact.create(req.body);
      res.status(201).send(contact);
    } catch (err) {
      next(err);
    }
  }
};

const updateContact = async (req, res, next) => {
  const { id } = req.params;
  const valId = isValidObjectId(id);
  const contactValidate = updateContactSchema.validate(req.body);
  if (!valId) {
    return res.status(400).send({ message: "Not found" });
  }
  if (!Object.keys(req.body).length) {
    return res.send({ message: "Body must have at least one field" });
  }
  if (contactValidate.error) {
    return res.status(400).send({ message: contactValidate.error.details[0].message });
  } else {
    try {
      const contact = await Contact.findByIdAndUpdate(id, req.body, {new: true});
      contact ? res.status(200).send(contact) : res.status(404).send({message: "Not found" });
    } catch (err) {
      next(err);
    }
  }
};

const updateStatusContact = async (req, res, next) => {
  const { id } = req.params;
  const valId = isValidObjectId(id);
  const validateFavorite = updateStatusContactSchema.validate(req.body);
  if (!valId) {
    return res.status(400).send({ message: "Not found" });
  }
  if (validateFavorite.error) {
    return res.status(400).send({ message: validateFavorite.error.details[0].message });
  } else {
    try {
      const contact = await Contact.findByIdAndUpdate(id, req.body, {new: true});
      contact ? res.status(200).send(contact) : res.status(404).send({message: "Not found" });
    } catch (err) {
      next(err);
    }
  }
};

export default {
  updateContact,
  createContact,
  deleteContact,
  getOneContact,
  getAllContacts,
  updateStatusContact,
}