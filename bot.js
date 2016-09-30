#!/bin/env node

const fs = require('fs')
const path = require('path')
const hat = require('hat')
const co = require('co')
const BotApi = require('./lib/botapi')

const bkalgo = require('./public/scripts/burgerking-algo')
const TellBurgerKing = require('./lib/burgerking')
const ocr = require('./lib/ocr').ocr

const config = require('./config')
const tmp_dir = config.sys.tmp_dir

const bot = new BotApi(config.bot.token)

function *ocrMain(filePath) {
  const text = yield ocr(filePath)
  return text
}

bot.commands.on('@photo', (upd, photo) => {
  if (!upd.message.chat) {
    return
  }
  const chat = upd.message.chat
  const sendMessage = (text) => {
    bot.sendMessage({
      chat_id: chat.id,
      text,
    })
  }
  const p = photo.filter(p => p.width >= 600)[0]
  if (p) {
    const fileName = hat(32) + '.jpg'
    const filePath = path.join(tmp_dir, fileName)
    bot.downloadFile(p.file_id, filePath, (err, success) => {
      if (err) {
        sendMessage(err.toString())
        return
      }
      if (success) {
        const fn = co.wrap(ocrMain)
        fn(filePath).then((text) => {
          if (text) {
            const result = bkalgo.calculateVcode(text)
            sendMessage('OCR Result: ' + text + '\n'
                    + 'Calculation Result: ' + result)
          } else {
            sendMessage('Failed to ocr the photo')
          }
          fs.unlink(filePath, () => {})
        }).catch((err) => {
          sendMessage(err.toString())
          fs.unlink(filePath, () => {})
        })
      } else {
        sendMessage('Download photo failed')
      }
    })
  } else {
    sendMessage('Not found a vaild photo')
  }
})

bot.commands.on('@text', (upd, text) => {
  if (upd.message) {
    const chat = upd.message.chat
    let result
    if (bkalgo.isVaildSCode(text)) {
      result = bkalgo.calculateVcode(text)
    } else {
      result = 'Not a vaild code'
    }
    bot.sendMessage({
      chat_id: chat.id,
      text: result,
    })
  }
})

bot.start()
