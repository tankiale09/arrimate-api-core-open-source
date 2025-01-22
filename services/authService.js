import userSchema from "../models/userModel.js";
import bcrypt from "bcrypt";
import { secondaryDecryptJwtService } from "./jwtService.js";
async function userRegisterHandler(request, reply) {
    const { name, email, password } = request.body;
    try {
        const userExists = await userSchema.findOne({ email }).lean()
        if (userExists) {
            return reply.status(409).send({msg: "User already exists"});
        }
        const user = new userSchema({ name, email, password });
        await user.save();
        reply.status(201).send({msg: "User created successfully"});
    } catch (error) {
        console.error(error);
        reply.status(500).send({msg: "Error creating user"});
    }
}
async function userLoginHandler(request, reply) {
    let fingerprint = JSON.stringify(request.body.fingerprint);
    
    const jwtPrimary = request.jwtPrimary;
    const jwtSecondary = request.jwtSecondary;
    await reply.setCookie("jwt", jwtSecondary, {
        httpOnly: true,
        maxAge: 86400, 
        secure: true,
        sameSite: true,
        path: "/",
        signed: true,
    }).send({ token: jwtPrimary });
    await request.server.redis.set(request.id , fingerprint, "EX", 7200);
}

async function userPrehandler(request, reply) {
    const { email, password } = request.body;
    let user;
    let valid;
    try {
      user = await userSchema.findOne({ email }).select("_id email password").lean();  
      valid = await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error(error);
      reply.status(500).send({msg: "Server Error"});
    }
    if (!user) {
      reply.status(401).send({msg: "Invalid credentials"});
    }
    if (!valid) {
      reply.status(401).send({msg: "Invalid credentials"});
    }
    request.id = user._id;
    request.email = user.email;
}
async function logoutHandler(request, reply) {
    await reply.clearCookie("jwt").send({ msg: "Logout Successfully" });
    const SECRET_KEY_JWT  = request.SECRET_KEY_JWT
    const cookie = request.cookies.jwt;
    if (!cookie) return;
    const cookieToken = request.unsignCookie(request.cookies.jwt);    
    if (cookieToken.valid != true) return;
    try {
      const email = await secondaryDecryptJwtService(cookieToken.value, SECRET_KEY_JWT);
      const user = await userSchema.findOne({ email });
      if (!user) return;
      const result = await request.server.redis.del(user._id);
      return;
    } catch (error) {
      console.error(error);
      return;
    }
    
}
export {
    userRegisterHandler, 
    userLoginHandler, 
    userPrehandler,
    logoutHandler
};