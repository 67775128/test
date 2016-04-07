var useSprite = true;
// npm install [-g] fis3-hook-amd
fis.hook('amd', { // 模块化支持 amd 规范，适应 require.js
});
fis.unhook('components');

fis.match('/bower_components/**', {//未匹配的不编译
    release: false
});
fis.set('project.fileType.text', 'mustache');
fis.match('/app/**.less', {
    rExt: '.css', // from .less to .css
    parser: fis.plugin('less')
});
fis.match('/app/**.mustache', {
    rExt: '.js',
    parser: fis.plugin('handlebars-4.x')
});
fis.match('::package', {
    spriter: fis.plugin('csssprites'),
    postpackager: fis.plugin('loader', {
        resourceType: 'amd',
        useInlineMap: true,
        include:[
                '**.js'
            ]
    })
});


fis.match(/^\/bower_components\/jquery\/dist\/jquery\.js$/i, {
    isMod  : false,
    id     : 'jquery',
    release: 'statics/vendor/jquery.js'
});
fis.match(/^\/bower_components\/draggabilly\/dist\/draggabilly\.pkgd\.js$/i, {
    isMod  : false,
    id     : 'draggabilly',
    release: 'statics/vendor/draggabilly.js'
});

fis.match(/^\/bower_components\/handlebars\/handlebars\.runtime\.js$/i, {
    isMod    : true,
    id       : 'handlebars',
    release  : 'statics/vendor/handlebars.js'
});
fis.match(/^\/bower_components\/underscore\/underscore\.js$/i, {
    isMod  : false,
    id     : 'underscore',
    release: 'statics/vendor/underscore.js'
});
fis.match(/^\/bower_components\/backbone\/backbone\.js$/i, {
    isMod  : false,
    id     : 'backbone',
    release: 'statics/vendor/backbone.js'
});
fis.match(/^\/bower_components\/loglevel\/dist\/loglevel\.js$/i, {
    isMod  : false,
    id     : 'log',
    release: 'statics/vendor/log.js'
});
fis.match(/^\/bower_components\/requirejs\/require\.js$/i, {
    isMod  : false,
    id     : 'requirejs',
    release: 'statics/vendor/require.js'
});
fis.match(/^\/bower\_components\/indexeddb\-backbonejs\-adapter\/backbone\-indexeddb\.js$/i, {
    isMod  : false,
    id     : 'backbone.indexeddb',
    release: 'statics/vendor/backbone.indexeddb.js'
});
fis.match(/^\/bower_components\/socket\.io-client\/socket\.io\.js$/i, {
    isMod  : true,
    id     : 'socket.io',
    release: 'statics/vendor/socket.io.js'
});
fis.match(/^\/bower_components\/animate\.css\/animate\.css$/i, {
    isMod  : false,
    id     : 'animate.css',
    release: 'statics/vendor/animate.css'
});
fis.match(/^\/bower_components\/hint\.css\/hint\.css$/i, {
    isMod  : false,
    id     : 'hint.css',
    release: 'statics/vendor/hint.css'
});
fis.match(/^\/vendor\/bootstrap\/js\/(\w+)\.js$/i, {
    isMod  : true,
    id     : 'bootstrap:$1',
    release: 'statics/vendor/bootstrap/$1.js'
});
fis.match(/^\/vendor\/bootstrap\/less\/bootstrap\.less/i, {
    id       : 'bootstrap.less',
    useSprite: useSprite,
    release  : 'statics/vendor/bootstrap/bootstrap.css'
});
fis.match(/^\/vendor\/bootstrap\/icons\/(.*)\.(png|jpg)/i, {
    release: 'statics/vendor/bootstrap/icons/$1.$2'
});
fis.match(/^\/vendor\/bootstrap\/icons\/(.*)$/i, {
    release: 'statics/vendor/bootstrap/icons/$1'
});
fis.match(/^\/app\/(\w+)\/styles\/(.*)\.(css|less)$/i, {
    useSprite: useSprite,
    id       : '$1:$2.$3',
    release  : 'statics/css/$1/$2.css'
});
fis.match(/^\/app\/(\w+)\/styles\/(.*)\.(png|jpg)$/i, {
    release: 'client/images/$2.$3'
});



fis.match(/^\/app\/(\w+)\/(routers|views|models|collections)\/(.*)\.(view|router|model|collection|ui)\.js$/i, {
    isMod  : true,
    id     : '$1:$3.$4',
    release: 'statics/js/$1/$3.$4.js'
});
fis.match(/^\/app\/(\w+)\/libs\/(.*)\.js$/i, {
    isMod  : true,
    id     : '$1:libs/$2',
    release: 'statics/js/$1/$2.js'
});
fis.match(/^\/app\/common\/i18nDictionary\/(\w+)\/(.*)\.js$/i, {
    isMod  : true,
    id     : 'lang:$1/$2',
    release: 'statics/js/i18n/$1-$2.js'
});
fis.match(/^\/app\/(init)\.js$/i, {
    isMod  : true,
    id     : '$1',
    release: 'statics/js/$1.js'
});
fis.match(/^\/app\/(\w+)\/templates\/(.*)\.(mustache)$/i, {
    id        : '$1:$2.mustache',
    isMod     : false,
    release   : false
});
fis.match(/^\/app\/(\w+)\/images\/(.*)$/i, {
    isMod  : false,
    id     : '$1/images/$2',
    release: 'statics/images/$1/$2'
});
fis.match(/^\/pages\/(.*)$/i, {
    useCache: false,
    release : '$1',
    useMap  : false
});


// fis3 release prod 产品发布，进行合并
//fis.media('prod').match('*.{js,css,less}', {
//    useHash: true,
//    //domain: 'http://127.0.0.1:8080'
//});
//fis.media('prod').match('image', {
//    useHash: true,
//    //domain: 'http://127.0.0.1:8080'
//});
//fis.media('prod').match('/app/**.js', {
//    // fis-optimizer-uglify-js 插件进行压缩，已内置
//    optimizer: fis.plugin('uglify-js')
//});
//
//fis.media('prod').match('*.{css,less}', {
//    // fis-optimizer-clean-css 插件进行压缩，已内置
//    optimizer: fis.plugin('clean-css')
//});
//
//fis.media('prod').match('*.png', {
//    // fis-optimizer-png-compressor 插件进行压缩，已内置
//    optimizer: fis.plugin('png-compressor')
//});
//// 对 CSS 进行图片合并
//fis.media('prod').match('*.{css,less}', {
//    // 给匹配到的文件分配属性 `useSprite`
//    useSprite: true
//});
fis.media('prod').match(/^\/app\/(\w+)\/styles\/(.*)\.(css|less)$/i, {
    useSprite: useSprite,
    release  : 'statics/css/$1/$1.css',
    packTo: 'statics/css/$1/$1.css'
});
fis.media('prod').match(/^\/app\/(\w+)\/(routers|views|models|collections)\/(.*)\.(view|router|model|collection|ui)\.js$/i, {
    isMod  : true,
    id     : '$1:$3.$4',
    release: 'statics/js/app.js',
    packTo: 'statics/js/app.js'
});