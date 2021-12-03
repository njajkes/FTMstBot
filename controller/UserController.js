const Mongoose = require('mongoose')
const Partners = require('../models/Partners')
const Users = require('../models/User')
const Courses = require('../models/Course')


async function findUserByUid(uid) {
  const user = await Users.findOne({uid: uid})

  return user
}

async function findUserByUsername(username) {
  const user = await Users.findOne({username: username})

  return user
}

async function getUsersCourses(user) {
  //...
}

async function addUsersCourse(uid) {
  //...
}

module.exports = {
  findUserByUid,
  findUserByUsername,
  getUsersCourses,
  addUsersCourse
}