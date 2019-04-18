const axios = require('axios');
const util = require('util');
const request = require('request');
const BIN_PROC = {
	NONE: 0,
	START: 1,
	OPEN: 2,
	RESULT: 3,
};

const GAME_TIME_MS = 180 * 1000;
const OPEN_TIME_MS = 60 * 1000;
//const OPEN_TIME_MS = 90 * 1000
// const OPEN_CHECK_TIME_MS = 59 * 1000; //1초깍아서 오픈에 대해 체크할 타임으로
//const OPEN_CHECK_TIME_MS = 89 * 1000 //1초깍아서 오픈에 대해 체크할 타임으로
//const RESULT_TIME_MS = 177 * 1000 // 레이턴시를 감안해서 미리 구해놓음, 나머지 몇초는 그냥 기다림
// const RESULT_TIME_MS = 118 * 1000; // 레이턴시를 감안해서 미리 구해놓음, 나머지 몇초는 그냥 기다림
const EXPIRE_QUE_DATA_SECOND = 60 * 60 * 24; //일정시간이 지난후 큐데이터 삭제
const EXECUTE_TIME_MS = 1000;
//const API_GET_TIME_OUT = 1000 * 2
const API_GET_TIME_OUT = 1000 * 5;
//const LOOP_TIME_MS = 500
const LOOP_TIME_MS = 1000; //3초에 한번씩으로 변경, 19-04-11
// const CBENE_OK = "ok";
// const OBTC_OK = 200;

const IDAX_OK = 10000;
// const BINANCE_SYMBOL = "BTCUSDT";

const idaxBase = "https://openapi.idax.pro/api/v2/kline?pair=BTC_USDT&period=1min&size=1&since="; //&size= , &since값 필요 , since값을 필요한 시간 지난후 호출
const binanceBase = "https://api.binance.com/api/v1/klines?symbol=BTCUSDT&interval=1m&limit=1&startTime="; //&startTime = , &limit=1 필요
const idaxTime = "https://openapi.idax.pro/api/v2/time"; //{"code":10000,"msg":"Successful request processing","timestamp":1554950685516}
const binanceTime = "https://api.binance.com/api/v1/time"; //{"serverTime":1554950689933}

const dataObj = {
	state: BIN_PROC.NONE, gameKey: 0, open: [], isOpen: false, update: 0,
	openTime: [], startCheck: 0,
	idax: [], binance: [],
	av: [],
	maxPrice: 0, minPrice: 0,
	startMaxPrice: 0,
	startMinPrice: 0,
	openMaxPrice: 0,
	openMinPrice: 0,
	ixPrice: 0,
	biPrice: 0,
	avgPrice: 0,
	ixPriceList: [],
	biPriceList: [],
	avgPriceList: [],
	startBaseValue: 0,
	resultBaseValue: 0,
};
let serverTimes = null;
let diff = 0;
const startOfDay = function(dateObj) {
	return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
};

const prepareWatchProc = async function() {
	serverTimes = await getServerTime();
	let nowTemp = new Date();
	//let selectTime = (serverTimes.bnTime > serverTimes.idTime) ? serverTimes.bnTime : serverTimes.idTime;
	let selectTime = (serverTimes.bnTime > serverTimes.idTime) ? serverTimes.idTime : serverTimes.bnTime; //더 작은값이 느린시간?? 이겠지

	diff = (new Date(selectTime)).getTime() - nowTemp.getTime();
};

