import { NextFunction, Request, Response } from "express";

export const injectFileIntoBody = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (Array.isArray(req.files)) {
      for (const file of req.files) {
        req.body[file.fieldname] = {
          originalname: file.originalname,
          mimetype: file.mimetype,
          path: file.path,
          filename: file.filename,
        };
      }
    } else if (req.files && typeof req.files === "object") {
      const filesByField = req.files as { [key: string]: Express.Multer.File[] };
      for (const field in filesByField) {
        const file = filesByField[field]?.[0];
        if (file) {
          req.body[field] = {
            originalname: file.originalname,
            mimetype: file.mimetype,
            path: file.path,
            filename: file.filename,
          };
        }
      }
    } else if (req.file) {
      req.body[req.file.fieldname] = {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        path: req.file.path,
        filename: req.file.filename,
      };
    }

    next();
  };
};
