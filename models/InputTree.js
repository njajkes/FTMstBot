const Commands = require('../controller/CommandController')

module.exports = function initInputTree() {
	const map = new Map();
	
	map.set("", [ Commands.menu ]);
	map.set(Commands.menu.id, [
		Commands.menu,
		Commands.deleteUser,
		Commands.changeUserRole,
		Commands.addNewPartner,
		Commands.subsOnPartner
	]);
	map.set(Commands.deleteUser.id, [ Commands.menu, Commands.changeUserRole, Commands.deleteUser, Commands.addNewPartner ] );
	map.set(Commands.changeUserRole.id, [ Commands.menu, Commands.deleteUser, Commands.changeUserRole, Commands.addNewPartner ]);
	map.set(Commands.subsOnPartner.id, [ Commands.selectPartner ]) // ???
	map.set(Commands.selectPartner.id, [ Commands.selectCourse ]);
	map.set(Commands.selectCourse.id, [ Commands.startCourse, Commands.menu ] )

	return map;
}