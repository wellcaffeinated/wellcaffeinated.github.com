define(
	
	[
		'jquery',
		
		'plugins/tpl!templates/autocomplete.tpl',
		
		'modules/caret' //jquery plugin
	],
	
	function(
		$,
		template
	){
		/**
		 * Select a portion of text in a text field.
		 *
		 * @private
		 * @function selRange
		 * @param {int} start start index
		 * @param {int} end end index
		 * @param {HTMLInputElement} field the html text input field
		 * @returns {void}
		 */
		function selRange( start, end, field ) {
			
			var newend
				,selRange
				;
		
			if ( field.createTextRange ) {
		
				/* 
				IE calculates the end of selection range based 
				from the starting point.
				Other browsers will calculate end of selection from
				the beginning of given text node.
				*/
		
				newend = end - start;
				selRange = field.createTextRange();
				selRange.collapse(true);
				selRange.moveStart("character", start);
				selRange.moveEnd("character", newend);
				selRange.select();
			} 
		
			/* For the other browsers */
		
			else if ( field.setSelectionRange ){
		
				field.setSelectionRange(start, end);
			}
		}
		
		/**
		 * Get the word closest to position.
		 *
		 * @private
		 * @function getWordPosAt
		 * @param {string} val the string to search (haystack)
		 * @param {int} pos the position to start searching
		 * @return {Object} Start and end position of the word in the input string. ( <return>.start and <return>.end )
		 */
		function getWordPosAt( val, pos ){
			
			var wordStart = pos
				,wordEnd = pos
				;
			
			while ( wordStart > 0 && val[wordStart-1] != ' ' ){
				wordStart--;
			}
			
			while ( wordEnd < val.length && val[wordEnd] != ' ' ){
				wordEnd++;
			}
			
			return {
				
				start: wordStart,
				end: wordEnd
			};
		}
		
		/**
		 * Constructor for an autocompleter.
		 *
		 * @class AutoCompleter
		 * @param {Object} config the config object
		 */
		function AutoCompleter(config){
			
			this.setOptions(config);
			this.init();
			
		}
		
		AutoCompleter.prototype = {
			
			/**
			 * Storage for internal classnames
			 *
			 * @property {Object} classNames
			 */
			classNames: {
				
				input: 'autocomplete-input-box',
				
				selected: 'on'
				
			},
			
			/**
			 * Initialize. Called by constructor.
			 *
			 * @method init
			 * @returns {void}
			 */
			init: function(){
				
				this.cache = {}; // key: query tokens; value: results
				this.to = {}; // container for timeout handles
				this.blacklist = []; //holds blacklisted prefixes
				this.queryData = {}; //holds data about the suggestion query
				
				this.el = $( this.config.el ).first();
				
				if ( !this.el.length ){
					
					throw "HTMLElement for autocomplete not valid.";
				}
				
				this.el
					.attr( 'autocomplete', 'off' ) //turn off native autocomplete
					.addClass( this.classNames.input ) //add classnames
					;
				
				this.url = this.el.attr('data-autocomplete-url');
				
				this.elResults = $('<div class="'+this.config.resultsClassName+'">').hide().css( 'position', 'absolute' );
				
				$( 'body' ).append( this.elResults );
				
				this.enableMouseEvents();
				this.bindEvents();
			},
			
			/**
			 * Parse the config object and set defaults. May be called after init to reset options.
			 *
			 * @method setOptions
			 * @param {Object} config The config object with options set
			 * @returns {void}
			 */
			setOptions: function(config){
				
				this.config = $.extend( this.config || {
					//DEFAULTS
					
					// element to use. MANDATORY. SPECIFY
					el: null,
					
					// submit action. `this` is HTMLInputElement provided.
					submit: $.noop,
					
					// minimum characters to begin autocomplete
					minQueryLength: 0,
					
					// time to wait between keydown and autocomplete
					delay: 400,
					
					// align results box to which side of input?
					align: 'left',
					
					// class name of results container
					resultsClassName: 'autocomplete-results',
					
					// do we want to execute the submit callback on selection (true)? or continue autocompleting (false)?
					submitOnSelect: true,
					
					// if true, putting the key cursor (caret) inside a word will trigger autocomplete on just that word
					usePartialComplete: true,
					
					// if true, when focusing a suggestion in the results box (eg with mouseover or keyboard), the suggestion will appear selected in the textbox
					hintOnFocus: true,
					
					// if true, any query string that returns no results will be added to a blacklist.
					// Any subsequent query that begins with any of the blacklist strings will not trigger an ajax request.
					useBlacklist: true,
					
					// class name of result items
					itemClassName: 'item',
					
					// show action. `this` is html results container
					show: function(){
						
						$(this).show();
					},
					
					// hide action. `this` is html results container
					hide: function(){
						
						$(this).hide();
					}
					
					
				}, config);
				
			},
			
			/**
			 * Position the results container below input, aligned right or left
			 * 
			 * @method positionResults
			 * @return {void}
			 */
			positionResults: function() {
				
				var offset = this.el.offset()
					,align = this.config.align
					;
				
				this.elResults
					.css( 'top', offset.top + this.el.outerHeight() )
					.css( align,
							align === 'left'?
								offset[align] :
								$('body').width() - offset.left - this.el.outerWidth()
						)
					;
			},
			
			/**
			 * Bind key and mouse events.
			 *
			 * @method bindEvents
			 * @return {void}
			 */
			bindEvents: function(){
				
				var self = this;
				
				// events for the input element
				this.el.on({
					
					focus: function(e){
						
						var me = this
							,len
							;
						
						// bugfix for samsung tablet
						setTimeout(function(){
							
							len = me.value.length;
							selRange( len-1, len-1, self.el[0] );
							selRange( len, len, self.el[0] ); //put caret at end 
							
						}, 100);
					},
					
					select: function(e){
						
						// if a selection was made then prevent an annoying autocomplete... the user wants to edit the text... not have us autocomplete
						if ( self.to.activate ){
							
							clearTimeout( self.to.activate );
							self.deactivate();
						}
						
					},
					
					mouseup: function(e){
						
						if ( self.el.val().length > 0 ){
							
							self.doSelect = true;
							self.activate( 20 );
						}
					},
					
					// even if there is a "ghost" mouseup, the timeout clearing will ensure that only one of these is run.
					touchend: function(e){
						
						if ( self.el.val().length > 0 ){
							
							self.doSelect = true;
							self.activate( 20 );
						}
					},
					
					keydown: function(e) {
						
						self.lastKeyPressed = e.keyCode;
						self.doSelect = false;
						
						switch ( self.lastKeyPressed ) {
			
							case 38: // up
								
								if ( self.active ) {
									
									self.focusPrev();
									
								} else {
									
									self.activate( true );
									
								}
								
							break;
			
							case 40: // down
								
								if ( self.active ) {
									
									self.focusNext();
									
								} else {
									
									self.activate( true );
									
								}
								
							break;
			
							case 9: // tab
								
								if ( !self.active ) {
									
									return true;
								}
								
								// true: prevent submit
								self.selectCurrent( true );
								
							break;
			
							case 13: // return
								
								if ( self.active ) {
									
									self.selectCurrent( !self.config.submitOnSelect );
									
								} else {
									
									self.submit();
									
								}
								
							break;
			
							case 27: // escape
								
								if ( !self.active ) {
									
									return true;
								}
								
								// cancel replacement. replace old text
								self.el.val( self.getSuggestQuery().oldText );	
								self.deactivate();
									
							break;
			
							default:
							
								self.activate();
								return true;
			
						}
						
						e.preventDefault();
						return false;
						
					}
				
				});
				
				// events for the results container
				this.elResults.on({
						
						mouseenter: function(e){
							
							if ( self.noMouse ){
								
								return;
							}
							
							if ( self.disableMouseEnter ){
								
								self.disableMouseEnter--;
								return;
							}
							
							// focus item
							self.focusItem( this );
							
						},
						
						click: function(e){
							
							e.preventDefault();
							
							if (self.noMouse){
								return;
							}
							
							// focus item
							self.focusItem( this );
							
							// select suggestion
							self.selectCurrent( !self.config.submitOnSelect );
							self.el.focus();
							
							// disable next # of mouse enter events
							// helps beat ghost events on touch devices
							self.disableMouseEnter = 1;
							
						}
						
					},
					
					'.' + this.config.itemClassName
				);
				
				// close autocomplete on click outside suggestions
				$(document).on( 'click', function(e){
					
					var el = e.target
						;
					
					// not a click inside suggestions
					if ( !self.elResults.is(el) && !self.el.is(el) && !self.elResults.has(el).length ){
						
						self.deactivate();	
					}
					
				});
				
			},
			
			/**
			 * Select the text currently being used as the suggestion query inside the HTMLInputElement
			 *
			 * @method selectSuggestQuery
			 * @returns {void}
			 */
			selectSuggestQuery: function(){
				
				var self = this
					,data = self.getSuggestQuery()
					;
				
				// This solves a weird android bug that shows up when a portion of input text is selected by JS.
				// The selection will be made behind the scenes but the user won't see any "selection" made.
				// To fix it we select something, then wait a small time and select what we actually want.
				selRange( data.start, data.start+1, this.el[0] );
				
				setTimeout(function(){
					
					selRange( data.start, data.end, self.el[0] );
				}, 10);
				
			},
			
			/**
			 * Get data about the query that should be used to request for autocomplete suggestions.
			 * The query will be the that the key cursor (caret) is inside or if caret is at end,
			 * the query will be whole string in the input. The results are cached until they are forced to refresh
			 * by a new autocomplete activation call.
			 *
			 * @method getSuggestQuery
			 * @param {boolean} refresh if true the text to use for a query will be recalculated
			 * @returns {Object} The information about the query string.
			 * 		<return>.query is the query to use,
			 * 		<return>.oldText is the text originally inside the input element,
			 * 		<return>.start is the start index of the query string inside oldText
			 * 		<return>.end is the end index of the query string inside oldText
			 * 		
			 */
			getSuggestQuery: function( refresh ){
				
				if( !refresh ){
					
					return this.queryData; // cached
				}
				
				var startPos = this.el.caret().start
					,val
					,pos
					;
					
				this.queryData.oldText = this.el.val();
				
				val = this.queryData.oldText.replace(/\s+$/,''); //right trim
				
				if ( !this.config.usePartialComplete || startPos >= val.length ){
					
					this.queryData.start = 0;
					this.queryData.end = this.queryData.oldText.length;
					
					this.queryData.query = val;
					
				} else {
				
					pos = getWordPosAt( val, startPos );
					
					this.queryData.start = pos.start;
					this.queryData.end = pos.end;
					
					this.queryData.query = val.substring( pos.start, pos.end );
				}
				
				return this.queryData;
			},
			
			/**
			 * Start autocompleting, with or without a cancellable delay.
			 *
			 * @method activate
			 * @param noTimeout if true, don't use a timeout; perform autocomplete immediately.
			 * @returns {void}
			 */
			activate: function( noTimeout ){
				
				var self = this
					;
				
				if ( self.to.activate ){
					
					clearTimeout( self.to.activate );
				}
				
				function callback(){
					
					var value = self.getSuggestQuery( true ).query
						;
					
					self.focusedItem = -1;
					
					if ( value.length > self.config.minQueryLength ){
						
						self.fetchResults( value, function( results ){
							
							if ( results ){
								
								self.showResults( results, value );
							}
							
						});
						
					}
				}
				
				self.ajaxRequest && self.ajaxRequest.abort();
				
				if ( noTimeout === true ){
					
					callback();
				
				} else {
					
					// use specified timeout (noTimeout) if applicable
					self.to.activate = setTimeout( callback, noTimeout || self.config.delay );
				
				}
			},
			
			/**
			 * Hide results.
			 *
			 * @method deactivate
			 * @returns {void}
			 */
			deactivate: function(){
				
				this.focusedItem = null;
				this.hideResults();
				
			},
			
			/**
			 * Ajax request for the suggestion results.
			 *
			 * @method fetchResults
			 * @param {string} value The query string to use for autocomplete.
			 * @param {function(results)} callback A callback function to be called when results are received. Should accept JSON results (or false on error) as parameter.
			 * @returns {void}
			 */
			fetchResults: function( value, callback ){
				
				var self = this
					,content = self.cache[ value ]
					;
				
				if ( content ){
					
					callback( content );
					
				} else {
					
					if ( self.isBlacklisted(value) ){
						
						self.deactivate();
						return;
					}
					
					self.ajaxRequest = $.ajax({
						
						url: self.url + (self.url.indexOf('?') !== -1 ? '&' : '?') + encodeURIComponent(self.el.attr('name')) + '=' + encodeURIComponent(value),
						
						dataType: 'json',
						
						success: function( data ){
							
							// Need extra preprocessing? add it here.
							content = data;
							
							self.cache[ value ] = content;
							
							callback( content );
							
						},
						
						error: function(){
							
							callback( false );
							
						}
						
						
					});
					
				}
				
			},
			
			/**
			 * Answer whether or not specified query is blacklisted; IE: should not be used for further autocompletion requests.
			 *
			 * @method isBlacklisted
			 * @param {string} query the query string to test.
			 * @returns {boolean}
			 */
			isBlacklisted: function(query){
				
				if ( this.config.useBlacklist === false ){
					
					return false;
				}
				
				for ( var i in this.blacklist ){
					
					// is query prefixed by a previously blacklisted query
					if ( query.indexOf( this.blacklist[i] ) === 0 ){
						
						return true;
					}
					
				}
				
				return false;
			},
			
			/**
			 * Render and show the results using the mustache template.
			 *
			 * @method showResults
			 * @param {Object} results the JSON results for autocompletion.
			 * @param {string} query the query used to request the results.
			 * @returns {void}
			 */
			showResults: function( results, query ){
				
				var self = this
					;
				
				// mustache rendering
				self.elResults.html( template.render( results ) );
				
				if ( results && self.elResults.find( '.'+self.config.itemClassName ).length === 0 ){
					
					// oops. no results
					// blacklist if applicable
					if ( self.config.useBlacklist ){
						
						self.blacklist.push( query );
						
					}
					
					self.deactivate();
					return;
				}
				
				self.positionResults();
				
				// Select individual word if allowed to
				if ( self.doSelect && query !== self.el.val().replace(/\s+$/,'') ){
				
					self.selectSuggestQuery();
				}
				
				self.config.show.apply( self.elResults[0] );
				
				self.active = true;
				
			},
			
			/**
			 * Hide the results container
			 *
			 * @method hideResults
			 * @returns {void}
			 */
			hideResults: function(){
				
				var self = this
					;
				
				self.config.hide.apply( self.elResults[0] );
				
				self.active = false;
			},
			
			/**
			 * Execute submit action.
			 *
			 * @method submit
			 * @returns {void}
			 */
			submit: function(){
				
				this.config.submit.apply( this.el[0] );
			},
			
			/**
			 * Focus on the next result.
			 *
			 * @method focusNext
			 * @returns {void}
			 */
			focusNext: function(){
				
				this.focusItem( this.focusedItem + 1 );
			},
			
			/**
			 * Focus on the previous result.
			 *
			 * @method focusPrev
			 * @returns {void}
			 */
			focusPrev: function(){
				
				this.focusItem( this.focusedItem - 1 );
			},
			
			/**
			 * Focus on the specified result or one with index `n`.
			 *
			 * @method focusItem
			 * @param {mixed} n Either the numerical index of the result, or the html element for the result.
			 * @returns {void}
			 */
			focusItem: function( n ){
				
				var $items = this.elResults.find( '.'+this.config.itemClassName )
					,$item
					;
				
				if ( typeof n === 'number' ){
					
					if ( n < 0 ){
						
						n = 0;
					} else if ( n >= $items.length ){
						
						n = $items.length - 1;
					}
					
					$item = $items.eq( n );
					
				} else {
					
					$item = $(n);
					
				}
				
				$items.removeClass( this.classNames.selected );
				
				$item.addClass( this.classNames.selected );
				
				this.focusedItem = $item.index();
				
				if ( this.config.hintOnFocus ){
					
					this.hintSuggestion();
				}
				
			},
			
			/**
			 * Place the text for the current suggestion inside input box with the autocompleted text highlighted, but don't perform another autocomplete.
			 * This is used to hint to the user what the autocompleted text would be if they performed a selection.
			 *
			 * @method hintSuggestion
			 * @returns {void}
			 */
			hintSuggestion: function(){
				
				var $item
					,sug
					,len
					,qd = this.getSuggestQuery()
					,val = ''
					,i = 0
					;
				
				if( this.focusedItem >= 0 ){
					
					$item = this.elResults.find( '.' + this.config.itemClassName + ':eq('+this.focusedItem+')' );
					
					// is there a suggestion part or should we just use the item text?
					sug = $item.find('.sug');
					
					val = sug.length? sug.text() : $item.text(); // get suggested text
					len = val.length; // length of suggestion
					
					// set new value
					this.el.val( qd.oldText.replace( qd.query, val ) ); // replace suggest target with suggested text
					
					// compare query and suggestion and find where they start to differ
					while( i < val.length && qd.query[i] === val[i] ){
						
						i++;
					}
					
					selRange( qd.start + i, qd.start + len, this.el[0] );
					
				}
			},
			
			/**
			 * Use the currently selected autocompletion and (depending on config) do submit action or keep autocompleting.
			 *
			 * @method selectCurrent
			 * @param {boolean} preventSubmit If true, the submit action will not happen.
			 * @returns {void}
			 */
			selectCurrent: function( preventSubmit ){
				
				var $item
					,sug
					,qd = this.getSuggestQuery()
					,val = ''
					;
				
				if( this.focusedItem >= 0 ){
					
					$item = this.elResults.find( '.' + this.config.itemClassName + ':eq('+this.focusedItem+')' );
					
					// is there a suggestion part or should we just use the item text?
					sug = $item.find('.sug');
					
					
					val = sug.length? sug.text() : $item.text(); // get suggested text
					val = qd.oldText.replace( qd.query, val ).replace(/\s+$/,''); // replace suggest target with suggested text
					val += preventSubmit? ' ' : ''; // extra space if we want to keep the autocomplete going
					
					// set new value
					this.el.val( val );
					
					if ( preventSubmit ){
						
						this.activate( true );
						return;
					}
					
				}
				
				this.deactivate();
				
				this.submit();
				
			},
			
			/**
			 * Disable mouse interactions.
			 *
			 * @method disableMouseEvents
			 * @return {void}
			 */
			disableMouseEvents: function(){
				
				this.noMouse = true;
			},
			
			/**
			 * Enable mouse interactions.
			 *
			 * @method enableMouseEvents
			 * @return {void}
			 */
			enableMouseEvents: function(){
				
				this.noMouse = false;
			}
			
			
		};
		
		/**
		 * Factory function to create autocompleting input elements.
		 *
		 * @function factory
		 * @param {object} The configuration object for autocompletion.
		 * @returns {AutoCompleter}
		 */
		function factory(config){
			
			return new AutoCompleter(config);			
		}
		
		return factory;
	}
);