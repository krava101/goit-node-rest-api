import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Set name for contact!'],
  },
  email: {
    type: String,
    required: [true, 'Set email for contact!'],
  },
  phone: {
    type: String,
    required: [true, 'Set phone number for contact!'],
  },
  favorite: {
    type: Boolean,
    default: false,
  },
}, { versionKey: false, timestamps: false });
  
export default mongoose.model("Contact", contactSchema);