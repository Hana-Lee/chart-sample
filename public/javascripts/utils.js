App.utils = {
	getLastValue: function(valueArray) {
		if (_.isArray(valueArray)) {
			return valueArray[valueArray.length - 1];
		}
		return 0;
	}
};