const watchProc = async function() {
	let nowLocal = new Date();
	// if (nowLocal.getTime() - dataObj.update > EXECUTE_TIME_MS) {
	dataObj.update = nowLocal.getTime(); //실행 인터벌 제어용

	//local 과의 시간이 3분이상으로 너무 차이가 나서, 받아온 binance 의 시간을 현재시간으로 활용, 로컬타임은 실행제어용으로만
	//let serverTimes = await getServerTime();

	// console.log('diff', diff);
	//let now = new Date(serverTimes.bnTime);
	let now = new Date(nowLocal.getTime() + diff);
	// console.log('now', now, now.toString());
	let dayBegin = startOfDay(now);
	// console.log('day begin', dayBegin, dayBegin.toString());
	let passMS = now.getTime() - dayBegin.getTime();
	// console.log('pass ms', passMS);
	let keyCheck = Math.floor(passMS / GAME_TIME_MS);
	let startCheck = passMS % GAME_TIME_MS; //이번 회차에서 1분전이면 open btc 를 만들수 있으니, 그것을 체크하기 위해
	let gameKey = dayBegin.getTime() + keyCheck * GAME_TIME_MS; //3분주기의 시작시간을 키로 한다.
	let openPoint = gameKey + OPEN_TIME_MS; //1분때를 시작시간으로
	let closePoint = gameKey + (OPEN_TIME_MS * 2); //2분때를 마감시간으로


	// if (dataObj.state === BIN_PROC.NONE) {
	// 	if (now.getMinutes() === 0) {
	// 		dataObj.state = BIN_PROC.START;
	// 		dataObj.gameKey = gameKey;
	// 		dataObj.open = 0;
	// 		dataObj.isOpen = false;
	// 	} else if (now.getMinutes() === 1) {
	// 		dataObj.state = BIN_PROC.RESULT;
	// 	} else if (now.getMinutes() === 2) {
	// 		dataObj.state = BIN_PROC.OPEN;
	// 	} else {
	// 		switch (now.getMinutes() % 3) {
	// 			case 1:
	// 				dataObj.state = BIN_PROC.RESULT;
	// 				break;
	// 			case 2:
	// 				dataObj.state = BIN_PROC.OPEN;
	// 				break;
	// 			case 0:
	// 				dataObj.state = BIN_PROC.START;
	// 				dataObj.gameKey = gameKey;
	// 				dataObj.open = 0;
	// 				dataObj.isOpen = false;
	// 				break;
	// 		}
	// 	}
	// }

	console.log("STATE(%d),gameKey(%d),startCheck(%d),keyCheck(%d),now(%s),localTime(%s)",
		dataObj.state, dataObj.gameKey, startCheck, keyCheck, now, nowLocal);
	dataObj.startCheck = startCheck;
	// idax, binance 시간을 가져와서, 둘의 시간이 현재체크하려는 시간을 지났는지 확인한다.
	// binance 는 시작시간이 파라미터이고, idax 는 끝시간이 파라미터가 된다.
	// 3분주기의 시작에서, 매치와 오즈를 생성하고,
	// 1분때 ,openPoint 때에 binance 는 gameKey 로 값을 불러와서 close 값을 오픈값으로,
	// idax 는 openPoint 로 값을 불러와서 close 값을 오픈값으로 해서 둘을 평균낸다
	// 2분때, closePoint 때에 binance 는 openPoint 로 값을 불러서 close 값으로,
	// idax 는 closePoint 로 값을 불러서 close 값을 마감값으로
	if (dataObj.state === BIN_PROC.NONE) {
		if (startCheck < OPEN_TIME_MS) {
			dataObj.state = BIN_PROC.START;
			dataObj.gameKey = gameKey;
			dataObj.isOpen = false;
			if (dataObj.ixPriceList.length > 0) {
				dataObj.openTime = [];
				dataObj.startMaxPrice = 0;
				dataObj.startMinPrice = 0;
				dataObj.openMaxPrice = 0;
				dataObj.openMinPrice = 0;
				dataObj.ixPrice = 0;
				dataObj.biPrice = 0;
				dataObj.avgPrice = 0;
				dataObj.ixPriceList = [];
				dataObj.biPriceList = [];
				dataObj.avgPriceList = [];
				dataObj.startBaseValue = 0;
				dataObj.resultBaseValue = 0;
			}
		} else {
			console.log("next waiting")
		}
	} else if (dataObj.state === BIN_PROC.START) {
		if (now.getTime() > openPoint) {
			//open 가를 두 사이트에서 가지고 온다
			let retGet = await getAllKline(gameKey, openPoint);
			dataObj.state = BIN_PROC.OPEN;
			dataObj.openTime.push(gameKey);
			dataObj.isOpen = true;

			const max = (retGet.binance + 1.5);
			const min = (retGet.idax - 1.5);
			if (dataObj.startMaxPrice < max) {
				dataObj.startMaxPrice = max;
			} else if (dataObj.startMaxPrice < min) {
				dataObj.startMaxPrice = min;
			}
			if (dataObj.startMinPrice > min) {
				dataObj.startMinPrice = min;
			} else if (dataObj.startMinPrice > max) {
				dataObj.startMinPrice = max;
			}

			dataObj.ixPrice = retGet.idax;
			dataObj.biPrice = retGet.binance;
			dataObj.avgPrice = retGet.av;
			dataObj.resultBaseValue = retGet.av;
			dataObj.ixPriceList.push(retGet.idax);
			dataObj.biPriceList.push(retGet.binance);
			dataObj.avgPriceList.push(retGet.av);
			console.log('START');
		} else {
			await getAllPrice();
		}
	} else if (dataObj.state === BIN_PROC.OPEN) {
		if (now.getTime() > closePoint) {
			//close 가를 두 사이트에서 가지고 온다
			let retGet = await getAllKline(openPoint, closePoint);
			dataObj.state = BIN_PROC.RESULT;
			dataObj.openTime.push(openPoint);
			dataObj.isOpen = true;

			const max = (retGet.binance + 1.5);
			const min = (retGet.idax - 1.5);
			if (dataObj.openMaxPrice < max) {
				dataObj.openMaxPrice = max;
			} else if (dataObj.openMaxPrice < min) {
				dataObj.openMaxPrice = min;
			}
			if (dataObj.openMinPrice > min) {
				dataObj.openMinPrice = min;
			} else if (dataObj.openMinPrice > max) {
				dataObj.openMinPrice = max;
			}

			dataObj.ixPrice = retGet.idax;
			dataObj.biPrice = retGet.binance;
			dataObj.avgPrice = retGet.av;
			dataObj.ixPriceList.push(retGet.idax);
			dataObj.biPriceList.push(retGet.binance);
			dataObj.avgPriceList.push(retGet.av);
			console.log('OPEN');
			//await pushBinListOpen(gameKey, retGet.av)
		} else {
			await getAllPrice();
		}
	} else if (dataObj.state === BIN_PROC.RESULT) {
		//상태를 START 로 바꾸면서,해당회차 첫데이터 새로운 데이터를 디비등에 생성해준다.
		dataObj.startCheck = startCheck;
		if (dataObj.gameKey !== gameKey) {
			//새로운 회차 시작
			dataObj.state = BIN_PROC.START;
			dataObj.gameKey = gameKey;

			if (dataObj.ixPriceList.length > 0) {
				dataObj.startMaxPrice = 0;
				dataObj.startMinPrice = 0;
				dataObj.openMaxPrice = 0;
				dataObj.openMinPrice = 0;
				dataObj.ixPrice = 0;
				dataObj.biPrice = 0;
				dataObj.avgPrice = 0;
				dataObj.ixPriceList = [];
				dataObj.biPriceList = [];
				dataObj.avgPriceList = [];
				dataObj.startBaseValue = 0;
				dataObj.resultBaseValue = 0;
			}
			console.log('RESULT');
		} else {
			console.log(
				"waiting new set, datakey(%d), gameKey(%d)",
				dataObj.gameKey,
				gameKey,
			)
		}
	}
	// }
	return dataObj;
};

