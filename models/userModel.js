import mongoose from "mongoose";
const { Schema, model } = mongoose;
import bcrypt from "bcrypt";
// Define el esquema de la colección 'users
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
},{
    versionKey: false,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    this.password = await bcrypt.hash(this.password, 10);
  } catch (error) {
    throw new Error("Error hashing password");
  }
  
  next();
});

// Exporta el modelo User
export default model('User', userSchema);