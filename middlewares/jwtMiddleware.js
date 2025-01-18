import * as jose from "jose";

async function verifyJWT(request, reply){
    const {SECRET_KEY_JWT} = request.getEnvs();
    const token = request.headers.authorization?.replace('Bearer ', '');
    if(!token) return reply.status(401).send({message: 'Token no válido'});
    try {
        const secret = jose.base64url.decode(SECRET_KEY_JWT);
        const jwt = await jose.jwtDecrypt(token, secret);
        request.id = jwt.payload.id;
    } catch (error) {
        console.error(error);
        return reply.status(500).send("Error verifying token");
    }

}

export {verifyJWT};