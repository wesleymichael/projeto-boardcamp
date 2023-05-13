import { Router } from "express";
import { finalizeRental, getRentals, insertRental } from "../controllers/rentals.controllers.js";
import { rentalsValidation } from "../middlewares/rentals.middleware.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { rentalSchema } from "../schemas/rental.schema.js";

const rentalsRouter = Router();

rentalsRouter.get("/rentals", getRentals);
rentalsRouter.post("/rentals", validateSchema(rentalSchema), rentalsValidation, insertRental);
rentalsRouter.post("/rentals/:id/return", finalizeRental);

export default rentalsRouter;
