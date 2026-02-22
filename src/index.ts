import { app } from "./app";
import dotenv from "dotenv";
import { getPgVersion } from "./db";

dotenv.config()

const port = process.env["PORT"] || 4000;

getPgVersion()
    .then(() => {
        app.listen(port, () => {
            console.log(`server is running on port http://localhost:${port}`)
        })
    })
    .catch((err: any) => {
        console.log("failed to connect with server", err)
    })
