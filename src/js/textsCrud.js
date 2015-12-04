'use strict'

let typingMechanics = require('./typingMechanics')
const domManipulation = require('./utils/domManipulation')
const timer = require('./timer')
const lev = require('fast-levenshtein')
const TextObj = require('./textObj').TextObj
let texts = loadTextObjectsFromStorage() // an array of textObjs

module.exports = {
  /**
   * populate the list with Texts. Runs once on page load, and whenever re-drawing the list.
   */
  initLoad: function initLoad () {
    var $cardListContainer = $('#user-texts').find('.list').empty()

    if (texts == null) {
      // TODO add a nice "start here" guide
      return
    }
    texts.forEach(function (el) {
      var card = domManipulation.generateCard(el)
      $cardListContainer.append(card)
    })
    $('[data-toggle="tooltip"]').tooltip()
  },
  loadText: function loadText (textObj) {
    if (typeof textObj === 'number') {
      textObj = this.getByTextId(textObj)
    }
    typingMechanics.textObj = textObj
    $('#activity-area').data('textObj', textObj)
    $('.text').show().val(textObj.text).fixHeight()
    $('button.practice-mode').removeAttr('disabled')
    domManipulation.resetMode()
    timer.resetTimer()
  },
  saveText: function saveText (textObj) {
    // do some validation first. Is this textObj already there? if so, update.

    if (texts == null) {
      texts = []
    }
    texts.push(textObj)
    this.persistTexts()
    module.exports.loadText(textObj)
  },
  editText: function editText (textId, newTitle, newText) {
    var textObj = this.getByTextId(textId)
    var distance = lev.get(textObj.text.toLowerCase(), newText.toLowerCase())

    if (distance > 30) { // an arbitrary number
      // AND there is historical data for this text
      // TODO display warning text saying that historical data may become very inaccurate. Is that even true?
      console.log('Text ' + textObj.id + ' has been changed significantly.')
    }

    textObj.text = newText
    textObj.title = newTitle
    this.persistTexts()

    // update .text if this text is loaded in it
    if (typingMechanics.textObj !== undefined && typingMechanics.textObj.id === textId) {
      $('textarea.text').val(newText)
    }
  },
  deleteText: function deleteText (textId) {
    texts = texts.filter(function (el) {
      return el.id !== textId
    })
    this.persistTexts()

    // clear .text if this text is loaded in it
    if (typingMechanics.textObj !== undefined && typingMechanics.textObj.id === textId) {
      $('textarea.text').val('')
      $('#text-edit').removeData('textId')
      $('.mode-typing').attr('disabled', 'disabled')
    }
  },
  persistTexts: function persistTexts () {
    window.localStorage.setItem('texts', JSON.stringify(texts))
  },

  getByTextId: function getByTextId (textId) {
    var textObjArray = texts.filter(function filterById (textObj) {
      return textObj.id === textId
    })
    if (textObjArray.length !== 1) {
      console.log('Searched for textId ' + textId + ' but did not find a unique result. Full texts: \n' + texts) // TODO replace with a real logging implementation
      throw new Error('Unique result not found')
    }
    return textObjArray[0]
  }
}

/**
 * Deserializes the TextObj array stored in localStorage, re-linking their prototypes to the TextObj prototype.
 * See http://nullprogram.com/blog/2013/03/11/
 */
function loadTextObjectsFromStorage () {
  let objs = JSON.parse(window.localStorage.getItem('texts'))
  for (let obj of objs) {
    Object.setPrototypeOf(obj, TextObj.prototype)
  }
  return objs
}
