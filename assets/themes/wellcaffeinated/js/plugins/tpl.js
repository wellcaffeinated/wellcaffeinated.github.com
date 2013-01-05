/**
 * Templating plugin that uses mustache.
 *
 * will return an api that provides raw text and render method.
 *
 * usage:
 * 		require(['tpl!./path/to/template.tpl'], function(tpl){
 * 			tpl.render({
 *				some: 'data'
 *			});
 * 		});
 */
define(
	[
		
		'jquery',
		
		'modules/mustache'
	],
	
	function( $, mustache ){
		
		var cache = {};
		
		// cache and call callback
		function finishLoad( name, content, onLoad, config ) {
				
			cache[ name ] = content;
			
			onLoad( content );
		}
		
		
		function load( id, req, callback, config ){
			
			// do we have this cached?
			if ( id in cache ){
				
				callback( cache[id] );
				
			} else {
				// no cache. get file using text plugin
				
				$.ajax({
					
					url: req.toUrl( id ),
					
					success: function( text ){
						
						var content = {
							
							/**
							 * Raw text
							 *
							 * @property {String} text
							 */
							text: text,
							
							/**
							 * Render template with provided data
							 *
							 * @method render
							 * @param {Object} template data
							 * @returns {String} rendered template HTML
							 */
							render: mustache.compile( text, {file:id} )
							
						};
					
						finishLoad( id, content, callback, config );
					}
				});
			}
		}
		
		
		// for build process. write an optimized version of template... not sure if it works yet.
		function write(pluginName, moduleName, write, config) {
			
			if ( moduleName in cache ) {
				
				var text = cache[ moduleName ].text
					;
				
				write.asModule( pluginName + '!' + moduleName,
							   'define(["mustache"], function (mustache) { return {' +
								   'text: "' + text + '",' +
								   'render: mustache.compile( "'+ text +'", {file: "'+ moduleName +'"})' +
							   '};});\n' );
			}
		}
	
		return {
			
			load: load,
			
			write: write
		};
	}
);