// Rotem Heinig 322401233
// Amit Edrei 211745385

import { createApp } from "./app";
import cors from "cors";

const { PORT, DATABASE_URL } = process.env;

createApp({ mongoUri: DATABASE_URL })
  .then((app) => {
    app.use(cors({
      origin: "http://localhost:3000",
      credentials: true,
    }))
    app.listen(Number(PORT) || 3000, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT || 3000}`);
    });
  })
  .catch((error) => console.error(error));
