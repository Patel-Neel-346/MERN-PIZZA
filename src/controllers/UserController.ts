import { Logger } from 'winston';
import { UserService } from '../services/userService';
import { Request, Response, NextFunction } from 'express';
import { CreateUserRequest, UpdatedUserRequest } from '../types';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';

export class UserController {
    constructor(
        private readonly userservice: UserService,
        private readonly logger: Logger,
    ) {}

    async CreateNewUser(
        req: CreateUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        //validation

        const { firstName, lastName, email, password, tenantId, role } =
            req.body;

        try {
            const user = await this.userservice.createUser({
                firstName,
                lastName,
                email,
                password,
                role,
                tenantId,
            });

            res.status(201).json({
                id: user.id,
            });
        } catch (error) {
            next(error);
        }
    }

    async UpdateUser(req: UpdatedUserRequest, res: Response, next: NextFunction) {
        const result = validationResult(req)

        if(!result.isEmpty()){
            const error = createHttpError(400,'Invalid Req')
            next(error)
        }

        const {firstName,lastName,role,tenantId} = req.body;
        const userId = req.params.id;


        if(isNaN(Number(userId))){
            next(createHttpError(400,'Invalid url params'))
            return;

        }

        this.logger.debug("Request for updating a user",req.body)


        try {
            await this.userservice.update(Number(userId),{
                firstName,
                lastName,
                role,
                tenantId
            })

            this.logger.info('User has been updatecd',{
                id:Number(userId)
            })

            res.json({
                id:Number(userId)
            })
        } catch (error) {
            next(error)
            
        }
    }

    async getAllData(req: Request, res: Response, next: NextFunction) {}

    async getUserDataById(req: Request, res: Response, next: NextFunction) {}

    async DeleteUser(req: Request, res: Response, next: NextFunction) {

        const userId = req.params.id;

        if(isNaN(Number(userId))){
            next(createHttpError(400,'Invalid url Params'))
            return;
        }

        try {
            await this.userservice.deleteById(Number(userId))

            this.logger.info('User has been deleted!',{
                id:Number(userId)
            })

            res.json({
                id:Number(userId)
            })
        } catch (error) {
            next(error)
        }
    }
}
