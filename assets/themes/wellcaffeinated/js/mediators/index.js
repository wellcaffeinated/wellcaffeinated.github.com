define(
    
    [
        'jquery',
        'require',
        'bootstrap-affix',
        'bootstrap-typeahead'
    ],
    
    function( 
		$,
		require,
		_affix,
		_typeahead
	) {
			
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

		function formatResults(data){

			var results = []
				,item
				;

			for ( var i = 0, l = data.length; i < l; ++i ){
				
				item = data[i];

				if (item){

					results.push(
						'<span class="title" data-url="'+ encodeURIComponent(item.url) +'">' + item.title + '</span>' +
						(item.tags? '<span class="tags"><span class="tag">' + item.tags.join('</span><span class="tag">') + '</span></span>' : '')
					);
				}
			}

			return results;
		}

		var searchData;
		function getSearchResults(query, callback){

			if (searchData){

				callback(formatResults(searchData));

			} else {

				require(['json!/search.json'], function(data){

					searchData = data;
					callback(formatResults(searchData));
				});
			}
		}

		$(function(){
			
			// code container grow
			$('#main')
			.on({
				mouseenter: function(e){

					var $this = $(this);
					if (!$this.children('code').length) return;

					$this.addClass('on').stop().animate({
						width: $('#container').innerWidth() - 2*$this.offset().left
					}, 300);
				},
				mouseleave: function(e){
					
					var $this = $(this);
					if (!$this.children('code').length) return;

					$this.removeClass('on').stop().animate({
						width: $this.parent().innerWidth()
					}, 300, function(){
						$this.css('width','auto');
					});
				}
			}, 'pre');

			//back to top button
			$('#sidebar').on({
				click: function(e){
					e.preventDefault();
					$(scrollableElement('html', 'body')).animate({
						scrollTop: 0
					}, 400);
				}
			},'.backToTop a');
			
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

			var $nav = $('#nav-area');

			$nav
				.wrap( $('<div/>').css('height', $nav.height()) )
				.affix({
					offset: {
						top: function(){
							return $('#header').height();
						}
					}
				});

			$('#search-box').typeahead({
				source: function(query, callback){

					getSearchResults(query, callback);
				},
				updater: function(item){
					
					var url = $(item).filter('.title').data('url');
					if (url){

						url = unescape( url );
						window.location.pathname = url;
					}
				}
			});
		});
	}
);
