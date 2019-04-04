import { Router } from 'express';
import { PathParams, Request, Response } from 'express-serve-static-core';

const data = require('../data.json');
const router: Router = Router();
const rootPath: PathParams = '/';
/* GET users listing. */
router.get(rootPath, (req: Request, res: Response) => {
	const query = req.query;
	const index = query.index;
	const data1 = data.data1[index];
	const data2 = data.data2[index];

	res.send({ data1: data1, data2: data2 });
});

export default router;
