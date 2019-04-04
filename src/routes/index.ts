import { Router } from 'express';
import { NextFunction, PathParams, Request, Response } from 'express-serve-static-core';

const router: Router = Router();
const rootPath: PathParams = '/';

/* GET home page. */
router.get(rootPath, (req: Request, res: Response, next: NextFunction) => {
	res.render('index', { title: 'Express!!' });
});

export default router;
