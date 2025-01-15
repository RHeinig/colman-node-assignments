import { createApp } from "./app";

const { PORT, DATABASE_URL } = process.env;

createApp({ mongoUri: DATABASE_URL })
  .then((app) => {
    app.listen(Number(PORT) || 3000, () => {
      console.log(`Server is running on port ${PORT || 3000}`);
    });
  })
  .catch((error) => console.error(error));
