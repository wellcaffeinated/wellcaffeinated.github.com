window.require = window.require || {config: function(c){window.require = c;}}
require.config({
    shim: {
        'bootstrap-affix': {
            deps: ['jquery']
        },
        'bootstrap-typeahead': {
            deps: ['jquery']
        },

        'jquery.highlight': {
            deps: ['jquery']
        }
    },

    paths: {
        'text': 'plugins/text',
        'json': 'plugins/json',
        
        'jquery': 'vendor/jquery.min',
        'jquery.highlight': 'vendor/jquery.highlight',

        'bootstrap-affix': 'vendor/bootstrap/bootstrap-affix',
        'bootstrap-typeahead': 'vendor/bootstrap/bootstrap-typeahead'
    },

    map: {
        
    }
});
