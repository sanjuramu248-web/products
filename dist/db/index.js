"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPgVersion = getPgVersion;
const dotenv_1 = __importDefault(require("dotenv"));
const serverless_1 = require("@neondatabase/serverless");
dotenv_1.default.config({
    path: './.env',
    debug: true,
});
const { DATABASE_URL } = process.env;
const sql = (0, serverless_1.neon)(DATABASE_URL);
async function getPgVersion() {
    const result = await sql `SELECT version()`;
    console.log("postgres connected", result[0]);
}