const getAllPrice = async function() {
	if (dataObj.state === BIN_PROC.START || dataObj.state === BIN_PROC.OPEN) {
		const p1 = axios.get('https://openapi.idax.pro/api/v2/ticker?pair=BTC_USDT');
		const p2 = axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
		return Promise.all([p1, p2]).then(function(results) {
			const p1Result = results[0];
			const p2Result = results[1];
			if (p1Result.data.code === 10000) {
				const ixPrice = Number(p1Result.data.ticker[0].last);
				const biPrice = Number(Number(p2Result.data.price).toFixed(2));
				const avgPrice = Number(((ixPrice + biPrice) / 2).toFixed(2));
				dataObj.ixPrice = ixPrice;
				dataObj.biPrice = biPrice;
				dataObj.avgPrice = avgPrice;
				if (dataObj.avgPriceList.length === 0) {
					dataObj.startBaseValue = avgPrice;
				}
				dataObj.ixPriceList.push(ixPrice);
				dataObj.biPriceList.push(biPrice);
				dataObj.avgPriceList.push(avgPrice);

				const minPrice = ixPrice - 1.5;
				const maxPrice = biPrice + 1.5;

				if (dataObj.minPrice === 0) {
					dataObj.minPrice = minPrice > maxPrice ? maxPrice : minPrice;
				}
				if (dataObj.maxPrice === 0) {
					dataObj.maxPrice = maxPrice > minPrice ? maxPrice : minPrice;
				}

				if (dataObj.minPrice > minPrice) {
					dataObj.minPrice = minPrice;
				} else if (dataObj.minPrice > maxPrice) {
					dataObj.minPrice = maxPrice;
				}
				if (dataObj.maxPrice < maxPrice) {
					dataObj.maxPrice = maxPrice;
				} else if (dataObj.maxPrice < minPrice) {
					dataObj.maxPrice = minPrice;
				}

				if (dataObj.state === BIN_PROC.START) {
					dataObj.startMaxPrice = dataObj.maxPrice;
					dataObj.startMinPrice = dataObj.minPrice;
				} else if (dataObj.state === BIN_PROC.OPEN) {
					dataObj.openMaxPrice = dataObj.maxPrice;
					dataObj.openMinPrice = dataObj.minPrice;
				}
				console.log(dataObj.startMaxPrice);
			}
		});
	}
};

