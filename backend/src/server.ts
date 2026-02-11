import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.listen(port, "0.0.0.0", () => {
  console.log(`CALEBel API listening on http://0.0.0.0:${port}`);
  console.log(`CALEBel API accessible at http://localhost:${port}`);
});
