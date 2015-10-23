/* global process */
var config = {};

// Using https://devcenter.heroku.com/articles/config-vars
// For local: https://devcenter.heroku.com/articles/heroku-local#set-up-your-local-environment-variables

config.bot_debug_mode = (process.env.BOT_DEBUG_MODE || 'true') !== 'false'; // Set to string 'true' or 'false' 
																			// If 'true' sends telegram messages to one specified private chat (below)

config.bot_invocation_path = process.env.BOT_INVOCATION_PATH || 'secret-bot-path'; // Best to change, then set cron to call 'your-server.com/secret-bot-path'

config.telegram = {};
config.telegram.token = process.env.TELEGRAM_TOKEN || 'your-telegram-bot-token';
config.telegram.debug_chat = process.env.TELEGRAM_DEBUG_CHAT || 'your-chat-with-bot-id'; // Used if config.debug_mode == true

config.instagram = {}; 
config.instagram.token = process.env.INSTAGRAM_TOKEN || 'your-instagram-api-token';
config.instagram.tag = process.env.INSTAGRAM_TAG || 'AlphaTopic';
config.instagram.max_media_count = process.env.INSTAGRAM_MAX_MEDIA_COUNT || 5; // Limits how many media will be retrieved / posted to the chat
config.instagram.max_time_difference = process.env.INSTAGRAM_MAX_TIME_DIFF || 12 * 60 * 60 * 1000; // milliseconds, set to how often the bot runs (12 hours)
 
module.exports = config;