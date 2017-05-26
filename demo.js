$(function() {
	$("#demoContainer").triswitch({
		inputName: "demoInput",
		legend: {
			label: "habitat",
			width: "210px"
		},
		states: {
			left: {
				label: "terre",
				value: -1
			},
			center: {
				label:  "terre et mer",
				value:  0
			},
			right: {
				label: "mer",
				value:  1
			}
		}
	});
});