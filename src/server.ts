import express, { Application, Request, Response } from "express";
import app from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seed";
import { Server } from "node:http";


let server: Server;

const bootstrap = async () => {
  try {
    await seedSuperAdmin()
    server = app.listen(envVars.PORT, () => {
      console.log(`Server running at http://localhost:${envVars.PORT}`);
    });
  } catch (error) {
    console.log("error", error);
  }
};


//signal handler

process.on("SIGTERM", () => {
  console.log("SIGTERM received");
  if (server) {
    server.close(() => {
      console.log("Server closed");
    })
  }
  process.exit(1);
})

//uncaught exception handler

process.on("uncaughtException", error => {
  console.log(error);
  if (server) {
    server.close(() => {
      process.exit(1);
    })
  }

  process.exit(1)
})

//unchanged rejection handler

process.on("unhandledRejection", error => {
  console.log(error);
  if (server) {
    server.close(() => {
      process.exit(1);
    })
  }
})



bootstrap();
