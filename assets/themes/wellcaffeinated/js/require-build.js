// > cd {location of require-build.js}
// > r.js -o require-build.js
({
    appDir: './',
    baseUrl: './',
    dir: '../build',
    //optimize: 'none',
	optimize: 'uglify',
    paths: {
        'jquery': 'modules/jquery' // Reset jQuery's path to the module's directory
    },
    modules: [        
        {
            name: 'boot-index',
            include: [
                'require-config',
                'mediators/index'
            ]
        }
    ]
})