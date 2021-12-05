const Commands = require('../controller/CommandController');
const { findUserByUid } = require('../controller/UserController');

module.exports = function initInputTree() {
	const map = new Map();
	
	map.set("", (msg, sess) => [ Commands.menu ]);
	map.set(Commands.menu.id, (msg, sess) => [
		Commands.menu,
		Commands.deleteUser,
		Commands.changeUserRole,
		Commands.addNewPartner,
		Commands.subsOnPartner,
		Commands.courseIncreaseAvg
	]);
	map.set(Commands.deleteUser.id, (msg, sess) => [ Commands.menu, Commands.changeUserRole, Commands.deleteUser, Commands.addNewPartner ] );
	map.set(Commands.changeUserRole.id, (msg, sess) => [ Commands.menu, Commands.deleteUser, Commands.changeUserRole, Commands.addNewPartner ]);
	map.set(Commands.subsOnPartner.id, (msg, sess) => [ Commands.menu, Commands.selectPartner ]);
	map.set(Commands.selectPartner.id, (msg, sess) => sess.lastPartner.validationNeeds ? [Commands.menu, Commands.partnerValidation] : [ Commands.menu, Commands.selectCourse ]);
	map.set(Commands.partnerValidation.id, (msg, sess) => [ Commands.menu, Commands.selectCourse ])
	map.set(Commands.selectCourse.id, (msg, sess) => [ Commands.menu, Commands.startCourse ] )
	map.set(Commands.startCourse.id, (msg, sess) => {
		if (sess.finishedOutro) return [ Commands.menu ]
		if (sess.doingIntro || sess.doingOutro) return [ Commands.answerQuiz ] 
		else return [ Commands.menu, Commands.startUnit ]
	})
	map.set(Commands.startUnit.id, (msg, sess) => sess.pendingQuizzes.length > 0 ? [ Commands.answerQuiz ] : [ Commands.menu ]);
	map.set(Commands.answerQuiz.id, (msg, sess) => {
		if (sess.pendingQuizzes.length > 0) { 
			return [ Commands.answerQuiz ] 
		} else if (sess.lastCourse.finishedOutro){
			return [ Commands.menu ]
		} else {
			return [ Commands.menu, Commands.startUnit  ]
			}
	});
	map.set(Commands.courseIncreaseAvg.id, (msg, sess) => [ Commands.menu ]);
	return map;
}