import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';

export const validateId = (req: Request, res: Response, next: NextFunction) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }
  next();
};

export const validateBody = (requiredFields: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const missing = requiredFields.filter((f) => {
      const val = req.body[f];
      return val === undefined || val === null || val === '';
    });
    if (missing.length) {
      res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });
      return;
    }
    next();
  };
