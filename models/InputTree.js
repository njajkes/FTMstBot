const Commands = require('../controller/CommandController')

module.exports = function initInputTree() {
	const map = new Map();
	
	map.set("", (msg, sess) => [ Commands.menu ]);
	map.set(Commands.menu.id, (msg, sess) => [
		Commands.menu,
		Commands.deleteUser,
		Commands.changeUserRole,
		Commands.addNewPartner,
		Commands.subsOnPartner
	]);
	map.set(Commands.deleteUser.id, (msg, sess) => [ Commands.menu, Commands.changeUserRole, Commands.deleteUser, Commands.addNewPartner ] );
	map.set(Commands.changeUserRole.id, (msg, sess) => [ Commands.menu, Commands.deleteUser, Commands.changeUserRole, Commands.addNewPartner ]);
	map.set(Commands.subsOnPartner.id, (msg, sess) => [ Commands.selectPartner ]);
	map.set(Commands.selectPartner.id, (msg, sess) => [ Commands.selectCourse ]);
	map.set(Commands.selectCourse.id, (msg, sess) => [ Commands.startCourse, Commands.menu ] )
	map.set(Commands.startCourse.id, (msg, sess) => [ Commands.startUnit ]);
	map.set(Commands.startUnit.id, (msg, sess) => sess.pendingQuizzes.length > 0 ? [ Commands.answerQuiz ] : [ Commands.menu ]);
	map.set(Commands.answerQuiz.id, (msg, sess) => sess.pendingQuizzes.length > 0 ? [ Commands.answerQuiz ] : [ Commands.menu ]);

	return map;
}