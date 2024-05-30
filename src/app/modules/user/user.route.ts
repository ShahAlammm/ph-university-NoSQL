import express, { NextFunction, Request, Response } from 'express';
import { UserControllers } from './user.controller';
import { AnyZodObject } from 'zod';

const router = express.Router();

const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const zodParsedData = await schema.parseAsync({
      body: req.body,
    });
    next();
  };
};

router.post(
  '/create-student',
  validateRequest('validateRequest'),
  UserControllers.createStudent,
);

export const UserRoutes = router;
