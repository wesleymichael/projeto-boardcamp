import { Router } from "express";
import { getRentals } from "../controllers/rentals.controllers.js";

const rentalsRouter = Router();

rentalsRouter.get("/rentals", getRentals);

export default rentalsRouter;
