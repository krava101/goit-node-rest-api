import { userLoginSchema, userRegisterSchema } from '../schemas/usersSchemas.js';
import * as fs from 'node:fs/promises';
import gravatar from 'gravatar';
import bcrypt from 'bcrypt';
import path from 'node:path';
import User from '../models/user.js'
import Jimp from "jimp";
import jwt from 'jsonwebtoken';

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
    const avatar = gravatar.url(email);
    const response = await User.create({ name, password: passwordHash, email, avatar });
    
    res.status(201).send({ user: { name: name, email: email, subscription: 'starter', avatarURL: avatar } });
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

    res.status(201).send({ token , user: { email, subscription: user.subscription, avatar: user.avatar } });
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
    return res.status(200).send({ email: user.email, subscription: user.subscription, avatarURL: user.avatar });
  } catch (err) {
    next(err);
  }
}

const uploadAvatar = async (req, res, next) => {
  try {
    Jimp.read(req.file.path, (err, img) => {
      if (err) {
        next(err);
      }
      img
        .resize(250, 250)
        .write(path.resolve("public/avatars", req.file.filename))
    });

    await fs.rename(req.file.path, path.resolve("public/avatars", req.file.filename));

    const avatar = `${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
      { new: true }
    );

    if (user === null) {
      return res.status(401).send({ message: 'Not authorized' });
    }
    res.status(200).send({ avatarURL: avatar });
  } catch (err) {
    next(err);
  }
}

export default { register, login, logout, current, uploadAvatar }