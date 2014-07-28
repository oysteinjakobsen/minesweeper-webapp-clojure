$(document).ready(function () {
	function hofRowHtml(rowval) {
		return '<div class="hof-entry">' +
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
	
	function startGame() {
		$('#board').empty();
		$('#message').removeClass().html('&nbsp;');
		$('#game-progressbar').show();
		$('#show-hof').hide();
		$.getJSON('/new/'+$('#level').val(), function(board) {
			
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
			
			function squareHtml(square) {
				return '<span id="' + square.id + '" class="' + squareClasses(square) + '">' + squareText(square) + '</span>'
			}
			
			function action(event) {
				return event.which == 3 ? 'flag' : 'explore'
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
			
			function doAction(square, action) {
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
						var message = 'You got ' + board.points + ' points';
						$('#message').html('CONGRATS!!! ' + message).addClass('won');
						if (board.hof) {
							showRegisterDialog(message, board.points, board.nick)
						}
					}
				})
			}
	
			$('#game-progressbar').hide();
			if (board.hof) {
				$('#show-hof').show()
			}
			$.each(board.squares, function(rowkey, rowval) {
				$('#status').html('<i>click any square to begin!</i>');
				$('#board').append('<div id="row' + rowkey + '">');
				$.each(rowval, function (squarekey, square) {
					$('#row' + rowkey).append(squareHtml(square));
					$('#' + square.id).mousedown(function(event) {
						doAction(square, action(event))
					})
				})
			})
		})
	};
	
	$('#start-game').button().click(startGame);
	startGame();
})