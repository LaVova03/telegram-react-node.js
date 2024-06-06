const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const token = '7225393978:AAEJaR_RDwpN_nXzC9oUr-UNm4KrNuM0XHY'; // Замените на ваш токен
const bot = new TelegramBot(token, { polling: true });

app.use(cors());
app.use(bodyParser.json());

const site = 'https://main--storebot.netlify.app/';

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.post('/webhook', (req, res) => {
    const data = req.body;
    console.log('Received data from web app:', data);

    if (!data.chatId || !data.country || !data.street) {
        console.error('Missing required fields in the request body');
        return res.status(400).send('Missing required fields');
    }

    try {
        bot.sendMessage(data.chatId, 'Your location:')
            .then(() => bot.sendMessage(data.chatId, `Country: ${data.country}`))
            .then(() => bot.sendMessage(data.chatId, `Street: ${data.street}`))
            .then(() => {
                console.log('Messages sent successfully');
                res.sendStatus(200);
            })
            .catch(error => {
                console.error('Error sending messages:', error);
                res.sendStatus(500);
            });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.sendStatus(500);
    }
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    console.log('Received message:', msg);

    if (text === '/start') {
        bot.sendMessage(chatId, 'Заполнить форму', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Заполнить форму', web_app: { url: `${site}form` } }]
                ]
            }
        });

        bot.sendMessage(chatId, 'Заходи в наш интернет магазин', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Сделать заказ', web_app: { url: site } }]
                ]
            }
        });
    } else if (!text.includes('Поздравляю с покупкой')) {
        bot.sendMessage(chatId, 'Received your message');
    }
});

app.post('/web-data', async (req, res) => {
    const { queryId, products, totalPrice } = req.body;
    console.log('Received web-data:', req.body);

    if (!queryId || !products || !totalPrice) {
        console.error('Missing required fields in the request body');
        return res.status(400).send('Missing required fields');
    }

    try {
        await bot.answerWebAppQuery(queryId.toString(), {
            type: 'article',
            id: queryId.toString(),
            title: 'Успешная покупка',
            input_message_content: { message_text: 'Поздравляю с покупкой. Сумма: ' + totalPrice }
        });
        console.log('Answer sent successfully');
        return res.status(200).json({});
    } catch (error) {
        console.error('Error answering web app query:', error);
        try {
            await bot.answerWebAppQuery(queryId.toString(), {
                type: 'article',
                id: queryId.toString(),
                title: 'Не удалось приобрести товар',
                input_message_content: { message_text: 'Не удалось приобрести товар' }
            });
        } catch (error2) {
            console.error('Error sending failure message:', error2);
        }
        return res.status(500).json({});
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
