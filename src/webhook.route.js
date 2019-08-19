const express = require('express');
const axios = require('axios');

const wh = express.Router();
const { PAGE_ACCESS_TOKEN } = process.env;
const themes = ['Esportes', 'Politica', 'Entretenimento', 'Famosos'];

const Story = require('../db/Story');

function sendMessage(req, cb) {
  axios({
    method: 'post',
    url: 'https://graph.facebook.com/v4.0/me/messages',
    params: {
      access_token: PAGE_ACCESS_TOKEN,
    },
    data: req,
  }).then((res) => {
    console.log(`Message sent: ${req.message}`);
    if (cb) cb();
  }).catch((err) => {
    console.log(err.response.data);
  });
}

function sendQuickReplies(sender) {
  const req = {
    recipient: {
      id: sender,
    },
    message: {
      text: 'Oi! Que tipo de noticias voce gostaria de receber?',
      quick_replies: themes.map((s) => ({ content_type: 'text', title: s, payload: s })),
    },
  };

  sendMessage(req);
}


function handleQuickReply(sender, quickReply) {
  const requestTheme = quickReply.payload;
  Story.find({ theme: requestTheme }, (error, data) => {
    const req = {
      recipient: {
        id: sender,
      },
    };

    let cb;

    if (error) {
      console.log(error);
      req.message = {
        text: 'Um erro ocorreu, por favor tente novamente.',
      };
    } else {
      console.log(data);
      if (data.length) {
        req.message = {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'generic',
              elements: data.map((d) => {
                return {
                  title: d.title,
                  subtitle: d.description,
                  image_url: d.imgUrl,
                  buttons: [
                    {
                      type: 'web_url',
                      url: d.linkUrl,
                      title: 'Link',
                    },
                  ],
                };
              }),
            },
          },
        };
      } else {
        req.message = {
          text: 'Desculpe, nao temos noticias sobre esse tema.',
        };
        cb = sendQuickReplies(sender);
      }
    }

    sendMessage(req, cb);
  });
}

// Handles messages events
function handleMessage(sender, msg) {
  if (msg.quick_reply) {
    console.log('foi resposta');
    handleQuickReply(sender, msg.quick_reply);
  } else {
    sendQuickReplies(sender);
  }
}

wh.route('/').post((req, res) => {
  const { body } = req;

  if (body.object === 'page') {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach((entry) => {
      // Gets the message. entry.messaging is an array, but
      // will only ever contain one message, so we get index 0
      const webhookEvent = entry.messaging[0];
      console.log(webhookEvent);

      const senderPSID = webhookEvent.sender.id;
      console.log(`Sender PSID: ${senderPSID}`);

      if (webhookEvent.message) {
        handleMessage(senderPSID, webhookEvent.message);
      } else if (webhookEvent.postback) {
        handlePostback(senderPSID, webhookEvent.postback);
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.status(404).send();
  }
});

wh.route('/').get((req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'random_string';

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

module.exports = wh;
