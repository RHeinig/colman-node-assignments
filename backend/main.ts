// Rotem Heinig 322401233
// Amit Edrei 211745385

import { createApp } from "./app";
import cors from "cors";
import { readFileSync } from "fs";
import https from 'https';
import path from "path";
import express from "express";

const { PORT, DATABASE_URL, HTTPS_PORT } = process.env;

createApp({ mongoUri: DATABASE_URL })
  .then((app) => {
    app.use(
      cors({
        origin: "http://localhost:3000",
        credentials: true,
      })
    );

    if (process.env.NODE_ENV === "production") {
      const buildPath = path.join(__dirname, "build");
      app.use(express.static(buildPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(buildPath, "index.html"));
      });
    }

    app.listen(Number(PORT) || 3000, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT || 3000}`);
    });

    if (process.env.NODE_ENV === "production") {
      const server = https.createServer(
        {
          key: readFileSync(path.join(__dirname, "client-key.pem")),
          cert: readFileSync(path.join(__dirname, "client-cert.pem")),
        },
        app
      );
      server.listen(Number(HTTPS_PORT) || 3000, "0.0.0.0", () => {
        console.log(`Server is running on HTTPS port ${HTTPS_PORT || 3000}`);
      });
    }
  })
  .catch((error) => console.error(error));
