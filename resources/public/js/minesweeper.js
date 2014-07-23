(function () {
	var level;

	$('#hof-register').click(function(event) {
		
		function displayHallOfFame() {
			$('#hof-list').empty();
			$('#hof-load-message').removeClass('hidden');
	    	$('#hof-list-block').removeClass('hidden');
			$.getJSON('/hof/'+level, function(hof) {
				$('#hof-load-message').addClass('hidden');
	    		$.each(hof, function(rowkey, rowval) {
	    			$('#hof-list').append('<li>' + rowval.points + ' ' + rowval.nick + '</li>')
	    		})
	    	})
		}
		
		$('#hof-register-message').removeClass('hidden')
		$.ajax({
		    type: "POST",
		    url: "/result",
		    data: JSON.stringify({nick: $('#nick').val()}),
		    contentType: "application/json; charset=utf-8",
		    dataType: "json",
		    success: function(response){
				$('#hof-register-message').addClass('hidden')
		    	$('#hof-register-block').addClass('hidden');
		    	if (response) {
		    		$('#rank').html('Your game ranks as number ' + response.rank)
		    	}
		    	displayHallOfFame()
		    }
		})
	})
	
	$('#start-game').click(function(event) {
		level = $('#level').val();
		
		$('#game-block').removeClass('hidden');
		$('#board').empty();
		$('#status').html('<i>loading...</i>');
		$('#message').html('&nbsp;');
		$('#hof').addClass('hidden');
		$('#hof-register-block').addClass('hidden');
		$('#hof-list-block').addClass('hidden');
		$('#hof-load-message').addClass('hidden');
		$('#hof-register-message').addClass('hidden');
		$('#rank').empty();
		$('#message').removeClass();
		
		$.getJSON('/new/'+level, function(board) {
			
			function squareText(square) {
				return square.mines || (square.state == "questioned" ? '?' : '&nbsp;')
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
			
			function register() {
				$('#hof').removeClass('hidden');
				$('#hof-register-block').removeClass('hidden');
				$('#nick').val(board.nick);
			}
	
			$.each(board.squares, function(rowkey, rowval) {
				$('#status').html('<i>click any square to begin!</i>');
				$('#board').append('<div id="row' + rowkey + '">');
				$.each(rowval, function (squarekey, square) {
					$('#row' + rowkey).append(squareHtml(square));
					$('#' + square.id).mousedown(function(event) {
						$.getJSON('/move/' + square.id + '/' + action(event), function(board) {
							$.each(board.squares, function(rowkey, rowval) {
								$.each(rowval, function(squarekey, square) {
									$('#' + square.id).html(squareText(square)).removeClass().addClass(squareClasses(square))
								})
							});
							$('#status').html('(secs: ' + board.seconds + ', moves: ' + board['number-of-moves'] + ', remaining: ' + board.remaining + ')')
							if (board['game-state'] == 'lost') {
								$('#message').html('Sorry, you blew yourself to smithereens :(').addClass('lost');
								$('.square').off();
							}
							else if (board['game-state'] == 'won') {
								$('#message').html('CONGRATS!!! - ' + board.points + ' points').addClass('won');
								$('.square').off();
								if (board.hof) {
									register()
								}
							}
						})
					})
				})
			})
		})
	})
}())