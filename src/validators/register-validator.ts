import { checkSchema } from 'express-validator';

export default checkSchema({
    email: {
        errorMessage: 'Email is Required! ',
        notEmpty: true,
        trim: true,
        isEmail: true,
    },

    firstName: {
        errorMessage: 'First Name is Required!',
        notEmpty: true,
        trim: true,
    },

    lastName: {
        errorMessage: 'Last Name is Required!',
        notEmpty: true,
        trim: true,
    },

    password: {
        errorMessage: 'password is Required!',
        notEmpty: true,
        isLength: {
            options: { min: 6 },
            errorMessage: 'password should be at least 6 chars long!',
        },
    },
});
