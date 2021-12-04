const Commands = require('../controller/CommandController')

module.exports = function initInputTree() {
	const map = new Map();
	
	map.set("", [ Commands.start ]);
		map.set(Commands.start.id, [ 
			Commands.deleteUser,
			Commands.changeUserRole,
			Commands.start,
			Commands.addNewPartner,
			Commands.subsOnPartner
		]);
		map.set(Commands.deleteUser.id, [Commands.start, Commands.changeUserRole, Commands.deleteUser, Commands.addNewPartner] );
		map.set(Commands.changeUserRole.id, [Commands.start, Commands.deleteUser, Commands.changeUserRole, Commands.addNewPartner])
		map.set(Commands.selectPartner.id, [ Commands.selectCourse ]);
		map.set(Commands.subsOnPartner.id, [Commands.selectPartner]) // ???
		map.set(Commands.selectCourse.id, [Commands.start] )
		map.set(Commands.selectCourse.id, [Commands.start, Commands.deleteUser, Commands.changeUserRole, Commands.addNewPartner] )
	return map;
}