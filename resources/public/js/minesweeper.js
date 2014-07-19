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
					}
				})
			})
		})
	})
});
