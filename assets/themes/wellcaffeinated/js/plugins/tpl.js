/**
 * Templating plugin that uses mustache.
 *
 * will return an api that provides raw text and render method.
 *
 * usage:
 *      require(['plugins/tpl!templates/path/to/template.tpl'], function(tpl){
 *          tpl.render({
 *              some: 'data'
 *          });
 *      });
 */
define(
    [
        
        'plugins/text',
        
        'dot'
    ],
    
    function( text, dot ){
        
        var cache = {}
        	,settings
            // ,settings = {
            //     evaluate:    /\{%([\s\S]+?)%\}/g,
            //     interpolate: /\{\{\{([\s\S]+?)\}\}\}/g,
            //     encode:      /\{\{([^{?#~][\s\S]+?)\}\}/g,
            //     use:         /\{\{#([\s\S]+?)\}\}/g,
            //     define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
            //     conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
            //     iterate:     /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
            //     varname: 'view',
            //     strip: true,
            //     append: true,
            //     selfcontained: true,
            //     emptycheck: true                                
            // }
            ;
        
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
                
                text.get( req.toUrl( id ),
                    
                    function( text ){
                        
                        var content = {
                                render: dot.template( text, settings )
                            }
                            ;
                    
                        finishLoad( id, content, callback, config );
                    }
                );
            }
        }
        
        
        // for build process. write an optimized version of template... not sure if it works yet.
        function write(pluginName, moduleName, write, config) {

            if ( moduleName in cache ) {
                
                var text = cache[ moduleName ].render.str
                    ;
                
                write.asModule( pluginName + '!' + moduleName, 'define({ render: function('+settings.varname+'){'+text+'} });\n' );
            }
        }
    
        return {
            
            load: load,
            
            write: write
        };
    }
);