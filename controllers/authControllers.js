import { userLoginSchema, userRegisterSchema } from '../schemas/usersSchemas.js';
import User from '../models/user.js'
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const register = async (req, res, next) => {
  const userValidate = userRegisterSchema.validate(req.body);
  const { name, password, email } = req.body;
  if (userValidate.error) {
    return res.status(400).send({message: userValidate.error.details[0].message });
  }
  try {
    const user = await User.findOne({ email });
    if (user !== null) { 
      return res.status(409).send({ message: "User already registrered" });
    }
    
    const passwordHash = await bcrypt.hash(password, 10)
    const response = await User.create({ name, password: passwordHash, email });
    
    res.status(201).send({ user: { email: email, subscription: 'starter' } });
  } catch (err){
    next(err);
  }
};

const login = async (req, res, next) => {
  const userValidate = userLoginSchema.validate(req.body);
  const { email, password } = req.body;
  if (userValidate.error) {
    return res.status(400).send({message: userValidate.error.details[0].message });
  }
  try {
    const user = await User.findOne({ email });
    
    if (user === null) {
      return res.status(401).send({ message: "Email or password is incorrect!" });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch === false) {
      return res.status(401).send({ message: "Email or password is incorrect!" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: 3600 });

    await User.findByIdAndUpdate(user._id, { token }, { new: true });

    res.status(201).send({ token , user: { email, subscription: user.subscription} });
  } catch (err) {
    next(err);
  }
}

const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { token: null });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

const current = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    return res.status(200).send({ email: user.email, subscription: user.subscription });
  } catch (err) {
    next(err);
  }
}

export default { register, login, logout, current }