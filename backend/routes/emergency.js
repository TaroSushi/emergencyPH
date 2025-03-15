import express from "express";

const emergencyRouter = express.Router();

import {DATABASE_ID,CALL_COLLECTION_ID, CONTACT_COLLECTION_ID, databases} from "../db/appwrite.js";

emergencyRouter.post("/call", async (req, res) => {
    const { person, service, number } = req.body;

    try {
        const response = await databases.createDocument(DATABASE_ID, CALL_COLLECTION_ID, "unique()", {
            person,
            service,
            number,
        });
        res.json({ message: "Data stored successfully", data: response });
    } catch (error) {
        console.error("Error storing data:", error);
        res.status(500).json({ error: "Failed to store data" });
    }
})

emergencyRouter.get('/contacts', async (req, res) => {
    try {
        const response = await databases.listDocuments(DATABASE_ID, CONTACT_COLLECTION_ID);
        const contacts = response.documents.map((doc) => ({
            name: doc.name,
            purpose: doc.service, // Assuming 'service' is the purpose
            classification: doc.classification || "N/A",
            working_contact: doc.number,
            location: doc.location || "Unknown",
        }));
        res.json(contacts);
    } catch (error) {
        console.error("Error retrieving data:", error);
        res.status(500).json({ error: "Failed to retrieve data" });
    }
})

emergencyRouter.get('/contacts/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const response = await databases.getDocument(DATABASE_ID, CONTACT_COLLECTION_ID, id);

        const contact = {
            name: response.name,
            purpose: response.service, // Assuming 'service' is the purpose
            classification: response.classification || "N/A",
            working_contact: response.number,
            location: response.location || "Unknown",
        };

        res.json(contact);
    } catch (error) {
        console.error("Error retrieving contact by ID:", error);
        res.status(500).json({ error: "Failed to retrieve contact" });
    }
});



export default emergencyRouter;