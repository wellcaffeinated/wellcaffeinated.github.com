/* 
 * build profile
 * All config options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
 * node r.js -o ./config.build.js 
 */
({
    appDir: './',
    baseUrl: './',
    dir: '../js-build',
    // optimize: 'none',
	optimize: 'uglify',
    fileExclusionRegExp: /^\.|node_modules/,
    findNestedDependencies: false,
    mainConfigFile: './require-config.js',

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