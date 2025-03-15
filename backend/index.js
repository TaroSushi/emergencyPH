import express from "express";
import cors from "cors";
import emergencyRouter from "./routes/emergency.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const apiRouter = express.Router();
apiRouter.use("/emergency", emergencyRouter);


app.use("/api/v1", apiRouter);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});