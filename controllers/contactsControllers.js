import { createContactSchema, updateContactSchema } from "../schemas/contactsSchemas.js";
import * as contactsService from "../services/contactsServices.js";

export const getAllContacts = async (_, res, next) => {
  try {
    const contacts = await contactsService.listContacts();
    res.status(200).send({ results: contacts });
  } catch (err){
    next(err);
  }
};

export const getOneContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await contactsService.getContactById(id);
    contact ? res.status(200).send(contact) : res.status(404).send({ status: 404, message: "Not found" });
  } catch (err) {
    next(err);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await contactsService.removeContact(id);
    contact ? res.status(200).send(contact) : res.status(404).send({ status: 404, message: "Not found" });
  } catch (err) {
    next(err);
  }
};

export const createContact = async (req, res, next) => {
  const contactValidate = createContactSchema.validate(req.body);
  if (contactValidate.error) {
    return res.status(400).send({status: 400, message: contactValidate.error.details[0].message });
  } else {
    try {
      const contact = await contactsService.addContact(req.body);
      res.status(201).send(contact);
    } catch (err) {
      next(err);
    }
  }
};

export const updateContact = async (req, res, next) => {
  const { id } = req.params;
  if (!Object.keys(req.body).length) {
    return res.send({ message: "Body must have at least one field" });
  }
  const contactValidate = updateContactSchema.validate(req.body);
  if (contactValidate.error) {
    return res.status(400).send({status: 400, message: contactValidate.error.details[0].message });
  } else {
    try {
      const contact = await contactsService.updateContact(id, req.body);
      contact ? res.status(200).send(contact) : res.status(404).send({ status: 404, message: "Not found" });
    } catch (err) {
      next(err);
    }
  }
};