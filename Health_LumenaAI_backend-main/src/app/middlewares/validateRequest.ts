import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError, ZodType } from "zod";

const validateRequest =
  (schema: AnyZodObject) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await schema.parseAsync(req.body);
        return next();
      } catch (err) {
        if (err instanceof ZodError) {
          return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: err.errors.map((error) => ({
              path: error.path.join("."),
              message: error.message,
            })),
          });
        }
        return next(err);
      }
    };

export const validateRequestArray =
  (schema: ZodType) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await schema.parseAsync(req.body);
        return next();
      } catch (err) {
        next(err);
      }
    };

export const validateQuery =
  (schema: AnyZodObject) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Parse query instead of body
        await schema.parseAsync(req.query);
        return next();
      } catch (err) {
        if (err instanceof ZodError) {
          return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: err.errors.map((error) => ({
              path: error.path.join("."),
              message: error.message,
            })),
          });
        }
        return next(err);
      }
    };
export default validateRequest;
