import { checkSchema, Meta } from 'express-validator';
import { Tree } from 'typeorm';
import { UpdatedUserRequest } from '../types';

export default checkSchema({
    firstName: {
        errorMessage: 'First name is required!',
        notEmpty: true,
        trim: true,
    },

    lastName: {
        errorMessage: 'last name is required!',
        notEmpty: true,
        trim: true,
    },

    role: {
        errorMessage: 'Role is required!',
        notEmpty: true,
        trim: true,
    },

    tenantId: {
        errorMessage: 'TenantID is Required!',
        trim: true,
        custom: {
            options: (value: string, meta: Meta) => {
                const req = meta.req as UpdatedUserRequest;
                const role = req.body.role;

                if (role === 'admin') {
                    return true;
                } else {
                    return !!value;
                }
            },
        },
    },
});
