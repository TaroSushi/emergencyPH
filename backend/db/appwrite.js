import {Client, Databases} from "node-appwrite";
import dotenv from "dotenv";

dotenv.config();

const ENDPOINT = process.env.ENDPOINT;
const PROJECT_ID = process.env.PROJECT_ID;
const API_KEY = process.env.API_KEY;
export const DATABASE_ID = process.env.DATABASE_ID;
export const CALL_COLLECTION_ID = process.env.CALL_COLLECTION_ID;
export const CONTACT_COLLECTION_ID = process.env.CONTACT_COLLECTION_ID;


export const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

export const databases = new Databases(client);
