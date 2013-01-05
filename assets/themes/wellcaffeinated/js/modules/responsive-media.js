/**
 * Based on the work by Nicholas C. Zakas
 *
 * http://www.nczonline.net/blog/2012/01/19/css-media-queries-in-javascript-part-2/
 *
 */
define(
	// Requirements
    [
		'jquery',
		'./pubsub',
		'plugins/domReady!'
	],
	// Init
	function($, pubsub) {
		
		/*
		 * Copyright (c) 2010 Nicholas C. Zakas. All rights reserved.
		 * http://www.nczonline.net/
		 */
		
		/**
		 * Media module
		 * @module media
		 */
		
		//-------------------------------------------------------------------------
		// Private variables
		//-------------------------------------------------------------------------
		
		var channel = '/responsive/media' //pubsub prefix
		  , psList = {} // list of cached pubsubs
		  , mediaList   = {}                   //list of media queries to track
		  , wasMedia    = {}                   //state of media queries when last checked
		  , win         = window         //window reference
		  , matchMedia  = win.matchMedia || win.msMatchMedia //native matchmedia support
		  , div                                //HTML element used to track media queries
		  , style                              //HTML element used to inject style rules
		  , nativeListenerSupport = !!matchMedia //determines native listener support
		  ;
		
		//-------------------------------------------------------------------------
		// Private functions
		//-------------------------------------------------------------------------
		
		if ( !nativeListenerSupport ) {

			//resize is really the only thing to monitor for desktops
			$(win).on('resize', function() {
				
				var query
				  , medium
				  , isMatch
				  , wasMatch
				  ;
					
				for ( query in mediaList ) {
					
					if ( mediaList.hasOwnProperty(query) ) {
						
						medium = mediaList[query];
						wasMatch = wasMedia[query];
						isMatch = matches(query);
						
						if ( isMatch !== wasMatch ) {
							
							connect.publish(query, [{ 
								media: query, 
								matches: isMatch 
							}]);
						}
					}
				}        
			});
		}
		
		//-------------------------------------------------------------------------
		// Public interface
		//-------------------------------------------------------------------------
		
		/**
		 * Determines if a given media query is currently valid.
		 * @param {String} query The media query to test.
		 * @return {Boolean} True if the query is valid, false if not.
		 */
		function matches( query ){
		
			var result = false;
			
			if ( nativeListenerSupport ) {
				
				result = matchMedia( query ).matches;
				
			} else {
		    
				//if the <div> doesn't exist, create it and make sure it's hidden
				if ( !div ){
					
					div = win.document.createElement('div');
					div.id = 'matchmedia-m-1';
					div.style.cssText = 'position:absolute;top:-1000px';
					win.document.body.insertBefore( div, win.document.body.firstChild );
					
				}
			
				div.innerHTML = '_<style media="' + query + '"> #matchmedia-m-1 { width: 1px; }</style>';
				div.removeChild( div.firstChild );
				result = div.offsetWidth == 1;
			}
			
			wasMedia[ query ] = result;
			return result;
		};
		
		/**
		 * Allows you to specify a listener to call when a media query becomes
		 * valid for the given page.
		 * @param {String} query The media query to listen for.
		 * @param {Function} listener The function to call when the query becomes valid.
		 * @return {void} 
		 * @method subscribe
		 */
		function subscribe( query, listener ) {
			
			var ps;
			
			if ( !psList[ query ] ){
				psList[ query ] = pubsub( channel + '/' + query );
			}
			
			ps = psList[ query ];
			
			if ( nativeListenerSupport && !mediaList[ query ] ) {
			    
				/**
				 * Chrome/Safari are strange. They only track media query changes if
				 * there are media queries in CSS with at least one rule. So, this
				 * injects a style into the page so changes are tracked.
				 */
				if ( $.browser.webkit ) {
					
					if ( !style ) {
						
						style = win.document.createElement( 'style' );
						win.document.getElementsByTagName( 'head' )[0].appendChild( style );
					}
					
					style.appendChild( win.document.createTextNode( '@media ' + query + ' { .-matchmedia-m {} }' ) );
				}
			
				//need to cache MediaQueryList or else Firefox loses the event handler
				mediaList[query] = matchMedia( query );
				mediaList[query].addListener( function(mql) {
					
					ps.publish({
						
						media: query,
						
						matches: mql.matches
					
					});
				});
			}
		    
			//track that the query has a listener
			if ( !mediaList[query] ) {
				
				mediaList[query] = 1;
				
			}
			    
			//in all cases, use a custom subscribe for managing
			ps.subscribe( listener );
		}
		
		/**
		 * Facade for unsubscribe.
		 * @param {Function} listener The handle returned from the subscribe call.
		 * @return {void}
		 * @method unsubscribe
		 */
		function unsubscribe( query, listener ){
			
			psList[query].unsubscribe( listener );
		}
		
		//api
		return $.extend({
			
			channel: channel,
			
			matches: matches,
			
			subscribe: subscribe,
			
			unsubscribe: unsubscribe
		});
	}
);