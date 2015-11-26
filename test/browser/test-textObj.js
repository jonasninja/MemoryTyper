/**
 * Created by jonasninja on 10/28/2015.
 */
/* eslint-env browser */
'use strict'

const test = require('tape')
let textObj = require('../../src/js/textObj')

test('creating a new textObj', function newTextObj (t) {
  t.plan(10)

  const now = getNow()
  const body = 'the body of the text'
  const title = 'title'
  let nextIndex = parseInt(window.localStorage.getItem('textAutoIncrement'), 10)
  let obj = new textObj.TextObj(title, body)

  t.equal(obj.title, title)
  t.equal(obj.text, body)
  t.equal(obj.id, nextIndex)

  const r = obj.reviews
  t.ok(basicallyEqual(r.dueDate, now), 'Due date should be beginning of today')
  t.false(r.lastFailure)
  t.false(r.lastResult)
  t.false(r.lastSuccess)
  t.false(r.successes)
  t.false(r.continuousSuccesses)
  t.false(r.failures)
})

test('getting correct reviews a few times', function getItRight (t) {
  t.plan(5)
  const now = getNow()
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  const inTwoDays = new Date(now)
  inTwoDays.setDate(now.getDate() + 2)
  const inFourDays = new Date(now)
  inFourDays.setDate(now.getDate() + 4)
  const inEightDays = new Date(now)
  inEightDays.setDate(now.getDate() + 8)

  let obj = new textObj.TextObj('title', 'body')

  t.ok(basicallyEqual(obj.reviews.dueDate, now))
  obj.generateReviewDate(true)
  t.ok(basicallyEqual(obj.reviews.dueDate, tomorrow))
  obj.generateReviewDate(true)
  t.ok(basicallyEqual(obj.reviews.dueDate, inTwoDays))
  obj.generateReviewDate(true)
  t.ok(basicallyEqual(obj.reviews.dueDate, inFourDays))
  obj.generateReviewDate(true)
  t.ok(basicallyEqual(obj.reviews.dueDate, inEightDays))
})

test('generateReviewDate needs correct input', function needsInput (t) {
  t.plan(3)
  let obj = new textObj.TextObj('title', 'body')
  t.throws(obj.generateReviewDate)
  t.throws(function () {
    obj.generateReviewDate(null)
  })
  t.throws(function () {
    obj.generateReviewDate('string')
  })
})

test('upper limit to number of reviews', function (t) {

})

function basicallyEqual (date1, date2) {
  // 15 milliseconds should be enough for any test function...
  return Math.abs(date1.getTime() - date2.getTime()) <= 15
}

/**
 * Get a new Date object with all time fields set to 0.
 * @return {Date}
 */
function getNow () {
  const now = new Date()
  now.setMilliseconds(0)
  now.setSeconds(0)
  now.setMinutes(0)
  now.setHours(0)
  return now
}
