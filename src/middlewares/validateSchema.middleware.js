export function validateSchema(schema){
    return(req, res, next) => {
        const {error} = schema.validate(req.body, {abortEarly: false});

        if(error){
            const errors = error.details.map( datail => datail.message);
            return res.status(400).send(errors);
        }
        next();
    }
}
