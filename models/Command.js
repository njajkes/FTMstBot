module.exports = class Input {
	constructor(id, nameFunc, condition, action) {
		this.id = id;
		this.nameFunc = nameFunc;
		this.condition = condition;
		this.action = action;
	}
}