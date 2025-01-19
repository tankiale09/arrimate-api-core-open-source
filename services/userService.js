import userSchema from "../models/userModel.js";
import bcrypt from "bcrypt";
async function userRegisterHandler(request, reply) {
    const { name, email, password } = request.body;
    try {
        const userExists = await userSchema.findOne({ email }).lean()
        if (userExists) {
            return reply.status(409).send("User already exists");
        }
        const user = new userSchema({ name, email, password });
        await user.save();
        reply.status(201).send({msg: "User created successfully"});
    } catch (error) {
        console.error(error);
        reply.status(500).send("Error creating user");
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
      reply.status(500).send("Server Error");
    }
    if (!user) {
      reply.status(401).send("Invalid credentials");
    }
    if (!valid) {
      reply.status(401).send("Invalid credentials");
    }
    request.id = user._id;
    request.email = user.email;
}

export {
    userRegisterHandler, 
    userLoginHandler, 
    userPrehandler
};