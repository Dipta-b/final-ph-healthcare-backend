import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Role, UserStatus } from "../../generated/prisma/browser";
import { bearer, emailOTP } from "better-auth/plugins";
import { sendEmail } from "../utils/email";

import { envVars } from "../config/env";
// If your Prisma file is located elsewhere, you can change the path

export const auth = betterAuth({
  baseURL: envVars.BETTER_AUTH_URL,
  secret: envVars.BETTER_AUTH_SECRET,

  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,

      mapProfileToUser() {
        return {
          role: Role.PATIENT,
          status: UserStatus.ACTIVE,
          needPasswordChange: false,
          isDeleted: false,
          deletedAt: null,
          emailVerified: true,
        };
      },
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.PATIENT,
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE,
      },
      needPasswordChange: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null,
      },
    },
  },
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });


          if (!user) {
            console.error(`User with email ${email} not found. Cannot send verification OTP.`);
            return;
          }

          if (user && user.role === Role.SUPER_ADMIN) {
            console.log(`User with email ${email} is a super admin. Skipping sending verification OTP.`);
            return;
          }
          if (user && !user.emailVerified) {
            sendEmail({
              to: email,
              subject: "Verification required,verify email",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp,
              },
            });
          }
        } else if (type === "forget-password") {
          const user = await prisma.user.findUnique({ where: { email } });
          if (user) {
            sendEmail({
              to: email,
              subject: "Password Reset OTP",
              templateName: "otp",
              templateData: { otp, name: user.name },
            });
          }
        }
      },
      expiresIn: 5 * 60,
      otpLength: 6,
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 60 * 24, // 1 day in seconds (or you can use ms package to convert)
    updateAge: 60 * 60 * 60 * 24, // 1 day in seconds (or you can use ms package to convert)
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24, // 1 day in seconds (or you can use ms package to convert)
    },
  },
  redirectURLs: {
    signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`,
  },

  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:5000",
    envVars.FRONTENDURL,
  ],
  advanced: {
    useSecureCookies: false,
    cookies: {
      // On HTTP localhost, cookies MUST be sameSite: "lax" and secure: false
      // otherwise the browser won't store the OAuth state cookie → state mismatch error
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/",
        },
      },
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/",
        },
      },
    },
  },
});
