const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const debug = require('debug')('chart-sample:server');
const http = require('http');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const dataRouter = require('./routes/data');
const moment = require('moment');
const axios = require('axios');

const app = express();
const crawler = require('./binary-crawler');
// binance recover key CURPSZ5NAQ5JPZXX
// var apiKey = 'xQZsNkCQRWTPM8x35hXYcHj5By0uScLX9v4d4lkFKxjdLIIHFal2YOaNoFcXaTCo';
// var apiSecret = '09fNv6Om0s2o5bFYjbEjzowhwEJbMRE2lXb4BL2ckfxmIhoJRuif6HDyQ5Zhvuu8';

/**
 API Key: xQZsNkCQRWTPM8x35hXYcHj5By0uScLX9v4d4lkFKxjdLIIHFal2YOaNoFcXaTCo
 Secret Key: 09fNv6Om0s2o5bFYjbEjzowhwEJbMRE2lXb4BL2ckfxmIhoJRuif6HDyQ5Zhvuu8
 Store your Secret Key somewhere safe. It will not be shown again.
 */

/*
IDAX response kline
{
	"channel":"idax_sub_btc_usdt_kline_1min",
	"code":"00000",
	"data":[
		"1554233280048", // timestamp
		"4709.70",       // open price
		"4709.96",       // high price
		"4709.67",       // low price
		"4709.67",       // close price
		"211503.36201712"// volume
	]
}

IDAX tickers response
{
    "channel":"idax_sub_eth_btc_ticker",
    "data":[{
      "open":"2466",
      "high":"2555",
      "low":"2466",
      "last":"2478.51",
      "timestamp":1411718074965,
      "vol":"49020.30"
    }]
}
*/

/*
BINANCE candle response
{
	eventType: 'kline',
  eventTime: 1554233423937,
  symbol: 'BTCUSDT',
  startTime: 1554233400000,
  closeTime: 1554233459999,
  firstTradeId: 110043924,
  lastTradeId: 110044006,
  open: '4712.32000000',
  high: '4713.42000000',
  low: '4710.79000000',
  close: '4713.42000000',
  volume: '6.28019400',
  trades: 83,
  interval: '1m',
  isFinal: false,
  quoteVolume: '29593.34219126',
  buyVolume: '3.66081600',
  quoteBuyVolume: '17251.43038652'
}

BINANCE ticker response
{
  eventType: '24hrTicker',
  eventTime: 1514670820924,
  symbol: 'HSRETH',
  priceChange: '-0.00409700',
  priceChangePercent: '-11.307',
  weightedAvg: '0.03394946',
  prevDayClose: '0.03623500',
  curDayClose: '0.03213800',
  closeTradeQuantity: '7.02000000',
  bestBid: '0.03204200',
  bestBidQnt: '78.00000000',
  bestAsk: '0.03239800',
  bestAskQnt: '7.00000000',
  open: '0.03623500',
  high: '0.03659900',
  low: '0.03126000',
  volume: '100605.15000000',
  volumeQuote: '3415.49097353',
  openTime: 1514584420922,
  closeTime: 1514670820922,
  firstTradeId: 344803,
  lastTradeId: 351380,
  totalTrades: 6578
}
*/
let biPriceTemp = 0;
let ixPriceTemp = 0;
let biPrice = 0;
let biTimestamp = 0;
let ixPrice = 0;
let ixTimestamp = 0;
let prevTime = 0;
let avgPrice = 0;
// setInterval(function () {
	// if (biPriceTemp > 0 && ixPriceTemp > 0 && biTimestamp > 0 && ixTimestamp > 0) {
	// 	let time;
	// 	const cTime = new Date().getTime();
	// 	if (!prevTime) {
	// 		time = 'START';
	// 		prevTime = new Date().getTime();
	// 	} else {
	// 		time = Math.ceil((cTime - prevTime) / 1000) + 's';
	// 		prevTime = cTime;
	// 	}
	// 	console.log('===================', moment().format('YYYY-MM-DD HH:mm:ss'), '(', time, ')', '==============================');
	// 	console.log('bi price', Number(biPrice).toFixed(2), ', timestamp', biTimestamp, ', date', moment(biTimestamp).format('YYYY-MM-DD HH:mm:ss'));
	// 	console.log('ix price', ixPrice, ', timestamp', ixTimestamp, ', date', moment(Number(ixTimestamp)).format('YYYY-MM-DD HH:mm:ss'));
	// 	console.log('=====================================================================');
	// 	biPriceTemp = 0;
	// 	ixPriceTemp = 0;
	// }
