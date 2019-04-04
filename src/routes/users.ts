import { Router } from 'express';
import { NextFunction, PathParams, Request, Response } from 'express-serve-static-core';

const router: Router = Router();
const rootPath: PathParams = '/';
/* GET users listing. */
router.get(rootPath, (req: Request, res: Response, next: NextFunction) => {
	res.send('respond with a resource');
});
export default router;
