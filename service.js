const OracleBot = require('@oracle/bots-node-sdk');
const { WebhookClient, WebhookEvent } = OracleBot.Middleware;
const bodyParser = require('body-parser');
const { dialogflow } = require('actions-on-google');
const assistant = dialogflow();

module.exports = (app) => {
  const logger = console;
  OracleBot.init(app, {
    logger,
  });

  const webhook = new WebhookClient({
    channel: {
      url: 'https://botv2iad1I0100H203896bots-mpaasocimt.botmxp.ocp.oraclecloud.com:443/connectors/v1/tenants/idcs-100b89d671b54afca3069fe360e4bad4/listeners/webhook/channels/e7e4c1f7-784b-4948-a371-748b81b56ef5',
      secret: '24EuRjctESrmP8x1aduVsSBqrlfEusIm',
    }
  });

  webhook
    .on(WebhookEvent.ERROR, err => logger.error('Error:', err.message))
    .on(WebhookEvent.MESSAGE_SENT, message => logger.info('Message to chatbot:', message))
    .on(WebhookEvent.MESSAGE_RECEIVED, message => logger.info('Message from chatbot:', message))

  
  assistant.intent('Default Fallback Intent', (conv) => {
    logger.info('Got query : ', conv.query);
    const promise = new Promise(function (resolve, reject) {
      const MessageModel = webhook.MessageModel();
      const message = {
        userId: 'anonymous',
        messagePayload: MessageModel.textConversationMessage(conv.query)
      };
      webhook.send(message);
      webhook.on(WebhookEvent.MESSAGE_RECEIVED, message => {
        resolve(message);
      });
    })
      .then(function (result) {
          conv.ask(result.messagePayload.text);
        })
    return promise;
  })
  
  app.post('/bot/message', webhook.receiver());

  app.use('/fulfillment',bodyParser.json(),assistant);
  app.post('/fulfillment', assistant );
}