// }, 100);

// setInterval(function () {
	// const p1 = axios.get('https://openapi.idax.pro/api/v2/ticker?pair=BTC_USDT');
	// // .then(function(response) {
	// // console.log('response', response.data.ticker[0].last);
	// // });
	//
	// // /v1/ticker/allPrices
	// // https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT
	// const p2 = axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
	// Promise.all([p1, p2]).then(function (results) {
	// 	const now = new Date();
	// 	const p1Result = results[0];
	// 	const p2Result = results[1];
	// 	if (p1Result.data.code === 10000) {
	// 		ixPrice = ixPriceTemp = Number(p1Result.data.ticker[0].last);
	// 		biPrice = biPriceTemp = Number(Number(p2Result.data.price).toFixed(2));
	// 		avgPrice = Number(((ixPrice + biPrice) / 2).toFixed(2));
	// 		biTimestamp = ixTimestamp = now.getTime();
	// 	}
	// });
// }, 1000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/data', dataRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);
const io = require('socket.io')(server);

/**
 * Listen on provided port, on all network interfaces.
 */
let dataObj = {};
let socketList = [];
let intervalList = [];
function sendData(socket) {
	socketList.push(socket);
	intervalList.push(setInterval(function() {
		const data = {
			state: dataObj.state,
			biPrice: dataObj.biPrice,
			ixPrice: dataObj.ixPrice,
			avgPrice: dataObj.avgPrice,
			startMaxPrice: dataObj.startMaxPrice,
			startMinPrice: dataObj.startMinPrice,
			openMaxPrice: dataObj.openMaxPrice,
			openMinPrice: dataObj.openMinPrice,
			biPriceList: dataObj.biPriceList,
			ixPriceList: dataObj.ixPriceList,
			avgPriceList: dataObj.avgPriceList,
			startBaseValue: dataObj.startBaseValue,
			resultBaseValue: dataObj.resultBaseValue,
			time: dataObj.openTime,
			startCheck : dataObj.startCheck,
			count: dataObj.count,
		};
		socket.emit('priceData', data);
	}, 1000));
}

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
io.on('connection', function (socket) {
	// socket.emit('news', { hello: 'world' });
	// socket.on('my other event', function (data) {
	// 	console.log('my other event data', data);
	// });
	//
	// sendData(socket);
	const interval = setInterval(() => {
		if (new Date().getSeconds() % 3 === 0) {
			sendData(socket);
			clearInterval(interval);
		}
	}, 100);

	socket.on('disconnect', () => {
		const socketIdx = socketList.indexOf(socket);
		if (socketIdx > -1) {
			clearInterval(intervalList[socketIdx]);
			socketList.splice(socketIdx, 1);
			intervalList.splice(socketIdx, 1);
		}
	});
});
async function startWatching() {
	await crawler.prepareWatchProc();
	// await crawler.watchProc();
	setInterval(async () => {
		dataObj = await crawler.watchProc();
	}, 1000);
}

const startInterval = setInterval(async () => {
	if (new Date().getSeconds() % 3 === 0) {
		await startWatching();
		clearInterval(startInterval);
	}
}, 200);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
	const port = parseInt(val, 10);

	if (isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
	}

	return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	const bind = typeof port === 'string'
		? 'Pipe ' + port
		: 'Port ' + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
	const addr = server.address();
	const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
	debug('Listening on ' + bind);
}
