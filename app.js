const express = require('express')
const logger = require('pino-http')
var request = require('request');

const { createClient } = require('@supabase/supabase-js')

const app = express()
const port = 3031

const supabaseUrl = 'https://cymagsnihvppzuqevvge.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5bWFnc25paHZwcHp1cWV2dmdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODY5Mjk4ODQsImV4cCI6MjAwMjUwNTg4NH0.cYzCmUzHpzUOcLHWPWo6dXCWxzUToOd33AMW_5SZqkE"
const supabase = createClient(supabaseUrl, supabaseKey)

app.use(express.json())
app.use(logger())


app.post('/', async (req, res) => {
  var json = req.body;
  console.log(json.body)
  if(json.type === "message" && json.body.key.fromMe === true) {
    if(json.body.message.hasOwnProperty('imageMessage')) {
      var { caption }  = json.body.message.imageMessage
      var splitCaption = caption.split(" ")
      var getPrice     = String(splitCaption[splitCaption.length-1]).toLowerCase().replaceAll("k", "000")
      await supabase.from("live_wa").insert([{ code: splitCaption[0], name: caption, price: getPrice }]);
    }

    if(json.body.message.hasOwnProperty('conversation')) {
      var split = json.body.message.conversation.split(' ')
      if(split[0] === "delete") {
        await supabase.from("live_wa").delete().eq('code', split[1])
      }
    }

    if(json.body.message.hasOwnProperty('extendedTextMessage')) {
      var msg = json.body.message.extendedTextMessage.text
      if(msg === "cek") {
        const { data } = await supabase.from("live_wa").select().order('id', { ascending: false }).limit(1);
        var options = {
          'method': 'POST',
          'url': 'http://localhost:3030/message/text?key=z7eQvd02G7Gl4T1Z8QAj0D0QE7MYX6W6',
          'headers': {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          form: {
            'id': '6282334093822',
            'message': data[0].name
          }
        }
      }
      await request(options)
    }
  }
  res.json({ ok: true })
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
