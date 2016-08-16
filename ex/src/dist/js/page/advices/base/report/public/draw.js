'use strict';

define(function () {

	function Draw(set) {
		this.$cb = set.cb;
		this.$drawId = set.drawId;
		this.$drawOption = set.drawOption;
		this.$maxDraw = set.maxDraw;
		this.$getCbData = set.getCbData;
		this.$cbClickHandler = set.cbClickHandler;

		if (this.$drawId) {
			$(this.$drawId).highcharts($.extend({}, this.$drawOption));
			this.$chart = $(this.$drawId).highcharts();
		}
	}

	var dp = Draw.prototype;

	dp.init = function (data) {
		this.bindEvent();
		if (data) {
			this.fill(data);
			this.presetCb(data);
		}
	};

	dp.presetCb = function (data) {
		var keys = Object.keys(data);
		if (this.$cb) {
			this.$cb.each(function (i, el) {
				if (keys.indexOf($(el).attr('data-key')) != -1) $(el).prop('checked', true);
			});
		}
	};

	dp.bindEvent = function () {
		this.$cb.off();
		var _this = this;
		this.$cb.on('click', function () {
			_this.cbClickHandler(this);
		});
	};

	dp.cbClickHandler = function (tar) {
		var len = this.getCurCb().length,
		    news;
		if (this.$maxDraw != false && len > this.$maxDraw) {
			$(tar).prop('checked', false);
		} else {
			if (typeof this.$cbClickHandler == 'function') {
				this.$cbClickHandler(this.getCbData.bind(this), tar, this.$cb, this.getCurCb.bind(this));
			} else {
				this.getCbData();
			}
		}
	};

	dp.getCurCb = function () {
		var res = [];
		this.$cb.each(function (i, el) {
			if ($(el).prop('checked') == true) {
				res.push($(el).attr('data-key'));
			}
		});

		return res;
	};

	dp.hasSeries = function (el, map) {
		var chart = this.$chart;
		if (!chart) return false;

		var name = $(el).attr('data-key');

		if (map[name]) return true;else return false;
	};

	dp.getCbData = function () {
		var _this2 = this;

		if (!this.$getCbData) return false;

		var addCbs = this.getAddCbs(),
		    removeCbs = this.getRemoveCbs(),
		    def = [],
		    datas = [];

		addCbs.forEach(function (key) {
			var fetch = _this2.$getCbData(key);
			if (fetch) {
				fetch.done(function (data) {
					datas.push([key, data]);
				});
				def.push(fetch);
			}
		});

		$.when.apply(null, def).done(function () {
			datas.forEach(function (data) {
				_this2.addSeries.apply(_this2, data);
			});
		});

		removeCbs.forEach(function (key) {
			_this2.removeSeries(key);
		});
	};

	dp.getAddCbs = function () {
		var series = this.$chart.series.map(function (s) {
			return s.name;
		}),
		    curCb = this.getCurCb(),
		    res;

		res = curCb.filter(function (key) {
			return series.indexOf(key) == -1;
		});

		return res;
	};

	dp.getRemoveCbs = function () {
		var series = this.$chart.series.map(function (s) {
			return s.name;
		}),
		    curCb = this.getCurCb(),
		    res;

		res = series.filter(function (key) {
			return curCb.indexOf(key) == -1;
		});

		return res;
	};

	dp.addSeries = function (key, data) {
		var chart = this.$chart,
		    colorMap = ['#0066cc', '#ffcc66', '#ff6633', '#9933ff', '#33ccff'];

		var series = {
			name: key,
			data: this.parseToDraw(data)
		};

		chart.addSeries(series);
	};

	dp.removeSeries = function (series) {
		var chart = this.$chart,
		    idx;

		chart.series.forEach(function (s, i) {
			if (s.name == series) idx = i;
		});

		if (idx != undefined) chart.series[idx].remove();
	};

	dp.parseToDraw = function (data) {
		var res = data.sort(function (a, b) {
			return Date.parse(a.date) - Date.parse(b.date);
		}).map(function (item) {
			return [Date.parse(item.date), item.value];
		});

		return res;
	};

	dp.fill = function (data) {
		var _this3 = this;

		Object.keys(data).map(function (key) {
			_this3.addSeries(key, data[key]);
		});
	};

	dp.dispose = function () {
		if (this.$cb) this.$cb.off();
		if (this.$chart) {
			this.$chart.destroy();
			this.$chart = null;
		}
	};

	return Draw;
});