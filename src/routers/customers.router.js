import { Router } from "express";
import { getCustomers, insertCustomer } from "../controllers/customers.controller.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { customerSchema } from "../schemas/customer.schema.js";

const customersRouter = Router();

customersRouter.get("/customers", getCustomers);
customersRouter.post("/customers", validateSchema(customerSchema), insertCustomer);

export default customersRouter;
