import Joi from "joi";

export const createContactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(8).max(20).required(),
  favorite: Joi.boolean()
})

export const updateContactSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string().min(8).max(20),
  favorite: Joi.boolean()
})

export const updateStatusContactSchema = Joi.object({
  favorite: Joi.boolean().required()
})
