;(function(window,$,undefined){
	
	// use the first element that is "scrollable"
	function scrollableElement(els) {
	  for (var i = 0, argLength = arguments.length; i <argLength; i++) {
	    var el = arguments[i],
		$scrollElement = $(el);
	    if ($scrollElement.scrollTop()> 0) {
	      return el;
	    } else {
	      $scrollElement.scrollTop(1);
	      var isScrollable = $scrollElement.scrollTop()> 0;
	      $scrollElement.scrollTop(0);
	      if (isScrollable) {
		return el;
	      }
	    }
	  }
	  return els[els.length-1];
	}
	
	$(function(){
		$('#main')
		.on({
			mouseenter: function(e){
				var $this = $(this);
				$this.addClass('on').stop().animate({
					width: $('#container').innerWidth() - 2*$this.offset().left
				}, 300);
			},
			mouseleave: function(e){
				var $this = $(this);
				$this.removeClass('on').stop().animate({
					width: $this.parent().innerWidth()
				}, 300, function(){
					$this.css('width','auto');
				});
			}
		}, '.geshi');
		
		$('#sidebar').on({
			click: function(e){
				e.preventDefault();
				$(scrollableElement('html', 'body')).animate({
					scrollTop: 0
				}, 400);
			}
		},'.backToTop a');
		
		//mobile scroll
		if(window.iScroll){
			$('#main .geshi').each(function(){
				//$(this).add($(this).find('code')).css({overflow: 'visible'});
				new iScroll(this, { hScroll: true, vScroll: true, bounce: true, hScrollbar: false, vScrollbar: false });
			});
		} else if(Modernizr.touch){
			$('pre code').css('white-space','normal');
		}
		
		//youtube embeds
		$('.youtube').each(function(){
			var $this = $(this)
			  , url = $this.attr('data-src')
			  ;
			if(url && url.length){
				$this.append('<iframe src="'+url+'" frameborder="0" allowfullscreen></iframe>');
			}
		});
		
		var resizeYT = $('.youtube iframe');
		function resizeYTFrames(){
			var w = $('#main article .content').innerWidth();
			resizeYT.attr('width',w);
			resizeYT.attr('height',w*3/4);
		}
		resizeYTFrames();
		$(window).on('resize', resizeYTFrames);
		
		//mathtex setup
		$('img[src=math]').each(function(){
			var $this = $(this);
			var math = $this.attr('alt');
			$this.attr('src','http://www.forkosh.com/mathtex.cgi?'+math);
			$this.attr('title',math);
		});
		
		// mobile scroll to content if not first visit within 24 hours
		if(Modernizr.mq('only screen and (max-width: 767px)') &&
		   Modernizr.localstorage
		  ){
			if(localStorage['wellcaff_visited'] &&
			   localStorage['wellcaff_visited'].length &&
			   parseInt(localStorage['wellcaff_visited']) > (new Date()).getTime()
			){
				setTimeout(function(){
					$('body').animate({
						scrollTop: $('#container > .outer').offset().top
					}, 400);
				},500);
			} else {
				localStorage['wellcaff_visited'] = ''+((new Date()).getTime()+60*60*24*1000);
			}
		}
	});
})(this, jQuery);