/**
 *
 * @param nowPoint number
 * @param nextPoint number
 * @returns {Promise<any[]>}
 */
const getAllKline = async function(nowPoint, nextPoint) {
	let count = 0;
	let sum = 0;
	let d1 = 0;
	let d2 = 0;

	let av = 0;
	console.log("getAllKline, nowPoint(%d), nextPoint(%d)", nowPoint, nextPoint);
	// binance 는 주어진 point 가 시작값이고, idax 는 끝값이다
	const p1 = new Promise(function(resolve) {
		//let reqGetIdax = util.format("%s%d",idaxBase,nextPoint);
		let reqGetIdax = util.format("%s%d", idaxBase, nowPoint);
		console.log("reqGetIdax: %s", reqGetIdax);
		request.get(reqGetIdax, { timeout: API_GET_TIME_OUT }, function(error, res, body) {
			if (!error && res.statusCode === 200) {
				let obj = JSON.parse(body);
				resolve(obj)
			} else {
				resolve({ code: 0 })
			}
		})
	});

	const p2 = new Promise(function(resolve) {
		let reqGetBinance = util.format("%s%d", binanceBase, nowPoint);
		console.log("reqGetBinance: %s", reqGetBinance);
		request.get(reqGetBinance, { timeout: API_GET_TIME_OUT }, function(error, res, body) {
			if (!error && res.statusCode === 200) {
				let obj = JSON.parse(body);
				resolve(obj)
			} else {
				resolve({ code: 0 })
			}
		})
	});

	return Promise.all([p1, p2])
		.then(function(values) {
			let data1 = values[0];
			let data2 = values[1];

			console.log("all come, idax:(%s),binance(%s)", JSON.stringify(data1), JSON.stringify(data2));

			if (data1.code === IDAX_OK) {
				count++;
				d1 = Number(data1.kline[0][4]);
				if (d1 > 0) {
					d1 = Math.floor(d1 * 100) / 100
				}
				sum += d1
			}

			if (data2[0]) {
				count++;
				d2 = Number(data2[0][4]);
				if (d2 > 0) {
					d2 = Math.floor(d2 * 100) / 100
				}
				sum += d2
			}
			if (sum > 0) {
				av = sum / count;
				//let data4 = util.format("time:(%s),refKey(%s),data:(%d)",now.toString(),now.getTime(),av);
				//logger4.info(data4);
				if (av > 0) {
					av = Math.floor(av * 100) / 100
				}
			}

			console.log("get price, idax(%d), binance(%d), average(%d)", d1, d2, av);
			return { idax: d1, binance: d2, av: av };
		})
		.catch(function(err) {
			//reject(0);
			console.log("catch: ", err);
			return { idax: 0, binance: 0, av: 0 };
		});
};

const getServerTime = async function() {

	let d1 = 0;
	let d2 = 0;

	const p1 = new Promise(function(resolve) {
		request.get(binanceTime, { timeout: API_GET_TIME_OUT }, function(error, res, body) {
			if (!error && res.statusCode === 200) {
				let obj = JSON.parse(body);
				resolve(obj)

			} else {

				resolve({ code: 0 })
			}
		})
	});

	const p2 = new Promise(function(resolve) {
		request.get(idaxTime, { timeout: API_GET_TIME_OUT }, function(error, res, body) {
			if (!error && res.statusCode === 200) {
				let obj = JSON.parse(body);
				resolve(obj)

			} else {

				resolve({ code: 0 })
			}
		})
	});

	return Promise.all([p1, p2]).then(function(values) {
		let data1 = values[0];
		let data2 = values[1];
		//console.log("all come, cbene:(%s),obtc(%s),idax(%s)",JSON.stringify(data1),JSON.stringify(data2),JSON.stringify(data3));

		if (data1.serverTime) {
			d1 = Number(data1.serverTime)
		}

		if (data2.code === IDAX_OK) {
			d2 = Number(data2.timestamp)
		}

		console.log("time,binance(%d), idax(%d), localTime(%d)", d1, d2, (new Date()).getTime());
		console.log("time,binance(%s), idax(%s), localTime(%s)", (new Date(d1)).toString(), (new Date(d2)).toString(), (new Date()).toString());
		return { bnTime: d1, idTime: d2 }

	}).catch(function(err) {
		//reject(0);
		console.log("catch: ", err);
		return { bnTime: 0, idTime: 0 }
	})
};

module.exports = { watchProc: watchProc, prepareWatchProc: prepareWatchProc };
