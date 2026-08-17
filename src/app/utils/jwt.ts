import jwt, { Jwt, JwtPayload, SignOptions } from "jsonwebtoken";

const createToken = (
  payload: JwtPayload,
  secret: string,
  { expiresIn }: SignOptions,
) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};

const verifyToken = (token: string, secret: string) => {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return {
      success: true,
      data: decoded,
    };
  } catch (error) {
    return {
      success: false,
      message: "Invalid token",
      error,
    };
  }
};

const decodeToken = (token: string) => {
  return jwt.decode(token) as JwtPayload;
};

export const jwtUtils = {
  createToken,
  verifyToken,
  decodeToken,
};
