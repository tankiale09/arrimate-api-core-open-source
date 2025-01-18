import * as jose from 'jose'
import userSchema from '../models/userModel.js';
async function primaryJwtService(id, SECRET_KEY_JWT){
    try {
      const secret = SECRET_KEY_JWT;
      const jwt = await new jose.EncryptJWT({id} ,{ "urn:test:claim": true })
        .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
        .setIssuedAt()
        .setIssuer("urn:backend:issuer")
        .setAudience("urn:frontend:audience")
        .setExpirationTime("2h")
        .encrypt(secret);
      return jwt;
    } catch (error) {
      console.log(error);
      throw new Error("Error creating token");
    }
}
async function secondaryJwtService(email, SECRET_KEY_JWT){
    try {
      const secret = SECRET_KEY_JWT
      const jwt = await new jose.EncryptJWT({email} ,{ "urn:test:claim": true })
        .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
        .setIssuedAt()
        .setIssuer("urn:backend:issuer")
        .setAudience("urn:frontend:audience")
        .setExpirationTime("1 day")
        .encrypt(secret);
      return jwt;
    } catch (error) {
      console.log(error);
      throw new Error("Error creating token");
    }
}
async function jwtService(request, reply) {
  const { id ,  email } = request
  const secret = request.SECRET_KEY_JWT;
  try {
    let [jwtPrimary, jwtSecondary] = await Promise.all([primaryJwtService(id, secret), secondaryJwtService(email, secret)]);
    request.jwtPrimary = jwtPrimary;
    request.jwtSecondary = jwtSecondary;
  } catch (error) {
    console.error(error);
    reply.status(500).send({msg: "Error creating token"});
  }
}
async function newPrimaryJwtService(request, reply) {
    const {SECRET_KEY_JWT} = request.getEnvs();
    const cookie = request.cookies.jwt;
    if (!cookie) {
      reply.status(401).send({msg: "No se ha proporcionado un token"});
      return;
    }
    const cookieData = request.unsignCookie(cookie);
    if (!cookieData) {
      reply.status(401).send({msg: "No se ha proporcionado un token"});
      return;
    }
    try {
      const email = await jose.jwtDecrypt(cookieData.value, jose.base64url.decode(SECRET_KEY_JWT));
      const user = await userSchema.findOne({email: email.payload.email});
      if (!user) {
        reply.status(401).send({msg: "Token inválido"});
        return;
      }
      const token = await new jose
      .EncryptJWT({ id: user._id }, { "urn:test:claim": true })
      .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
      .setIssuedAt()
      .setIssuer("urn:backend:issuer")
      .setAudience("urn:frontend:audience")
      .setExpirationTime("2h")
      .encrypt(jose.base64url.decode(SECRET_KEY_JWT));
      request.jwtPrimary = token;
    } catch (error) {
      console.error(error);
      reply.status(401).send({msg: "Token inválido"});
      return;
    }    
}
export {
    jwtService,
    newPrimaryJwtService
};
