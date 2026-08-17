import { JwtPayload, SignOptions } from "jsonwebtoken";
import { Response } from "express";
import { jwtUtils } from "./jwt";
import ms, { StringValue } from "ms";
import { envVars } from "../config/env";
import { cokiesUtils } from "./cookie";

const getAccessToken = (payload: JwtPayload) => {
  const accessToken = jwtUtils.createToken(
    payload,
    envVars.ACCESS_TOKEN_SECRET,
    { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN } as SignOptions,
  );
  return accessToken;
};

const getRefreshToken = (payload: JwtPayload) => {
  const refreshToken = jwtUtils.createToken(
    payload,
    envVars.REFRESH_TOKEN_SECRET,
    { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN } as SignOptions,
  );
  return refreshToken;
};

const setAccesstokenCookie = (res: Response, token: string) => {
  cokiesUtils.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 60 * 24,
  });
};

const setRefreshTokenCookie = (res: Response, token: string) => {
  cokiesUtils.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 60 * 24 * 7, // 7 days
  });
};

const setBetterAuthSessionCookie = (res: Response, token: string) => {
  cokiesUtils.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 60 * 24, // 1 day
  });
};

export const tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccesstokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie,
};
