import { userEmailSchema, userLoginSchema, userRegisterSchema } from '../schemas/usersSchemas.js';
import * as fs from 'node:fs/promises';
import gravatar from 'gravatar';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import mail from '../mail.js';
import path from 'node:path';
import User from '../models/user.js';
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
    const verificationToken = crypto.randomUUID();
    
    await User.create({ name, password: passwordHash, email, avatar, verificationToken });

    mail.sendMail({
      to: email,
      from: "kravalex2004@gmail.com",
      subject: "Welcome to Phonebook!",
      html: `<h1>To confirm your email please click on the <a href="http://localhost:5050/api/users/verify/${verificationToken}">link</a></h1>`,
      text: `To confirm your email please open the http://localhost:5050/api/users/verify/${verificationToken}`
    })
    
    return res.status(201).send({ user: { name: name, email: email, subscription: 'starter', avatarURL: avatar }, message: `We sent a mail for verification on ${email}` });
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

    if (user.verify === false) {
      return res.status(403).send({ message: "Account is not verified!" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: 3600 });

    await User.findByIdAndUpdate(user._id, { token }, { new: true });

    return res.status(201).send({ token , user: { email, subscription: user.subscription, avatar: user.avatar } });
  } catch (err) {
    next(err);
  }
}

const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { token: null });
    return res.status(204).end();
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
  if (typeof req.file === "undefined") {
    return res.status(400).send({ message: 'File not found' });
  }
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

    const avatar = `/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
      { new: true }
    );

    if (user === null) {
      return res.status(401).send({ message: 'Not authorized' });
    }
    return res.status(200).send({ avatarURL: avatar });
  } catch (err) {
    next(err);
  }
}

const verify = async (req, res, next) => {
  const { verificationToken } = req.params;
  try {
    const user = await User.findOne({ verificationToken });
    if (user === null) {
      return res.status(404).send({ message: "User not found" });
    }
    await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: null });

    return res.status(200).send({ message: 'Verification successful!' });
  } catch (err) {
    next(err);
  }
}

const reverify = async (req, res, next) => {
  const { email } = req.body;
  const validateEmail = userEmailSchema.validate(req.body);
  if (validateEmail.error) {
    return res.status(400).send({ message: `Missing required field email! ${validateEmail.error.details[0].message}` });
  }
  try {
    const user = await User.findOne({ email });
    if (user === null) {
      return res.status(404).send({ message: "User not found" });
    }
    if (user.verify) {
      return res.status(400).send({ message: "Verification has already been passed" });
    }

    const verificationToken = crypto.randomUUID();
    await User.findByIdAndUpdate(user._id, { verificationToken });

    mail.sendMail({
      to: email,
      from: "kravalex2004@gmail.com",
      subject: "Welcome to Phonebook!",
      html: `<h1>To confirm your email please click on the <a href="http://localhost:5050/api/users/verify/${verificationToken}">link</a></h1>`,
      text: `To confirm your email please open the http://localhost:5050/api/users/verify/${verificationToken}`
    })

    return res.status(200).send({ message: `We resent a mail for verification on ${email}` })
  } catch (err) {
    next(err);
  }
}
export default { register, login, logout, current, uploadAvatar, verify, reverify }