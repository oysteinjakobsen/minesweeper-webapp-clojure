$.getJSON('/new/9/9/12', function(board) {
	
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
	
	$.each(board.squares, function(rowkey, rowval) {
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
						$('#hof').removeClass('hidden');
						$('#hof-register-block').removeClass('hidden');
						$('#hof-register').click(function(event) {
							$.ajax({
							    type: "POST",
							    url: "/result",
							    data: JSON.stringify({nick: $('#nick').val()}),
							    contentType: "application/json; charset=utf-8",
							    dataType: "json",
							    success: function(response){
							    	$('#hof-register-block').addClass('hidden');
							    	$('#hof-list-block').removeClass('hidden');
							    	if (response) {
							    		$('#rank').html('Your game ranks as number ' + response.rank)
							    	}
							    	$.getJSON('/hof/9/9/12', function(hof) {
							    		$.each(hof, function(rowkey, rowval) {
							    			$('#hof-list').append('<li>' + rowval.points + ' ' + rowval.nick + '</li>');
							    		})
							    	})
							    }
							});
							$('#hof-register-block').html('<h4><i>Your application for fame and glory is being processed...</i></h4>')
						})
					}
				})
			})
		})
	})
});
