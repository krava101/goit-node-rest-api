import Joi from "joi";

export const userRegisterSchema = Joi.object({
  name: Joi.string(),
  password: Joi.string().min(8).max(30).required(),
  email: Joi.string().email().required()
})

export const userLoginSchema = Joi.object({
  password: Joi.string().min(8).max(30).required(),
  email: Joi.string().email().required()
})

export const userEmailSchema = Joi.object({
  email:Joi.string().email().required()
})