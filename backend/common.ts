import { randomBytes } from "crypto";

const generateRandomString = (length: number): string =>
  randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);

export { generateRandomString };
