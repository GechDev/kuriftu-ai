import type { NextFunction, Request, Response } from "express";

/** Express 5 types widen `req.params` to `string | string[]` in some setups. */
export function routeParamId(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    void fn(req, res, next).catch(next);
  };
}

export function zodErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "issues" in err) {
    const issues = (err as { issues?: { message?: string }[] }).issues;
    return issues?.map((i) => i.message).join("; ") ?? "Validation error";
  }
  return "Validation error";
}
