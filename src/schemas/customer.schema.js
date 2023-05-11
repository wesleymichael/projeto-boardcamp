import BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);

export const customerSchema = Joi.object({
    name: Joi.string().trim().required(),
    phone: Joi.string().trim().min(10).max(11).pattern(/^[0-9]+$/).required(),
    cpf: Joi.string().trim().length(11).pattern(/^[0-9]+$/).required(),
    birthday: Joi.date().format('YYYY-MM-DD').required()
});
