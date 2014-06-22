$.getJSON('/new/9/9/12', function(board) {
	
	function squareClasses(square) {
		return 'square m' + square.mines + ' ' + square.state
	}
	
	function squareHtml(square) {
		return '<span id="' + square.coord + '" class="' + squareClasses(square) + '">' + square.mines + '</span>'
	}
	
	function action(event) {
		return event.which == 3 ? 'flag' : 'explore'
	}
	
	$.each(board.squares, function(rowkey, rowval) {
		$('#board').append('<div id="row' + rowkey + '">');
		$.each(rowval, function (squarekey, square) {
			$('#row' + rowkey).append(squareHtml(square));
			$('#' + square.coord).mousedown(function(event) {
				$.getJSON('/move/' + square.coord + '/' + action(event), function(board) {
					$.each(board.squares, function(rowkey, rowval) {
						$.each(rowval, function(squarekey, square) {
							$('#' + square.coord).html(square.mines).removeClass().addClass(squareClasses(square))
						})
					});
					$('#seconds').html('(' + board.seconds + ' secs)')
					if (board.state == 'lost')
						$('#message').html('Sorry, you blew yourself to smithereens :(');
					else if (board.state == 'won')
						$('#message').html('CONGRATS!!!');
				})
			})
		})
	})
});
