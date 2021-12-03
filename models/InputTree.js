const Commands = require('../controller/CommandController')

module.exports = function initInputTree() {
	const map = new Map();
	
	map.set("", [ Commands.start ]);
	map.set(Commands.start.id, [ Commands.selectPartner ]);
	map.set(Commands.selectPartner.id, [ Commands.selectCourse ]);
	
	return map;
}