const PERCENT_COLORS = [
    { pct: 0.00, color: { r: 0, g: 255, b: 0 } },
    { pct: 0.35, color: { r: 255, g: 255, b: 0 } },
    { pct: 0.75, color: { r: 255, g: 0, b: 0 } },
    { pct: 1.00, color: { r: 48, g: 25, b: 105 } },
    { pct: 2.50, color: { r: 0, g: 0, b: 0 } },
	{ pct: 10.0, color: { r: 0, g: 0, b: 0 } }
];

module.exports = {
	
	getColor: function(value) {
		var percent = value / 1000000000
	
		for (var i = 1; i < PERCENT_COLORS.length - 1; i++) {
			if (percent < PERCENT_COLORS[i].pct) {
				break;
			}
		}
		var lower = PERCENT_COLORS[i - 1];
		var upper = PERCENT_COLORS[i];
		var range = upper.pct - lower.pct;
		var rangePct = (percent - lower.pct) / range;
		var pctLower = 1 - rangePct;
		var pctUpper = rangePct;
		var color = {
			r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
			g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
			b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
		};
		return [color.r, color.g, color.b]
	}
	
}