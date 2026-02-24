/* eslint-disable @typescript-eslint/no-floating-promises */
import { Router } from "express";

export class AdminRoute {
  adminRouter: Router;
  constructor() {
    this.adminRouter = Router();
    this._setRoutes();
  }

  private _setRoutes() {}
}
