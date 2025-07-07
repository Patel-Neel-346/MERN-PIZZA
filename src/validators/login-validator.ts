import { checkSchema } from 'express-validator';

export default checkSchema({
    email: {
        errorMessage: 'Email is Required!',
        notEmpty: true,
        trim: true,
        isEmail: true,
    },

    password: {
        errorMessage: 'password is required!',
        notEmpty: true,
        isLength: {
            options: { min: 6, max: 10 },
            errorMessage:
                'Password must be Greather than 6 and less than 10 character long !!!!',
        },
    },
});
