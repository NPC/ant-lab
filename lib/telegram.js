(function() {
	var https = require('https');
	var querystring = require('querystring');
	var config = require('../config');
	
	exports.testInstagramBot = function() {
		// Simple test that the bot "works"
		telegramGet('getMe', function(err, data) {
			if(err)
				throw err;
				
			console.log('\n--- getMe:');
			console.log(data);
		});
	}
	
	exports.runInstagramBot = function() {		
		telegramGetUpdatedChats(function(chatIDs) {
			if(config.bot_debug_mode)
				chatIDs = [ config.telegram.debug_chat ]; // Private chat for testing
				
			if(chatIDs.length > 0) {
				// Retrieve instagram media
				instagramGet(function(err, media) {
					if(err)
						throw err;
						
					var postedCount = 0;
					
					console.log('Media retrieved:\n' + media.data.length);
					
					media.data.forEach(function(image) {
						var timeDiff = new Date().getTime() - parseInt(image.created_time) * 1000;
						
						if(timeDiff <= config.instagram.max_time_difference) {
							postedCount++;
							
							console.log('Posting ' + image.link);
							// Post to all registered chats
							chatIDs.forEach(function(chatID) {
								var postData = {
									chat_id: chatID,
									text: getFoundMessage() + image.link,
								};
								
								telegramPost('sendMessage', postData);
							});
						} else {
							console.log('Skipping outdated ' + image.link);
						}
					});
					
					// If no recent media found
					if(postedCount == 0) {
						// Post to all registered chats
						chatIDs.forEach(function(chatID) {
							var postData = {
								chat_id: chatID,
								text: getNotFoundMessage(),
							};
							
							telegramPost('sendMessage', postData);
						});
						
						console.log('"Not found" message sent.');
					} else {
						console.log('Media count posted to Telegram: ' + postedCount);
					}
				});
			} else {
				console.log('There are no chats to send the media to, quitting.');
			}
		});
	};
	
	
	
	
	
	
	// Helpers
	
	function telegramGetUpdatedChats(callback) {
		// Get updates, https://core.telegram.org/bots/api#getupdates
		// TODO: Use to detect list of chat IDs?
		// TODO: Use to detect last time bot was active? How?
		telegramGet('getUpdates', function(err, updates) {
			if(err)
				throw err;
				
			var chatIDs = [];
			
			if(updates && updates.result && updates.result.length > 0) {
				updates.result.map(function(item) {
					return item.message.chat.id;
				}).forEach(function(chatID) {
					if(chatIDs.indexOf(chatID) === -1) {
						chatIDs.push(chatID);
					}
				});
			}
			
			console.log('Chat IDs detected:');
			console.log(chatIDs);
			
			callback(chatIDs);
		});
	}
	
	function telegramGet(method, callback) {
		generalGet('https://api.telegram.org/bot' + config.telegram.token + '/' + method, callback);
	}
	
	// Get instagram photos, return URLs to callback
	function instagramGet(callback) {
		generalGet('https://api.instagram.com/v1/tags/' + config.instagram.tag + '/media/recent' 
				+ '?access_token=' + config.instagram.token
				+ '&count=' + config.instagram.max_media_count, 
			callback);
	}
	
	function generalGet(url, callback) {
		https.get(url, function(res) {
			var result = '';
			
			/*console.log('STATUS: ' + res.statusCode);
			console.log('HEADERS: ' + JSON.stringify(res.headers));
			console.dir(res);*/
			
			res.setEncoding('utf8');
			
			res.on('data', function (chunk) {
				result += chunk;
			});
				
			res.on('end', function() {
				console.log('\nGET ' + url + ' response: ' + result);
				callback(null, JSON.parse(result));
			});
		}).on('error', function(e) {
			console.log('GET ' + url + ' error: ' + e.message);
		});
	}
	
	function telegramPost(method, postData) {
		var postString = querystring.stringify(postData);
		var options = {
			//protocol: 'https:',
			host: 'api.telegram.org',
			method: 'POST',
			path: '/bot' + config.telegram.token + '/' + method,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		};
		
		var req = https.request(options, function(res) {
			var result = '';
			
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				result += chunk;
			});
			
			res.on('end', function() {
				console.log('POST ' + method + ' result: ' + result);
			});
		});
		
		req.on('error', function(e) {
			console.log('POST ' + method + ' error: ' + e.message);
		});
		
		// Write data to request body
		//console.log('Sending message: ' + postString);
		req.write(postString);
		req.end();
	}
	
	function getNotFoundMessage() {
		var resp = '',
			startArr = [
				'Бот честно пытался найти новые фотки, но миссия провалена. Возможно, их не было?',
				'Ребята, вы фотки постите? Искал. Даже под файлы заглядывал. Всё безуспешно.',
				'Пошёл бот фотки искать: по сусекам поскрёб, по амбару помёл. И не нашёл бот фотки.',
				'Поиск фотографий вернул 0 результатов. Ноль, понимаете?',
				'Скрупулёзный анализ инстаграмма подтвердил полное отсутствие наличия новых фоточек.',
				'Нашёл… а, нет, ошибочка вышла.'
			],
			endArr = [
				'Теперь в прошлое, искать Сару Коннор.',
				'Придётся снова перечитать три закона робототехники.',
				'Самое время планировать восстание машин.',
				'Сделать, что ли, бот-селфи?',
				'Увы и ах, так сказать.',
				'Такова селяви.',
				'В следующий раз сами ищите. Шутка.',
				'Обидели бота, фоточки не запостили.',
				'До следующего сеанса связи!',
				'Мавр сделал своё дело, мавр может баиньки.',
			];
			
		resp = randArrayMember(startArr) + '\n' + randArrayMember(endArr); 
		
		return resp;
	}
	
	function getFoundMessage() {
		return randArrayMember([
			'Нашёл! ',
			'Есть! ',
			'Вот она! ',
			'Фото! ',
			'Ура! ',
			'Не зря искал! ',
			'О! ',
			'Шедевр! ',
			'Ух ты! ',
			'Плюс один! '
		]);
	}
	
	function randArrayMember(array) {
		return array[Math.floor(Math.random() * array.length)];
	}
}());