var express = require('express');
var fs = require('fs');
var data = require('../data.json');
var router = express.Router();
/* GET users listing. */
router.get('/', function (req, res, next) {
	var query = req.query;
	var index = query.index;
	var data1 = data.data1[index];
	var data2 = data.data2[index];

	res.send({ data1: data1, data2: data2 });
});

module.exports = router;
