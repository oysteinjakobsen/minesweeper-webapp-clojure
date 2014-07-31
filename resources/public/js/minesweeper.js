$(document).ready(function () {
	var moves;
	var timeout;
	
	function hofRowHtml(rowval) {
		return '<div id="' + rowval.id + '" class="hof-entry">' +
			'<div class="hof-cell hof-points">' + rowval.points + '</div>' +
			'<div class="hof-cell hof-nick">' + rowval.nick + '</div></div>'
	}
	
	function displayHallOfFame(level) {
		$('#hof-list').empty();
		$('#ranking-list').empty();
		$('#hof-progressbar').show();
		$('#ranking-progressbar').show();
		$.getJSON('/hof/'+level, function(hof) {
			$('#hof-progressbar').hide();
			if (hof.length > 0) {
	    		$.each(hof, function(rowkey, rowval) {
	    			$('#hof-list').append(hofRowHtml(rowval))
	    		});
	    		$('#hof-list .hof-entry').click(function() {
	    			showReplayDialog(this.id)
	    		}).hover(function() {
	    	        $(this).addClass('hof-entry-selected');
	    	    },function() {
	    	        $(this).removeClass('hof-entry-selected');
	    	    })
			} else {
				$('#hof-list').append("no data")
			}
    	});
		$.getJSON('/ranking/'+level, function(hof) {
			$('#ranking-progressbar').hide();
			if (hof.length > 0) {
	    		$.each(hof, function(rowkey, rowval) {
	    			$('#ranking-list').append(hofRowHtml(rowval))
	    		})
			} else {
				$('#ranking-list').append("no data")
			}
    	})
	}
	
	$('#level').selectmenu();
	$('.progressbar').hide().progressbar({value: false});
	$('#hof-register-block').hide();
	$('#hof-list-block').hide();
	$('#replay-confirm').hide();

	$('#show-hof').button().click(function(event) {
		$('#hof-list-block').dialog({modal: true, width: 'auto'});
		displayHallOfFame($('#level').val())
	});
	
	function registerScore() {
		$('#game-progressbar').show();
		$.ajax({
		    type: "POST",
		    url: "/result",
		    data: JSON.stringify({nick: $('#nick').val()}),
		    contentType: "application/json; charset=utf-8",
		    dataType: "json",
		    success: function(response){
				$('#game-progressbar').hide();
		    	if (response) {
		    		$('#message').html('Your game ranks as number ' + response.rank + '!')
		    	}
		    }
		})
	}
	
	function setTimeoutForNextMove(board) {
		if (moves.length == 0) return;
		
		var move = moves.shift();
		var square = $('#'+move[0]).get(0);
		var action = move[1];
		var millis = Math.max(0, Math.round((move[2]-(board.seconds || 0))*1000));
		
		timeout = setTimeout(function() {
			$(square).effect('highlight', 'fast');
			doAction(board, square, action)
		}, millis)
	}
	
	function showReplayDialog(id) {
		$('#replay-confirm').dialog({
			modal: true,
			width: 'auto',
			buttons: {
		        'Yes!': function() {
		        	$(this).dialog('close');
		        	$('#hof-list-block').dialog('close');
		        	replayGame(id)
		        },
		        'No thanks': function() {
		        	$(this).dialog('close')
		        }
		    }
		})
	}
	
	function replayGame(id) {
		$('#board').empty();
		$('#message').removeClass().html('&nbsp;');
		$('#game-progressbar').show();
		$('#show-hof').hide();
		$.getJSON('/replay/' + id, function(game) {
			renderBoard(game.board);
			moves = game.moves;
			setTimeoutForNextMove(game.board)
		})
	}
	
	function squareText(square) {
		return square.mines || (square.state == 'questioned' ? '?' : '&nbsp;')
	}
	
	function squareClasses(square) {
		var classes = 'square ' + square.state;
		if (!isNaN(squareText(square))) {
			classes += ' m' + squareText(square)
		}
		return classes;
	}
	
	function showRegisterDialog(message, points, nick) {
		$('#hof-register-block').dialog({
			modal: true,
			width: 'auto',
			title: message,
			buttons: {
		        'Register your score': function() {
		        	registerScore();
		        	$(this).dialog('close')
		        },
		        'No thanks': function() {
		        	$(this).dialog('close')
		        }
		    }
		});
		$('#nick').val(nick)
	}
	
	function doAction(board, square, action) {
		$.getJSON('/move/' + square.id + '/' + action, function(board) {
			$.each(board.squares, function(rowkey, rowval) {
				$.each(rowval, function(squarekey, square) {
					$('#' + square.id).html(squareText(square)).removeClass().addClass(squareClasses(square))
				})
			});
			
			$('#status').html('Secs: ' + board.seconds.toFixed(1) + ' - Moves: ' + board['number-of-moves'] + ' - Remaining: ' + board.remaining)
			if (board['game-state'] == 'lost') {
				$('#message').html('Sorry, you blew yourself to smithereens :(').addClass('lost');
				$('.square').off()
			}
			else if (board['game-state'] == 'won') {
				$('.square').off();
				var message = board.replay ? 'Hope you enjoyed the show' : 'You got ' + board.points + ' points';
				$('#message').html('CONGRATS!!! ' + message).addClass('won');
				if (board.hof && !board.replay) {
					showRegisterDialog(message, board.points, board.nick)
				}
			}
			if (board.replay) {
				setTimeoutForNextMove(board)
			}
		})
	}
	
	function renderBoard(board) {
		
		function squareHtml(square) {
			return '<span id="' + square.id + '" class="' + squareClasses(square) + '">' + squareText(square) + '</span>'
		}
		
		function action(event) {
			return event.which == 3 ? 'flag' : 'explore'
		}

		$('#game-progressbar').hide();
		if (board.hof) {
			$('#show-hof').show()
		}
		$.each(board.squares, function(rowkey, rowval) {
			if (board.replay) {
				$('#status').html('<i>preparing replay...</i>')
			} else {
				$('#status').html('<i>click any square to begin!</i>')
			}
			$('#board').append('<div id="row' + rowkey + '">');
			$.each(rowval, function (squarekey, square) {
				$('#row' + rowkey).append(squareHtml(square));
				if(!board.replay) {
					$('#' + square.id).mousedown(function(event) {
						doAction(board, square, action(event))
					})
				}
			})
		})
	}

	function startGame() {
		$('#board').empty();
		$('#message').removeClass().html('&nbsp;');
		$('#game-progressbar').show();
		$('#show-hof').hide();
		if (timeout) {
			clearTimeout(timeout);
			timeout = null;	
		}
		$.getJSON('/new/'+$('#level').val(), renderBoard)
	}
	
	$('#start-game').button().click(startGame);
	startGame();
})