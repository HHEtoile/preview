(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' 
        ? factory(exports) 
        : typeof define === 'function' && define.amd 
            ? define(['exports'], factory) 
            : (factory((
                global.picPreview = global.picPreview || {exports:global}
            )))
  }(this, (function (exports) {
    var win = this,
        doc = win.document,
        activePreview = null,//当前活动对象
        saveImgData = null,
        isFirstEnter = true, // 首次进入
        curFilePath, // js路径
        browTL = 0,// 水平距离浏览器左边的距离
        browW = win.innerWidth || win.outerWidth,// 浏览器宽度
        browH = win.innerHeight || win.outerHeight,// 浏览器高度
        maskW = browW,// 蒙版宽度
        maskH = browH,// 蒙版高度
        maskTL = (browW - maskW) / 2,// 蒙版距离左侧距离
        maskTT = (browH - maskH) / 2,// 蒙版距离顶部距离
        imgW = imgH = imgLeft = imgTop = 0,// 图片显示宽度
        baseScale = 2, // 单次滚轮方法倍率百分比单位
        
        template = null,

        fullScreenFn = getfullScreenFn(), // 全屏
        exitFullScreenFn = getExitFullScreenFn(), // 退出全屏
        curFilePath = getCurrAbsPath(), // js文件路径
        baseURL, // 基本路径
        pattern = /(.*)\/[a-zA-Z\-_\.]+\.js$/;

        pattern.test(curFilePath);
        baseURL = RegExp.$1; // 过滤js名称以后的基本路径  RegExp.$1是RegExp的一个属性,指的是与正则表达式匹配的第一个 子匹配(以括号为标志)字符串
    
    win.addEventListener('resize',function(){
        browW = win.innerWidth || win.outerWidth;// 浏览器宽度
        browH = win.innerHeight || win.outerHeight;// 浏览器高度
        maskW = browW // 蒙版宽度
        maskH = browH // 蒙版高度
    },false);

    // animate variable
    var class2type = {};
    var toString = class2type.toString;
    var hasOwn = class2type.hasOwnProperty;
    var support = {};
    var rmsPrefix = /^-ms-/;
    var rdashAlpha = /-([\da-z])/gi;
    var cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];
    var emptyStyle = doc.createElement("div").style;
    var cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 };
    // animate variable end
    
    // var version = '1.0.0';
    // 压缩图片默认参数
    var compressOps = {
        maxSize: 500, //单位KB 超过500KB 就要做压缩
        format: 'jpeg', //返回的文件格式
        // 
    };

    // 默认配置项
    var defaults = {
        // zIndex: "auto",
        title: '', // title （可配置）
        titleFormat: noopValue, // title名称过滤方法
        // description: '', // 图片描述（一般是图片名）
        descriptionFormat: noopValue, // 图片描述内容过滤方法
        // name
        // 首次点击图片时，替换index 或者 用户手动打开图片预览(非click)时，此参数指定首次展示的图片index
        showImgIndex: 0, // 默认展示第几张
        // imgJump: noop, // 手动展示图片 TODO

        isEndToEnd: false,// 是否首尾页相连 根据图片数量显示翻页 默认false
        pagingBtnShow: true, // 翻页按钮 强制展示
        onBeforePrev: noop, // 上一页翻页前触发
        onPrev: noop, // 上一页
        onBeforeNext: noop, // 下一页翻页前触发
        onNext: noop, // 下一页

        downloadShow: true, // 下载，默认展示
        onBeforeDownload: noop, // 下载前触发
        onDownload: noop, // 下载

        scaleBtnShow: true, // 是否显示缩放按钮, 默认显示
        onBeforeEnlarge: noop, // 放大前触发
        onEnlarge: noop, // 放大
        onBeforeNarrow: noop, // 缩小前触发
        onNarrow: noop, // 缩小

        rotateBtnShow: true, // 是否显示 旋转 操作按钮, 默认显示
        onBeforeRoate: noop, // 旋转前触发
        onRoate: noop, // 旋转

        resetBtnShow: true, // 是否显示 复原 操作按钮, 默认显示
        onBeforeReset: noop, // 复原前触发
        onReset: noop, // 复原

        fullScreenType: 'iframe', // 全屏方式（iframe内全屏，'window'-窗口全屏） TODO
        fullScreenBtnShow: true, // 是否显示 全屏 操作按钮
        onBeforeFullScreen: noop, // 全屏前触发
        onFullScreen: noop, // 全屏

        tailoringBtnShow: false, // 是否显示 裁剪 操作按钮 TODO
        oneToOneBtnShow: true, // 是否显示1:1操作按钮(展示原图大小)

        LRcolumns: false, // 是否 左右两栏
        ULcolumns: false, // 是否 上下两栏
        columnsProportion: '1:1', // 两栏占比 数值型，默认1（左右比例）
        contentRender: noop,

        // 是否开启图片压缩功能 默认关闭
        compressOpen: false,
        // removeLoadingCb: noop,
        // 压缩裁剪的宽高配置(不配置，默认获取浏览器宽高 分栏布局的时候要做配置，不配置给出警告)
        width: '',
        height: '',
        // src, options, callback

        src: '' // 图片路径
    };

    function emptyObject() {
        return Object.create(null)
    }
    function noop(a, b, c) { }

    function noopValue(x) {return x}

    var hasConsole = typeof console === 'object'

    function log() {
        if (hasConsole) {
            Function.apply.call(console.log, console, arguments)
        }
    }

    function warn() {
        if (hasConsole) {
            var method = console.warn || console.log
            // http://qiang106.iteye.com/blog/1721425
            Function.apply.call(method, console, arguments)
        }
    }

    function error(str, e) {
        throw (e || Error)(str)
    }

    /** animate */
    function each(obj,callback){
		if(obj && typeof obj == 'object'){
			for(var key in obj){
				callback && callback(key,obj[key]);
			}
		}
	}
	var isArray = Array.isArray || function(object){ return object instanceof Array }
	// return a css property mapped to a potentially vendor prefixed property
	function vendorPropName( name ) {

		// shortcut for names that are not vendor prefixed
		if ( name in emptyStyle ) {
			return name;
		}

		// check for vendor prefixed names
		var capName = name.charAt( 0 ).toUpperCase() + name.slice( 1 ),
			i = cssPrefixes.length;

		while ( i-- ) {
			name = cssPrefixes[ i ] + capName;
			if ( name in emptyStyle ) {
				return name;
			}
		}
	}
	each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),function( i, name ) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	});
	//判断type类型
	var type = function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call( obj ) ] || "object" :
			typeof obj;
	};
	var isFunction = function( obj ) {
		return type( obj ) === "function";
	};
	var isWindow = function( obj ) {
		/* jshint eqeqeq: false */
		return obj != null && obj == obj.window;
	};
	var isPlainObject = function( obj ) {
		var key;

		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || type( obj ) !== "object" || obj.nodeType || isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call( obj, "constructor" ) &&
				!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
				return false;
			}
		} catch ( e ) {

			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	};
	var bind = function(element,type,handler){
		if(element.addEventListener){
			element.addEventListener(type,handler,false);
		}
		else if(element.attachEvent){
			element.attachEvent('on'+type,handler);
		}
		else{
			element["on"+type] = handler /*直接赋给事件*/
		}
    };
	var unbind = function(element,type,handler){
		if (element.removeEventListener)
			element.removeEventListener(type, handler, false);
		else if (element.deattachEvent) {               /*IE*/
			element.deattachEvent('on' + type, handler);
		}
		else {
			element["on" + type] = null;
		}
	};
	
	var camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
	function dasherize(str) {
		return str.replace(/::/g, '/')
			   .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
			   .replace(/([a-z\d])([A-Z])/g, '$1_$2')
			   .replace(/_/g, '-')
			   .toLowerCase()
	  }
	  function maybeAddPx(name, value) {
		return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
	  }
	  
	  HTMLElement.prototype.css = function(property, value){
        if (arguments.length < 2) {
            var element = this
            if (typeof property == 'string') {
            if (!element) return
            return element.style[camelize(property)] || getComputedStyle(element, '').getPropertyValue(property)
            } else if (isArray(property)) {
            if (!element) return
            var props = {}
            var computedStyle = getComputedStyle(element, '')
            each(property, function(_, prop){
                props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
            })
            return props
            }
        }

        var css = '';
        if (type(property) == 'string') {
            if (!value && value !== 0)
            this.style.removeProperty(dasherize(property));
            else
            css = dasherize(property) + ":" + maybeAddPx(property, value)
        } else {
            for (key in property)
            if (!property[key] && property[key] !== 0)
                this.style.removeProperty(dasherize(key));
            else
                css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
        }

        return this.style.cssText += ';' + css;
    };
	
	var fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};
	var camelCase = function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	};
	
    var prefix = '', eventPrefix, endEventName, endAnimationName, vendors = {
        Webkit : 'webkit',
        Moz : '',
        O : 'o'
    }, document = window.document, testEl = document.createElement('div'), supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i, transform, transitionProperty, transitionDuration, transitionTiming, transitionDelay, animationName, animationDuration, animationTiming, animationDelay, cssReset = {}

    function dasherize(str) {
        return str.replace(/([a-z])([A-Z])/, '$1-$2').toLowerCase()
    }
    function normalizeEvent(name) {
        return eventPrefix ? eventPrefix + name : name.toLowerCase()
    }
	
    each(vendors, function(vendor, event) {
        if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
            prefix = '-' + vendor.toLowerCase() + '-'
            eventPrefix = event
            return false
        }
    });

    transform = prefix + 'transform'
    cssReset[transitionProperty = prefix + 'transition-property'] = cssReset[transitionDuration = prefix
            + 'transition-duration'] = cssReset[transitionDelay = prefix
            + 'transition-delay'] = cssReset[transitionTiming = prefix
            + 'transition-timing-function'] = cssReset[animationName = prefix
            + 'animation-name'] = cssReset[animationDuration = prefix
            + 'animation-duration'] = cssReset[animationDelay = prefix
            + 'animation-delay'] = cssReset[animationTiming = prefix
            + 'animation-timing-function'] = '';
	//动画配置
    doc.fx = {
        off : (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
        speeds : {
            _default : 400,
            fast : 200,
            slow : 600
        },
        cssPrefix : prefix,
        transitionEnd : normalizeEvent('TransitionEnd'),
        animationEnd : normalizeEvent('AnimationEnd')
    };
	
	// 使用原型扩展DOM自定义事件
	HTMLElement.prototype.animate = function(properties, duration, ease, callback, delay) {
		if (isFunction(duration))
			callback = duration, ease = undefined, duration = undefined
		if (isFunction(ease))
			callback = ease, ease = undefined
		if (isPlainObject(duration))
			ease = duration.easing, callback = duration.complete,
					delay = duration.delay, duration = duration.duration
		if (duration)
			duration = (typeof duration == 'number' ? duration
					: (doc.fx.speeds[duration] || doc.fx.speeds._default)) / 1000
		if (delay)
			delay = parseFloat(delay) / 1000
		return this.anim(properties, duration, ease, callback, delay)
	}
	
	HTMLElement.prototype.anim = function(properties, duration, ease, callback, delay) {
		var key, cssValues = {}, cssProperties, transforms = '', that = this, wrappedCallback, endEvent = doc.fx.transitionEnd, fired = false

		if (duration === undefined)
			duration = doc.fx.speeds._default / 1000
		if (delay === undefined)
			delay = 0
		if (doc.fx.off)
			duration = 0

		if (typeof properties == 'string') {
			// keyframe animation
			cssValues[animationName] = properties
			cssValues[animationDuration] = duration + 's'
			cssValues[animationDelay] = delay + 's'
			cssValues[animationTiming] = (ease || 'linear')
			endEvent = $.fx.animationEnd
		} else {
			cssProperties = []
			// CSS transitions
			for (key in properties)
				if (supportedTransforms.test(key))
					transforms += key + '(' + properties[key] + ') '
				else
					cssValues[key] = properties[key], cssProperties
							.push(dasherize(key))

			if (transforms)
				cssValues[transform] = transforms, cssProperties
						.push(transform)
			if (duration > 0 && typeof properties === 'object') {
				cssValues[transitionProperty] = cssProperties.join(', ')
				cssValues[transitionDuration] = duration + 's'
				cssValues[transitionDelay] = delay + 's'
				cssValues[transitionTiming] = (ease || 'linear')
			}
		}

		wrappedCallback = function(event) {
			if (typeof event !== 'undefined') {
				if (event.target !== event.currentTarget)
					return // makes sure the event didn't bubble from "below"
					unbind(event.target,endEvent, wrappedCallback)
			} else
				unbind(this,endEvent, wrappedCallback) // triggered by
															// setTimeout

			fired = true
			this.css(cssReset)
			callback && callback.call(this)
		}
		if (duration > 0) {
			bind(this,endEvent, wrappedCallback)
			// transitionEnd is not always firing on older Android phones
			// so make sure it gets fired
			setTimeout(function() {
				if (fired)
					return

				wrappedCallback.call(that)
			}, (duration * 1000) + 25)
		}
		// trigger page reflow so new elements can animate
		this.clientLeft;
		this.css(cssValues);
		if (duration <= 0)
			setTimeout(function() {
				that.each(function() {
					wrappedCallback.call(this)
				})
			}, 0)

		return this
	}
    testEl = null;

    /** animate end */

    /** 模板扩展 */
    (function (top) {
        template = function (filename, content) {
            return typeof content === 'string'
                ? compile(content, {
                    filename: filename
                })
                : renderFile(filename, content);
        };
        template.version = '3.0.0';
        template.config = function (name, value) {
            defaults[name] = value;
        };
        //默认配置项
        var defaults = template.defaults = {
            openTag: '<%',    // 逻辑语法开始标签
            closeTag: '%>',   // 逻辑语法结束标签
            escape: true,     // 是否编码输出变量的 HTML 字符
            cache: true,      // 是否开启缓存（依赖 options 的 filename 字段）
            compress: false,  // 是否压缩输出
            parser: null      // 自定义语法格式器 @see: template-syntax.js
        };
        //缓存存储
        var cacheStore = template.cache = {};
        template.render = function (source, options) {
            return compile(source, options);
        };
        var renderFile = template.renderFile = function (filename, data) {
            var fn = template.get(filename) || showDebugInfo({
                filename: filename,
                name: 'Render Error',
                message: 'Template not found'
            });
            return data ? fn(data) : fn;
        };
        template.get = function (filename) {
            var cache;
            if (cacheStore[filename]) {
                // 使用内存缓存
                cache = cacheStore[filename];
            } else if (typeof document === 'object') {
                // 加载模板并编译
                var elem = document.getElementById(filename);
                if (elem) {
                    var source = (elem.value || elem.innerHTML).replace(/^\s*|\s*$/g, '');
                    cache = compile(source, {
                        filename: filename
                    });
                }
            } return cache;
        };
        //
        var toString = function (value, type) {
            if (typeof value !== 'string') {
                type = typeof value;
                if (type === 'number') {
                    value += '';
                } else if (type === 'function') {
                    value = toString(value.call(value));
                } else {
                    value = '';
                }
            } return value;
        };
        //定义转码表
        var escapeMap = {
            "<": "&#60;",
            ">": "&#62;",
            '"': "&#34;",
            "'": "&#39;",
            "&": "&#38;"
        };
        //转码函数
        var escapeFn = function (s) {
            return escapeMap[s];
        };
        //转码html
        var escapeHTML = function (content) {
            return toString(content).replace(/&(?![\w#]+;)|[<>"']/g, escapeFn);
        };
        //数组的isArray方法
        var isArray = Array.isArray || function (obj) {
            return ({}).toString.call(obj) === '[object Array]';
        };
        //each 循环函数
        var each = function (data, callback) {
            var i, len;
            if (isArray(data)) {
                for (i = 0, len = data.length; i < len; i++) {
                    callback.call(data, data[i], i, data);
                }
            } else {
                for (i in data) {
                    callback.call(data, data[i], i);
                }
            }
        };
        //公共方法
        var utils = template.utils = { $helpers: {}, $include: renderFile, $string: toString, $escape: escapeHTML, $each: each };
        template.helper = function (name, helper) {
            helpers[name] = helper;
        };
        //声明变量 helper
        var helpers = template.helpers = utils.$helpers;
        template.onerror = function (e) {
            var message = 'Template Error\n\n';
            for (var name in e) {
                message += '<' + name + '>\n' + e[name] + '\n\n';
            } if (typeof console === 'object') {
                console.error(message);
            }
        };
        // 模板调试器
        var showDebugInfo = function (e) {
            template.onerror(e);
            return function () {
                return '{Template Error}';
            };
        };
        var compile = template.compile = function (source, options) {
            // 合并默认配置
            options = options || {};
            for (var name in defaults) {
                if (options[name] === undefined) {
                    options[name] = defaults[name];
                }
            }
            var filename = options.filename;
            try {
                var Render = compiler(source, options);
            } catch (e) {
                e.filename = filename || 'anonymous';
                e.name = 'Syntax Error';
                return showDebugInfo(e);
            }
            // 对编译结果进行一次包装
            function render(data) {
                try {
                    return new Render(data, filename) + '';
                } catch (e) {
                    // 运行时出错后自动开启调试模式重新编译
                    if (!options.debug) {
                        options.debug = true;
                        return compile(source, options)(data);
                    }
                    return showDebugInfo(e)();
                }
            };
            render.prototype = Render.prototype;
            render.toString = function () {
                return Render.toString();
            };
            if (filename && options.cache) {
                cacheStore[filename] = render;
            }
            return render;
        };
        // 数组迭代
        var forEach = utils.$each;
        // 静态分析模板变量
        var KEYWORDS =
            // 关键字
            'break,case,catch,continue,debugger,default,delete,do,else,false'
            + ',finally,for,function,if,in,instanceof,new,null,return,switch,this'
            + ',throw,true,try,typeof,var,void,while,with'    // 保留字
            + ',abstract,boolean,byte,char,class,const,double,enum,export,extends'
            + ',final,float,goto,implements,import,int,interface,long,native'
            + ',package,private,protected,public,short,static,super,synchronized'
            + ',throws,transient,volatile'    // ECMA 5 - use strict
            + ',arguments,let,yield'
            + ',undefined';
        var REMOVE_RE = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g;
        var SPLIT_RE = /[^\w$]+/g;
        var KEYWORDS_RE = new RegExp(["\\b" + KEYWORDS.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g');
        var NUMBER_RE = /^\d[^,]*|,\d[^,]*/g;
        var BOUNDARY_RE = /^,+|,+$/g;
        var SPLIT2_RE = /^$|,+/;
        // 获取变量
        function getVariable(code) {
            return code
                .replace(REMOVE_RE, '')
                .replace(SPLIT_RE, ',')
                .replace(KEYWORDS_RE, '')
                .replace(NUMBER_RE, '')
                .replace(BOUNDARY_RE, '')
                .split(SPLIT2_RE);
        };
        // 字符串转义
        function stringify(code) {
            return "'" + code
                // 单引号与反斜杠转义
                .replace(/('|\\)/g, '\\$1')
                // 换行符转义(windows + linux)
                .replace(/\r/g, '\\r')
                .replace(/\n/g, '\\n') + "'";
        }
        //编译函数
        function compiler(source, options) {
            var debug = options.debug;
            var openTag = options.openTag;
            var closeTag = options.closeTag;
            var parser = options.parser;
            var compress = options.compress;
            var escape = options.escape;
            var line = 1;
            var uniq = { $data: 1, $filename: 1, $utils: 1, $helpers: 1, $out: 1, $line: 1 };
            var isNewEngine = ''.trim;// '__proto__' in {}
            var replaces = isNewEngine
                ? ["$out='';", "$out+=", ";", "$out"]
                : ["$out=[];", "$out.push(", ");", "$out.join('')"];

            var concat = isNewEngine
                ? "$out+=text;return $out;"
                : "$out.push(text);";

            var print = "function(){"
                + "var text=''.concat.apply('',arguments);"
                + concat
                + "}";
            var include = "function(filename,data){"
                + "data=data||$data;"
                + "var text=$utils.$include(filename,data,$filename);"
                + concat
                + "}";
            var headerCode = "'use strict';"
                + "var $utils=this,$helpers=$utils.$helpers,"
                + (debug ? "$line=0," : "");
            var mainCode = replaces[0];
            var footerCode = "return new String(" + replaces[3] + ");"// html与逻辑语法分离
            forEach(source.split(openTag), function (code) {
                code = code.split(closeTag);
                var $0 = code[0];
                var $1 = code[1];
                // code: [html]
                if (code.length === 1) {
                    mainCode += html($0);
                } else {
                    mainCode += logic($0);
                    if ($1) {
                        mainCode += html($1);
                    }
                }
            });
            var code = headerCode + mainCode + footerCode;// 调试语句
            if (debug) {
                code = "try{" + code + "}catch(e){"
                    + "throw {"
                    + "filename:$filename,"
                    + "name:'Render Error',"
                    + "message:e.message,"
                    + "line:$line,"
                    + "source:" + stringify(source)
                    + ".split(/\\n/)[$line-1].replace(/^\\s+/,'')"
                    + "};"
                    + "}";
            } try {
                var Render = new Function("$data", "$filename", code);
                Render.prototype = utils;
                return Render;
            } catch (e) {
                e.temp = "function anonymous($data,$filename) {" + code + "}";
                throw e;
            }
            // 处理 HTML 语句
            function html(code) {
                // 记录行号
                line += code.split(/\n/).length - 1;        // 压缩多余空白与注释
                if (compress) {
                    code = code
                        .replace(/\s+/g, ' ')
                        .replace(/<!--[\w\W]*?-->/g, '');
                }
                if (code) {
                    code = replaces[1] + stringify(code) + replaces[2] + "\n";
                }
                return code;
            }
            // 处理逻辑语句
            function logic(code) {
                var thisLine = line;
                if (parser) {
                    // 语法转换插件钩子
                    code = parser(code, options);
                } else if (debug) {
                    // 记录行号
                    code = code.replace(/\n/g, function () {
                        line++;
                        return "$line=" + line + ";";
                    });
                }
                // 输出语句. 编码: <%=value%> 不编码:<%=#value%>
                // <%=#value%> 等同 v2.0.3 之前的 <%==value%>
                if (code.indexOf('=') === 0) {
                    var escapeSyntax = escape && !/^=[=#]/.test(code);
                    code = code.replace(/^=[=#]?|[\s;]*$/g, '');            // 对内容编码
                    if (escapeSyntax) {
                        var name = code.replace(/\s*\([^\)]+\)/, '');// 排除 utils.* | include | print
                        if (!utils[name] && !/^(include|print)$/.test(name)) {
                            code = "$escape(" + code + ")";
                        }            // 不编码
                    } else {
                        code = "$string(" + code + ")";
                    }
                    code = replaces[1] + code + replaces[2];
                }
                if (debug) {
                    code = "$line=" + thisLine + ";" + code;
                }
                // 提取模板中的变量名
                forEach(getVariable(code), function (name) {
                    // name 值可能为空，在安卓低版本浏览器下
                    if (!name || uniq[name]) {
                        return;
                    }
                    var value;            // 声明模板变量
                    // 赋值优先级:
                    // [include, print] > utils > helpers > data
                    if (name === 'print') {
                        value = print;
                    } else if (name === 'include') {
                        value = include;
                    } else if (utils[name]) {
                        value = "$utils." + name;
                    } else if (helpers[name]) {
                        value = "$helpers." + name;
                    } else {
                        value = "$data." + name;
                    }
                    headerCode += name + "=" + value + ",";
                    uniq[name] = true;
                });
                return code + "\n";
            }
        };
        // 定义模板引擎的语法
        defaults.openTag = '{{';
        defaults.closeTag = '}}';
        var filtered = function (js, filter) {
            var parts = filter.split(':');
            var name = parts.shift();
            var args = parts.join(':') || '';
            if (args) {
                args = ', ' + args;
            }
            return '$helpers.' + name + '(' + js + args + ')';
        }
        defaults.parser = function (code, options) {
            // var match = code.match(/([\w\$]*)(\b.*)/);
            // var key = match[1];
            // var args = match[2];
            // var split = args.split(' ');
            // split.shift();
            code = code.replace(/^\s/, '');
            var split = code.split(' ');
            var key = split.shift();
            var args = split.join(' ');
            switch (key) {
                case 'if':
                    code = 'if(' + args + '){';
                    break;
                case 'else':
                    if (split.shift() === 'if') {
                        split = ' if(' + split.join(' ') + ')';
                    } else {
                        split = '';
                    }
                    code = '}else' + split + '{';
                    break;
                case '/if':
                    code = '}';
                    break;
                case 'each':
                    var object = split[0] || '$data';
                    var as = split[1] || 'as';
                    var value = split[2] || '$value';
                    var index = split[3] || '$index';
                    var param = value + ',' + index;
                    if (as !== 'as') {
                        object = '[]';
                    }
                    code = '$each(' + object + ',function(' + param + '){';
                    break;
                case '/each':
                    code = '});';
                    break;
                case 'echo':
                    code = 'print(' + args + ');';
                    break;
                case 'print':
                case 'include':
                    code = key + '(' + split.join(',') + ');';
                    break;
                default:
                    // 过滤器（辅助方法）
                    // {{value | filterA:'abcd' | filterB}}
                    // >>> $helpers.filterB($helpers.filterA(value, 'abcd'))
                    // TODO: {{ddd||aaa}} 不包含空格
                    if (/^\s*\|\s*[\w\$]/.test(args)) {
                        var escape = true;                // {{#value | link}}
                        if (code.indexOf('#') === 0) {
                            code = code.substr(1);
                            escape = false;
                        } var i = 0;
                        var array = code.split('|');
                        var len = array.length;
                        var val = array[i++]; for (; i < len; i++) {
                            val = filtered(val, array[i]);
                        }
                        code = (escape ? '=' : '=#') + val;            // 即将弃用 {{helperName value}}
                    } else if (template.helpers[key]) {
                        code = '=#' + key + '(' + split.join(',') + ');';
                        // 内容直接输出 {{value}}
                    } else {
                        code = '=' + code;
                    }
                    break;
            }
            return code;
        };
        top = template;
    }(template));

    function polyfill() {
        if (typeof Object.assign != 'function') {
            // Must be writable: true, enumerable: false, configurable: true
            Object.defineProperty(Object, "assign", {
                value: function assign(target, varArgs) { // .length of function is 2
                'use strict';
                if (target == null) { // TypeError if undefined or null
                    throw new TypeError('Cannot convert undefined or null to object');
                }
            
                var to = Object(target);
            
                for (var index = 1; index < arguments.length; index++) {
                    var nextSource = arguments[index];
            
                    if (nextSource != null) { // Skip over if undefined or null
                    for (var nextKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                        }
                    }
                    }
                }
                return to;
                },
                writable: true,
                configurable: true
            });
        }
    }
    polyfill()
    
    // 压缩功能
    if (!HTMLCanvasElement.prototype.toBlob) {
        Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
            value: function (callback, type, quality) {
                var canvas = this;
                setTimeout(function () {
                    var binStr = atob(canvas.toDataURL(type, quality).split(',')[1]);
                    var len = binStr.length;
                    var arr = new Uint8Array(len);

                    for (var i = 0; i < len; i++) {
                        arr[i] = binStr.charCodeAt(i);
                    }

                    callback(new Blob([arr], { type: type || 'image/png' }));
                });
            }
        });
    }

    function getWindowMes() {
        return {
            width: Math.min(window.innerWidth, document.documentElement.clientWidth),
            height: Math.min(window.innerHeight, document.documentElement.clientHeight)
        }
    }
    // TODO
    // function type(_) {
    //     return /^\[\w+\s(\w+)\]$/i.exec(Object.prototype.toString.call(_))[1].toLowerCase();
    // }

    function resetCanvas(bl) {
        var w = this.width;
        var h = this.height;
        var canvasBl = w / h;
        //设置的比例大于图片的比例
        if (canvasBl > bl) {
            this.width = Math.round(bl * h);
            this.height = Math.round(h);
        } else {
            this.height = Math.round(w / bl);
            this.width = Math.round(w);
        }
    }

    
    function compress(src, options, callback) {

        if (type(options) == 'object') {
            options = Object.assign(compressOps, options);
        } else {
            options = compressOps;
        }

        if (!options.width || !options.height) {
            options = Object.assign(options, getWindowMes());
        }
        var img = new Image();
        //设置img支持跨域  还需服务器设置支持跨域
        img.setAttribute("crossOrigin", 'Anonymous');
        (function (img, options, callback) {
            var canvas = document.createElement('canvas');
            var canvasTemp = document.createElement('canvas');
            canvas.width = options.width;
            canvas.height = options.height;
            img.onload = function () {
                var imgWidth = this.width;
                var imgHeight = this.height
                canvasTemp.width = imgWidth;
                canvasTemp.height = imgHeight;
                var ContexTemp = canvasTemp.getContext('2d');
                // 清除画布
                ContexTemp.clearRect(0, 0, imgWidth, imgHeight);
                // 图片压缩
                ContexTemp.drawImage(img, 0, 0, imgWidth, imgHeight);
                // var subfix = 'jpg';
                // try {
                //     subfix = /^.*\.(jpg|jpeg|png|gif|bmp)/i.exec(this.src)[1];
                // } catch (error) {
                //     subfix = 'jpg';
                // }
                // //判断是否是base64串地址
                // if(/^data\:image\/(\w+)\;base64/.test(this.src)){
                //     subfix = RegExp.$1;
                // }
                // subfix === 'jpg' ? subfix = 'jpeg' : undefined;
                var subfix = 'jpeg';
                // canvas转为blob
                canvasTemp.toBlob(function (blob) {
                    var url = canvasTemp.toDataURL('image/' + subfix);
                    //document.querySelector('#test').src = url;
                    var size = blob.size / 1024; //得到图片的大小
                    //如果大于图片的设置的阀值
                    if (size > options.maxSize) {
                        //则需要裁减 加压缩
                        //如果图片宽度大于设置的最大的宽度
                        if (imgWidth > options.width || imgHeight > options.height) {
                            var imgBl = imgWidth / imgHeight;
                            //计算最佳压缩比 保证图片不拉伸
                            resetCanvas.call(canvas, imgBl);
                            var Contex = canvas.getContext('2d');
                            // 清除画布
                            Contex.clearRect(0, 0, canvas.width, canvas.height);
                            // 图片压缩
                            Contex.drawImage(img, 0, 0, canvas.width, canvas.height);
                            //默认质量是70%
                            canvas.toBlob(function (blobs) {
                                var url = canvas.toDataURL('image/' + subfix,0.9);
                                var size = blobs.size / 1024;
                                //如果转过之后还是大于最大尺寸 再转一次
                                if (size > options.maxSize) {
                                    canvas.toBlob(function (blobss) {
                                        var url = canvas.toDataURL('image/' + subfix,0.8);
                                        var size = blobss.size / 1024;
                                        //如果转过之后还是大于最大尺寸 再转一次
                                        if (size > options.maxSize) {
                                            canvas.toBlob(function (blobss) {
                                                var url = canvas.toDataURL('image/' + subfix,0.7);
                                                var size = blobss.size / 1024;
                                                //如果转过之后还是大于最大尺寸 再转一次
                                                if (size > options.maxSize) {
                                                    console.warn('压缩比已达到最低压缩比，不在进行压缩！');
                                                }
                                                callback && callback({
                                                    url: url,//这个是转换过的url 和之前的不一致
                                                    width: canvas.width,
                                                    height: canvas.height,
                                                    size: size,
                                                    ws: canvas.width / imgWidth//压缩比为1
                                                });
                                            }, 'image/' + options.format, 0.7)
                                        }
                                        callback && callback({
                                            url: url,//这个是转换过的url 和之前的不一致
                                            width: canvas.width,
                                            height: canvas.height,
                                            size: size,
                                            ws: canvas.width / imgWidth//压缩比为1
                                        });
                                    }, 'image/' + options.format, 0.8)
                                } else {
                                    callback && callback({
                                        url: url,//这个是转换过的url 和之前的不一致
                                        width: canvas.width,
                                        height: canvas.height,
                                        size: size,
                                        ws: canvas.width / imgWidth//压缩比为1
                                    });
                                }
                            }, 'image/' + options.format, 0.9)
                        }
                    } else {
                        //把宽度信息及大小信息一起返回回去
                        callback && callback({
                            url: url,//这个是转换过的url 和之前的不一致
                            width: canvasTemp.width,
                            height: canvasTemp.height,
                            size: size,
                            ws: 1 //压缩比为1 表示原始大小
                        });
                        //释放blob资源
                        //URL.revokeObjectURL(url);
                    }
                }, 'image/' + subfix.toLowerCase());
            }; 
        }(img, options, callback));
        // var timestamp = new Date().getTime();
        img.src = src;
    }
    // 压缩功能 end

    function getCurrAbsPath(){
        var expose = +new Date(),
            rExtractUri = /((?:http|https|file):\/\/.*?\/[^:]+)(?::\d+)?:\d+/,
            isLtIE8 = ('' + doc.querySelector).indexOf('[native code]') === -1;
        // 获取当前js路径
        // FF,Chrome
        if (doc.currentScript){
            return doc.currentScript.src;
        }
        var stack;
        try{
            a.b();
        }
        catch(e){
            stack = e.fileName || e.sourceURL || e.stack || e.stacktrace;
        }
        // IE10
        if (stack){
            var absPath = rExtractUri.exec(stack)[1];
            if (absPath){
                return absPath;
            }
        }
        // IE5-9
        for(var scripts = doc.scripts,
            i = scripts.length - 1,
            script; script = scripts[i--];){
            if (script.className !== expose && script.readyState === 'interactive'){
                script.className = expose;
                // if less than ie 8, must get abs path by getAttribute(src, 4)
                return isLtIE8 ? script.getAttribute('src', 4) : script.src;
            }
        }
    }

    var xhr = null;
    var ajaxDefault = {
        type:'get',
        async:false,
        success:noop,
        error:noop,
        complete:noop,
        dataType:'json'
    };

    var sp = String.prototype;

    function ajax(url,params){
        if(type(url) === 'string' && url !== ''){
            if(!xhr){
                xhr = XMLHttpRequest;
            }
            var xhrHttp = new xhr();
            var opts = Object.assign(ajaxDefault,params);
            xhrHttp.open(sp.toUpperCase.call(opts.type), url, opts.async);
            xhrHttp.send(params.data || null);
            xmlDoc = xhrHttp.responseText;
            ajaxResponese.call(xhrHttp,opts,xmlDoc);
        }else{
            console.warn('ajax--地址不合法！');
        }
    }

    function ajaxResponese (opts,xmlDoc){
        var curXhr = this;
        switch(opts.dataType){
            case 'json':
            break;
            case 'text':
                opts.success.call(this, xmlDoc)
            break;
            default:
            break;
        }
    }
    function loadHtm() {
        var xhr = new XMLHttpRequest();
        ajax(baseURL + '/picPreview.htm',
            {
                type:'get',
                dataType:'text',
                async:false,
                success:function(xmlDoc){
                    var dom, tmplHtml;
                    tmplHtml = xmlDoc.replace(/\|\|fontUrl\|\|/mg, baseURL+'/font');// 替换模板font路径
                    doc.body.appendChild((
                        dom = createEle('div'),
                        dom.style.cssText = 'display:none;',
                        dom.innerHTML = tmplHtml,
                        dom
                    ));
                }
            }
        )
    }
    // 加载模板
    loadHtm();

    function uuidGrow() {
        // 返回值 UUID (唯一ID生成)
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
        s[8] = s[13] = s[18] = s[23] = "";
        var uuid = s.join("");
        return uuid;
    }
    
    function createEle(name){
        return doc.createElement(name)
    }


    function getVaildIndex(idx,L){
        if (idx < 0){
            return 0
        }else{
            return idx > L ? L : idx
        }
    }
    /**
     * 设置图片title
     * 如果设置了title字符串，则显示写死的title名称
     * 如果设置了titleFormat，则展示处理后的名称
     * 如果两个都没有设置，则展示空
     */
    function title() {
        var _top = this;
        var titleName = _top.config.title;
        function title() {
            var _ = this;
            _.titleName = titleName
            _.parent = _top
        }
        var pto = title.prototype;
        pto.value = function (name) {
            var _ = this,
                _p = _.parent,
                _pc = _p.config;
            // 相当于set值，返回一个操作成功
            if (arguments.length) { 
                name = _pc.titleFormat(name);
                _.titleName = name
                // 同步父级变量
                _pc.title = name
                return true
            } else {
                // get值，返回title值
                return _.titleName
            }
        }
        _top.title = new title()
        return _top.title
    }

    /**
     * 图片描述(图片名)
     * 获取img的title属性或者 attachName 属性值展示
     * 如果设置了titleFormat，则展示方法过滤后的内容
     */
    function description() {
        var _top = this;
        var elm = _top.DescDom;
        function description(){
            var _ = this;
            _.parent = _top;
            _.elm = elm;
        }
        var pto = description.prototype;
        pto.value = function(text){
            var _ = this,
                _pc = _.parent.config;
            if (arguments.length) {
                text = _pc.descriptionFormat(text)
                _.description = text
                // 同步父级变量值
                _pc.description = text
                return true
            } else {
                return _.description
            }
        }
        _top.description = new description()
        return _top.description
    }

    /**
     * 翻页模块 TODO
     * 可强制是否显示翻页操作图标
     * 根据配置决定是否收尾连接 根据图片数量决定是否显示翻页按钮
     * 回调 翻页前，可设置单击跳转到某一页
     * 回调 翻页后，可设置分栏布局表格内容的重渲染
     */
    function paging() {
        var _top = this;
        var domArr = _top.imgArr || [];
        var index = _top.config.showImgIndex;
        // 是否首尾相连
        var isEndToEnd = _top.config.isEndToEnd;
        function paging(){
            var _ = this;
            // 初始化赋值  用户设定的showImgIndex或者默认的0，但click图片的时候如果非设置取值，翻页需要重新获取一次index
            _.index = index;
            _.isEndToEnd = isEndToEnd;
            _.maxLength = domArr.length;
            _.parent = _top;
            _.tipsNumPrev = _.tipsNumNext = 0;
        }
        var pto = paging.prototype;
        pto.go = function(idx, direction){
            var _ = this,
                _p = _.parent
                _pc = _p.config;
            if (type(idx) === 'number') {
                var index = getVaildIndex(idx, _.maxLength - 1)
                // _.index = idx;
                _.goFlag = direction || 1;
                // 执行回调 TODO
                if(_.goFlag) {
                    _pc.onBeforeNext(_);
                } else {
                    _pc.onBeforePrev(_);
                }
                _._go(index);
            } else {
                console.warn('paging-go-参数idx必须为数字类型');
                return;
            }
        }
        pto._go = function(index){
            var _ = this,
                _pc = _.parent.config;
            
            _.index = index;
            _.parent.index = index;
            // 直接跳到指定的图片位置即可
            // preview.call(_.parent, _.parent.imgArr[index]);
            preview.call(_.parent);
            // 完成后回调
            if(_.goFlag) {
                _pc.onNext(_);
            } else {
                _pc.onPrev(_);
            }
        }
        pto.prev = function() {
            var _ = this,
                _p = _.parent,
                index = --_.index;
            // 标志是上一页
            _.goFlag = -1;
            if(_.isEndToEnd){
                index < 0 
                    ? index = _.maxLength - 1 
                    : index;
                _._go(index);
            }else{
                if(index < 0){
                    _.index = 0;
                    !_.tipsNumPrev ? (_p.toast.center('toast','已经是第一张！'),_.tipsNumPrev = 1,setTimeout(function(){_.tipsNumPrev = 0},1600)) : undefined;
                }else{
                    _._go(index);
                }
            }
            // _.index = index;
        }
        pto.next = function() {
            var _ = this,
                _p = _.parent,
                index = ++_.index;
            // 标志是下一页
            _.goFlag = 1;
            if (_.isEndToEnd) {
                index >= _.maxLength
                    ? index = 0
                    : index;
                _._go(index);
            } else {
                if (index >= _.maxLength) {
                    _.index = _.maxLength - 1;
                    !_.tipsNumNext ? (_p.toast.center('toast','已经是最后一张！'),_.tipsNumNext = 1,setTimeout(function(){_.tipsNumNext = 0},1600)) : undefined;
                } else {
                    _._go(index);
                }
            }
            // _.index = index;
        }
        _top.paging = new paging()
        return _top.paging
    }

    function hasClass(elem, cls) {
        cls = cls || '';
        if (cls.replace(/\s/g, '').length == 0) return false; //当cls没有参数时，返回false
        return new RegExp(' ' + cls + ' ').test(' ' + elem.className + ' ');
    }

    function addClass(elem, cls) {
        if (!hasClass(elem, cls)) {
            elem.className = elem.className == '' ? cls : elem.className + ' ' + cls;
        }
    }

    function removeClass(elem, cls) {
        if (hasClass(elem, cls)) {
            var newClass = ' ' + elem.className.replace(/[\t\r\n]/g, '') + ' ';
            while (newClass.indexOf(' ' + cls + ' ') >= 0) {
                newClass = newClass.replace(' ' + cls + ' ', ' ');
            }
            elem.className = newClass.replace(/^\s+|\s+$/g, '');
        }
    }
    
    function toast(){
        var _top = this;
        // 提示信息dom -- jq dom
        var elm = _top.toastDom;
        function toast(){
            var _ = this
            _.parent = _top;
            _.elm = elm;
            _.delay = 3000;
            _.duration = 600;
        }
        var t = toast.prototype
        t.center = function(type, msg){
            var _ = this,
            _p = _.parent;
            // 每次都是重新渲染的
            _.elm = _p.toastDom
            if(!_.elm) {
                return;
            }
            if(type == 'loading') {
                removeClass(_.elm, 'p-toast')
                _.elm.css('zIndex','2')
                _.elm.animate({
                    opacity:1
                },_.duration)
            } else {
                addClass(_.elm, 'p-toast')
                getSelectors(_.elm, 'p').innerText = msg;
                _.animate();
            }
        }
        t.animateDelay = function(delay){
            return type(delay) === 'number' ? this.delay = delay : undefined
        }
        t.animateDuration = function (duration) {
            return type(duration) === 'number' ? this.duration = duration : undefined
        }
        t.animate = function(){
            var _ = this;
            var elm = _.elm;
            elm.css('zIndex','2')
            elm.animate({
                opacity:1
            },_.duration,function(){
                elm.animate({
                    opacity:0
                },_.duration,null,function(){
                    elm.css('zIndex','-1')
                },_.delay)
            })
        }
        _top.toast = new toast()
        return _top.toast
    }
    
    function rotation() {
        var _top = this;
        function rotation(){
            var _ = this;
            _.parent = _top;
            _.elm = _.parent.curShowImg; // jq dom
            _.angle = 90; // 旋转角度
            _.scale = 1; // scale(x,y)水平和垂直方向的缩放比例
        }
        var pto = rotation.prototype;
        pto.roate = function(dom, angle, scale) {
            var _ = this,
                _p = _.parent,
                _pc = _p.config;
            // 原生dom，当前预览的图片
            _.elm = _.elm ? _.elm : _.parent.curShowImg[0];
            if (_.elm && _.elm.nodeType === 1) {
                // 旋转前回调
                _pc.onBeforeRoate(_)
                _.set(_.angle, _.scale)
                // 旋转后回调
                _pc.onRoate(_)
            }
        }
        pto.set = function(angle, scale) {
            var _ = this;
            // 原生dom
            _.elm = _.elm ? _.elm : _.parent.curShowImg[0];
            // 判断是否穿入了参数
            if (arguments.length) {
                // 取传递的参数值，或者手动改变的旋转角度赋值，或者0
                angle = angle || 0;
                scale = scale || 1;
            } else {
                // 取传递的参数值，或者手动改变的旋转角度赋值，或者0
                angle = _.angle || 0;
                scale = _.scale || 1;
            }
            _.elm.style.mozTransform = "rotate(" + angle + "deg) scale(" + scale + ")";
            _.elm.style.webkitTransform = "rotate(" + angle + "deg) scale(" + scale + ")";
            _.elm.style.oTransform = "rotate(" + angle + "deg) scale(" + scale + ")";
            _.elm.style.transform = "rotate(" + angle + "deg) scale(" + scale + ")";
            _.elm.style.msTransform = "rotate(" + angle + "deg) scale(" + scale + ")";
        }
        _top.rotation = new rotation()
        return _top.rotation
    }

    function reset() {
        var _top = this;
        function reset() {
            var _ = this, _p;
            _.parent = _top;
            _p = _.parent;
            // 原生dom，当前预览的图片
            _.elm = _p.curShowImg;
            // 旋转角度
            _.angle = 0;
            // scale(x,y)水平和垂直方向的缩放比例
            _.scale = 1;
        }
        var pto = reset.prototype;
        pto.set = function() {
            var _ = this,
                _p = _.parent,
                _pc = _p.config;
            _.elm = _.elm ? _.elm : _p.curShowImg;
            // 回调
            _pc.onBeforeReset(_)
            // 判断是否穿入了参数
            if (!arguments.length) {
                _p.rotation.set(_.angle, _.scale)
            }
            _p.scaling.scalePercent = 100;
            
            _.elm[0].css('width', _pc.imgW + 'px')
            _.elm[0].css('height', _pc.imgH + 'px')
            _.elm[0].css('top', _pc.top + 'px')
            _.elm[0].css('left', _pc.left + 'px')
            // 回调
            _pc.onReset(_)
        }
        _top.reset = new reset()
        return _top.reset
    }

    function scaling() {
        var _top = this,
            min = 6,
            max = 3200;

        function scaling() {
            var _ = this, _p;
            _.parent = _top;
            _p = _.parent;
            // 1放大 -1缩小
            _.direction = _p.direction;
            // 图片
            _.elm = _.elm ? _.elm : _p.curShowImg;
            // 缩放比例 默认100%
            _.scalePercent = 100;
            _.min = min;
            _.max = max;
        }
        var pto = scaling.prototype;
        
        pto.scaleMin = function(_){
            type(_) === 'number' 
                ? arguments.length 
                    ? this.min = Math.max(_,6) 
                    : this.min
                : console.warn('[warn]:scaleing-scaleMin 参数不合法！')
        }

        pto.scaleMax = function(_){
            type(_) === 'number' 
                ? arguments.length 
                    ? this.max = Math.max(_,this.min) 
                    : this.max
                : console.warn('[warn]:scaleing-scaleMax 参数不合法！')
        }

        pto.scale = function(direction) {
            var _ = this, _p, _pc,
                // loadingTip,
                img, width, height, top, left, baseW, baseH ;
            // 非预览时的滚动，不做处理
            if(!_.elm && !_.parent.curShowImg) {
                return;
            } 
            _.parent = _top;
            _p = _.parent;
            _pc = _p.config;
            _.direction = direction;
            img = _.elm ? _.elm : _.parent.curShowImg,
            baseW = _.baseW,
            baseH = _.baseH,
            width, height, top, left;
            // parseInt(img[0].css('width').replace(/px/g, ''));
            width = parseFloat(replacePx(img[0].css('width')));
            height = parseFloat(replacePx(img[0].css('height')));
            top = parseFloat(replacePx(img[0].css('top')));
            left = parseFloat(replacePx(img[0].css('left')));

            if (direction == 1) {
                // 回调
                _pc.onBeforeEnlarge(_)
                if(_.scalePercent >= _.max) {
                    console.warn('[warn]:scaleing-scale-已达到最大缩放比例')
                    return;
                }

                img[0].css('width', (width + baseW) + 'px')
                img[0].css('height', (height + baseH) + 'px')
                img[0].css('top', (top - baseH / 2) + 'px')
                img[0].css('left', (left - baseW / 2) + 'px')

                _.scalePercent += 6;
                // loadingTip.text(_.scalePercent + '%');
                _p.toast.center('toast', _.scalePercent + '%');
                _pc.onEnlarge(_)
            } else {
                _pc.onBeforeNarrow(_)

                if (_.scalePercent <= _.min) {
                    // loadingTip.fadeOut(200);
                    console.warn('[warn]:scaleing-scale-已达到最小缩放比例')
                    return;
                }
                img[0].css('width', (width - baseW) + 'px')
                img[0].css('height', (height - baseH) + 'px')
                img[0].css('top', (top + baseH / 2) + 'px')
                img[0].css('left', (left + baseW / 2) + 'px')

                _.scalePercent -= 6;
                // loadingTip.text(_.scalePercent + '%');
                _p.toast.center('toast', _.scalePercent + '%');
                // 回调
                _pc.onNarrow(_)
            }
            // loadingTip.fadeOut(200);
        }
        _top.scaling = new scaling()
        return _top.scaling
    }
    
    function download() {
        var _top = this;
        function download() {
            var _ = this;
            _.parent = _top;
        }
        var pto = download.prototype;
        pto.down = function(src) {
            var _ = this, _p, _pc;
                _.parent = _top;
                _p = _.parent;
                _pc = _p.config;

            _.downSrc = src;
            _.attachName = _pc.description || '';
            _pc.onBeforeDownload(_);
            if (/Trident/.test(window.navigator.appVersion) || /MSIE/.test(window.navigator.appVersion)) {
                pic = window.open(_.downSrc, _.attachName);
                setTimeout('pic.document.execCommand("saveas")', 0);
            } else {
                var a = createEle('a');
                if(isCrossDomain(_.downSrc)) {
                    var connSymbol = '?';
                    if (_.downSrc.indexOf('?Expires=') != -1) {
                        connSymbol = '&';
                    }
                    a.setAttribute('href',  _.downSrc+connSymbol+'attname='+_.attachName);
                } else{
                    a.setAttribute('href',  _.downSrc);
                    a.setAttribute('download', _.attachName);
                }
                a.click();
            }
            _pc.onDownload(_);
        }
        _top.download = new download()
        return _top.download
    }
    function isCrossDomain(src) {
        if(src.indexOf('http') > -1 && src !== window.location.origin) {
            return true;
        }
        return false;
    }
    function getfullScreenFn() {
        var divDom = createEle('div');
        temp = divDom.requestFullscreen || divDom.mozRequestFullScreen || divDom.webkitRequestFullscreen || divDom.msRequestFullscreen;
        return temp
    }
    function getExitFullScreenFn() {
        temp = doc.exitFullScreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        return temp
    }
    /**
     * 全屏 TODO
     * fullScreenType: 'iframe', // 全屏方式（iframe内全屏，'window'-窗口全屏）
     */
    function fullScreen() {
        var _top = this;
        function fullScreen() {
            var _ = this;
            _.parent = _top;
        }
        var pto = fullScreen.prototype;
        pto.setFullScreen = function(ele) {
            var _ = this,
                _p = _.parent,
                _pc = _p.config;
            // 回调
            _pc.onBeforeFullScreen(_)
            // 全屏
            fullScreenFn && fullScreenFn.apply(ele);
            // 改变是否全屏的状态
            _.isFullScreen = true
            // 回调
            _pc.onFullScreen(_)
        }
        pto.exitFullScreen = function() {
            var _ = this,
                _p = _.parent,
                _pc = _p.config;
            // 回调
            _pc.onBeforeFullScreen(_)
            // 退出全屏
            exitFullScreenFn && exitFullScreenFn.apply(doc);
            // 改变是否全屏的状态
            _.isFullScreen = false;
            // 回调
            _pc.onFullScreen(_)
        }
        _top.fullScreen = new fullScreen()
        return _top.fullScreen
    }

    function judgeProportion() {
        var _top = this,
            _topC = _top.config,
            proportion = _topC.columnsProportion.split(':'),
            totalP, p1, p2;
        if(proportion.length <= 1) {
            console.warn('[warn]:config-columnsProportion参数必须是x:y比值型');
            return false;
        }
        p1 = proportion[0];
        p2 = proportion[1];
        if(!/^[1-9]\d*$/.test(p1) || !/^[1-9]\d*$/.test(p2)) {
            console.warn('[warn]:config-columnsProportion参数的比值必须是正整数');
            proportion = [1, 1]
            return false;
        }
        totalP = parseInt(p1) + parseInt(p2);
        // 占比左（上）
        _topC.colPercentLT = (p1/totalP*100).toFixed(2);
        // 占比右（下）
        _topC.colPercentRB = 100 -  _topC.colPercentLT;
        return true
    }
    // 事件发布订阅触发机制
    var Event = function () {
        this.subscibers = {};//保存事件的回调函数  
    };

    //扩展发布订阅原型
    Event.prototype = {
        constructor: Event,//保持原型链的完整
        on: function (type, callback) {  //绑定事件
            if (!this.subscibers[type]) {
                this.subscibers[type] = [];
                this.subscibers[type].push(callback);
            } else {
                this.subscibers[type].push(callback);
            }
        },
        off: function (type) {  //移除事件
            this.subscibers[type] = [];
        },
        emit: function (type) { //触发事件
            var t = this;
            if (typeof this.subscibers[type] == 'object') {
                this.subscibers[type].forEach(function (fn, i) {
                    fn.call(t);
                });
            }
        }
    };

    // 模块方法数组
    var modulesArr = null;
    function regModulesFn() {
        var _top = this;
        modulesArr.forEach(function(fn, index) {
            fn.call(_top)
        })
    }

    function getAttr(attr){
        return this.getAttribute(attr) || ''
    }

    function setAttr(key,value){
        return this.setAttribute(key,value);
    }

    function getTitleName(node){
        if(node.hasOwnProperty('nodeType')){
            return getAttr.call(node,'title') || getAttr.call(node,'alt')
        }else{
            return node.name;
        }
    }
    //
    function getMapList(elm){
        if(isArray(elm) !== 'array'){
            elm =  elm.length ? [].slice.call(elm) : []
        }
        var obj = emptyObject();
        elm.forEach(function(item,index){
            obj['img' + index] = {
                index:index,
                src:item.src,
                compressSrc:'',
                handler:emptyObject(),
                name:getTitleName(item)
            }
        });
        return obj;
    }
    function filterSrc(src) {
        var srcArr = src.split('.'),
            suffix = srcArr[srcArr.length-1]
        if(srcArr.length <=1 || (!/(gif|jpg|jpeg|png|GIF|JPG|JPEG|PNG)$/.test(suffix))) {
            return false;  
        }
        return true;
    }
    // 入口
    function picPreview(options) {
        var _top = this;
        // 原生dom, jq dom, arr
        var elm = options.imgArr;
        // 用户配置
        var config = options.config;
        var imgObj = null;
        var curImgIndex = 0;
        var pub = new Event();
        _top.MapList = emptyObject();
        // 当前预览对象还未渲染模板
        _top.renderFlag = true;
        // 默认配置
        _top.config = defaults;
        // 合并配置
        if(options.config) {
            Object.assign(_top.config, options.config);
        }
        
        // 是否首次单击图片，默认false
        _top.config.isFirstClick = false;
        // 当前活动对象
        activePreview = _top;
        // 模块注册
        modulesArr = [];
        modulesArr.push(toast);
        (config.title || config.titleFormat) && modulesArr.push(title);
        config.descriptionFormat && modulesArr.push(description);
        (config.resetBtnShow || config.oneToOneBtnShow) && modulesArr.push(reset);
        config.rotateBtnShow && modulesArr.push(rotation);
        config.scaleBtnShow && modulesArr.push(scaling);
        config.downloadShow && modulesArr.push(download);
        config.fullScreenBtnShow && modulesArr.push(fullScreen);
        // config.tailoringBtnShow && modulesArr.push('description')
        
        regModulesFn.call(_top);
        //延迟初始化
        pub.on('initPage',function(){
            paging.call(_top);
        });

        // 分栏布局
        if(config.LRcolumns && config.UDcolumns) {
            _top.config.UDcolumns = false;
            console.warn('[warn]:config-仅可配置一种分栏布局]')
            judgeProportion.call(_top);
        } else if(config.LRcolumns || config.UDcolumns) {
            judgeProportion.call(_top);
        } else{}
        
        // 判断是否配置了默认展示第几张图
        if(!!config.showImgIndex) {
            if(type(config.showImgIndex) == 'number') {
                if(config.showImgIndex > elm.length-1) {
                    console.warn('[warn]:config-showImgIndex值超出范围');
                    return;
                } else {
                    curImgIndex = config.showImgIndex;
                }
            } else{
                console.warn('[warn]:config-showImgIndex参数必须是数值型');
                return;
            }
            _top.config.showImgIndex = curImgIndex;
        } else{
            // _top.config.showImgIndex = null; // 重赋值
        }

        if(elm && elm.length) {
            _top.imgArr = elm;
            _top.MapList = getMapList(elm);

            renderTmpl.call(_top)
            _top.toast.center('loading');
        
            // node节点
            if(elm[0].nodeType != null){ 
                imgObj = elm[curImgIndex];
                var newArr = [], count = 0;
                [].slice.call(elm).forEach(function(item, index) {
                    if(!filterSrc(item.src)) {
                        return;
                    }
                    item.setAttribute('index', count);
                    newArr.push(item)
                    count++;
                });
                elm = newArr;
                // 当前图片dom
                // _top.imgObj = imgObj;
                // 图片组
                // _top.imgArr = elm;

                pub.emit('initPage');

                // 单击图片事件，显示预览图
                [].slice.call(elm).forEach(function(item, index) {
                    bind(elm[index], 'click', function() {
                        var img = this;
                        // 判断是否首次单击事件
                        if(!_top.config.isFirstClick) {
                            _top.config.isFirstClick = true;
                            // 有showImgIndex配置，且上面已对改配置的值做了判断
                            if(!!config.showImgIndex) {
                            } else {
                                // 重赋值
                                _top.config.showImgIndex = img.getAttribute('index');
                            }
                        } else{
                            // 重赋值
                            _top.config.showImgIndex = img.getAttribute('index');
                            // _top.paging.index = _top.config.showImgIndex;
                        }
                        _top.paging.index = _top.config.showImgIndex;
                        _top.index = _top.config.showImgIndex;
                        // _top.imgObj = img;
                        // preview.call(_top, img);
                        preview.call(_top);
                    });
                })
            }else{
                
                // 调用翻页模块
                // paging.call(_top);
                pub.emit('initPage');
                // 有showImgIndex配置，且上面已对改配置的值做了判断
                if(!!config.showImgIndex) {
                    // imgDom = _top.imgArr[_top.config.showImgIndex];
                } else {
                    // imgDom = _top.imgArr[0];
                    // 重赋值
                    _top.config.showImgIndex = 0;
                    // 分页，当前index重赋值
                    _top.paging.index = 0;
                }
                _top.index = _top.config.showImgIndex;
                // _top.imgObj = imgDom;
                // preview.call(_top, imgDom);
            }
        } else {
            console.warn('[warn]:config-imgArr参数不合法')
            return;
        }
    }

    function preview(imgObj) {
        
        var _top = this,
            _topC = _top.config,
            src, name, 
            curId, curOuterWrap,
            curIdx = _top.index;
        src = _top.MapList['img'+curIdx].src    
        name = _top.MapList['img'+curIdx].name

        curId = _topC.id;
        curOuterWrap = doc.querySelector('#'+curId);
        curOuterWrap.parentNode.css('display', 'block');
        
        // 当前展示图片src
        _topC.src = src;
         // 图片描述（名称）
        _topC.description = name;
        // 图片缩放百分比，默认100
        _top.scaling.scalePercent = 100;
        // 计算位置
        setPosition.call(_top);
    }
    
    
    function setPosition() {
        var _top = this;
        var _topC = _top.config;
        var imgTemp = new Image();// 创建一个image对象
        var srcOrigin = _topC.src.replace(/\/\//g, ',').split('/')[0].replace(/,/g, '//');
        // var realWidth, realHeight;
        var curIdx = _top.index;
        var curImgInfos = _top.MapList['img'+curIdx];
        _topC.originalSrc = curImgInfos.src; 
        
        if(_topC.compressOpen) {
            if(srcOrigin.indexOf('http') > -1 && srcOrigin !== window.location.origin) {
                // 判断是否跨域，跨域不支持压缩功能
                console.warn('[warn]:config-compressOpen-跨域不支持图片压缩')
                _topC.compressOpen = false;
            } else{
                // 判断是否已压缩过图片，是则直接取压缩后的路径，宽高展示
                if(!curImgInfos.compressSrc) {
                    // 图片压缩
                    compress(
                        _topC.src, 
                        {},
                        function(data) {
                            _topC.src = data.url;
                            curImgInfos.compressSrc = data.url;
                            curImgInfos.realWidth = data.width;
                            curImgInfos.realHeight = data.height;
                            loadedImgHanlder.call(_top)
                    })
                } else{
                    _topC.src = curImgInfos.compressSrc;
                    loadedImgHanlder.call(_top)
                }
                return;
            }
        }

        // 图片加载完成后执行
        imgTemp.onload = function () {
            // 图片真实宽度
            curImgInfos.realWidth = this.width;
            curImgInfos.realHeight = this.height;
            loadedImgHanlder.call(_top)
        }
        // 指定url
        imgTemp.src = _topC.src;
    }
    // 计算宽高位置
    function calculation(realWidth, realHeight) {
        var _top = this,
            _topC = _top.config;
        // 左右栏的百分比
        // var colPercentL, colPercentR;
        var newWrapW, newWrapH, maxW, maxH, 
            wrapAspectRatio,
            // 图片宽高比
            imgAspectRatio = realWidth/realHeight;
        // 分栏布局
        if(_topC.LRcolumns || _topC.UDcolumns) {
            // 两栏占比 前面已判断过分栏占比数据类型
            // colPercentL = parseFloat((100/(_topC.columnsProportion+1)).toFixed(2)) ;
            // colPercentR = 100 - colPercentL;
            // // 按占比计算后的预览图片容器宽高
            newWrapW = maskW/100 * _topC.colPercentLT;
            newWrapH = maskH/100 * _topC.colPercentLT;

            // 左右分栏
            if(_topC.LRcolumns) {
                // 图片预览区域宽高比
                wrapAspectRatio = newWrapW/maskH;

                if(imgAspectRatio > wrapAspectRatio) {
                    // 宽屏图
                    // 图片真实宽度小于图片展示栏目的宽度
                    if (realWidth <= newWrapW) {
                        // 图片真实高度一定小于等于展示区高度
                        imgW = realWidth;
                        imgH = realHeight;
                        // imgTop = (maskH - imgH) / 2;
                        // imgLeft = (newWrapW - imgW) / 2;
                    } else {
                        // 宽度 大于 图片展示栏目的宽度
                        // 缩小宽度
                        imgW = newWrapW;
                        // 按照宽度缩小比例 缩小高度
                        imgH = (imgW / realWidth) * realHeight;
                        // imgTop = (maskH - imgH) / 2;
                        // imgLeft = (newWrapW - imgW) / 2;
                    }
                } else {
                    // 竖屏图
                    if (realHeight <= maskH) {
                        imgH = realHeight;
                        imgW = realWidth;
                        // imgTop = (maskH - imgH) / 2;
                        // imgLeft = (newWrapW - imgW) / 2;
                    } else {
                        // 缩小高度
                        imgH = maskH;;
                        // 按照宽度缩小比例 缩小宽度
                        imgW = (maskH / realHeight) * realWidth;
                    }
                }
                imgTop = (maskH - imgH) / 2;
                imgLeft = (newWrapW - imgW) / 2;
                // img栏宽高占比
                _topC.imgColW = _topC.colPercentLT;
                _topC.imgColH = 100;
                // table栏宽高占比
                _topC.tableColW = _topC.colPercentRB;
                _topC.tableColH = 100;
            }
            // 上下分栏
            if(_topC.UDcolumns) {
                // 图片预览区域宽高比
                wrapAspectRatio = maskW/newWrapH;

                if(imgAspectRatio > wrapAspectRatio) {
                    // 宽屏图
                    // 图片真实宽度小于图片展示栏目的宽度
                    if (realWidth <= maskW) {
                        // 图片真实高度一定小于等于展示区高度
                        imgW = realWidth;
                        imgH = realHeight;
                    } else {
                        // 宽度 大于 图片展示栏目的宽度
                        // 缩小宽度
                        imgW = maskW;
                        // 按照宽度缩小比例 缩小高度
                        imgH = (imgW / realWidth) * realHeight;
                    }
                } else {
                    // 竖屏图
                    if (realHeight <= newWrapH) {
                        imgH = realHeight;
                        imgW = realWidth;
                    } else {
                        // 缩小高度
                        imgH = newWrapH;
                        // 按照宽度缩小比例 缩小宽度
                        imgW = (newWrapH / realHeight) * realWidth;
                    }
                }
                imgTop = (newWrapH - imgH) / 2;
                imgLeft = (maskW - imgW) / 2;

                // img栏宽高占比
                _topC.imgColW = 100;
                _topC.imgColH = _topC.colPercentLT;
                // table栏宽高占比
                _topC.tableColW = 100;
                _topC.tableColH = _topC.colPercentRB;
            }
            return;
        }
        // img栏宽高占比
        _topC.imgColW = 100;
        _topC.imgColH = 100;
        // table栏宽高占比
        _topC.tableColW = 100;
        _topC.tableColH = 100;
        // 宽屏图片
        if (realWidth >= realHeight) {
            // 宽度小于maskW的图
            if (realWidth <= maskW) {
                if (realHeight <= maskH) {
                    imgW = realWidth;
                    imgH = realHeight;
                } else {
                    imgH = maskH;
                    imgW = (maskH / realHeight) * realWidth;
                }
                imgLeft = (maskW - imgW) / 2;
                imgTop = (maskH - imgH) / 2;
            } else {
                // 宽度大于maskW的图
                maskTL = browTL / 2;
                maskTT = 0;
                if (realWidth <= browW) {
                    // 宽度小于浏览器的宽度
                    if (realHeight <= browH) {
                        imgW = realWidth;
                        imgH = realHeight;
                    } else {
                        imgH = browH;
                        imgW = (browH / realHeight) * realWidth;
                    }
                    // imgLeft = (browW - imgW) / 2;
                    // imgTop = (browH - imgH) / 2;
                } else {
                    // 宽屏图片
                    if (realHeight <= browH) {
                        imgW = browW;
                        imgH = realHeight * (imgW / realWidth);
                    } else {
                        if ((browW / realWidth) * realHeight >= browH) {
                            imgH = browH;
                            imgW = (imgH / realHeight) * realWidth;
                        } else {
                            imgW = browW;
                            imgH = (imgW / realWidth) * realHeight;
                        }
                    }
                    // imgTop = (browH - imgH) / 2;
                    // imgLeft = (browW - imgW) / 2;
                }
                imgTop = (browH - imgH) / 2;
                imgLeft = (browW - imgW) / 2;
            }
        } else {
            // 竖屏图片
            if (realHeight <= maskH) {
                imgW = realWidth;
                imgH = realHeight;
                imgLeft = (maskW - imgW) / 2;
                imgTop = (maskH - imgH) / 2;
            } else {
                // 高度大于maskH的图
                maskTL = browTL / 2;
                maskTT = 0;
                imgTop = 0;
                if (realHeight <= browH) {
                    imgW = realWidth;
                    imgH = realHeight;
                } else {
                    // 高度大于浏览器高度
                    imgH = browH;
                    imgW = (imgH / realHeight) * realWidth;
                }
                imgLeft = (browW - imgW) / 2;
                imgTop = (browH - imgH) / 2;
            }
        }
    }

    function loadedImgHanlder() {
        var _top = this;
        var _topC = _top.config;
        var curIdx = _top.index;
        var realWidth = _top.MapList['img'+curIdx].realWidth;
        var realHeight = _top.MapList['img'+curIdx].realHeight;

        calculation.call(_top, realWidth, realHeight);

        _top.scaling.baseW = Math.floor(parseFloat(imgW / (100 / baseScale)));
        _top.scaling.baseH = Math.floor(parseFloat(imgH / (100 / baseScale)));
        // img宽度
        _topC.imgW = imgW
        // img高度
        _topC.imgH = imgH
        // img位置距离顶部距离
        _topC.top = imgTop - 32
        _topC.left = imgLeft
    
        // renderTmpl.call(_top);
        renderImg.call(_top);
    }
    function renderTmpl() {
        // 模板渲染
        var _top = this,
            // curIdx = _top.index,
            _topC = _top.config,
            curId,
            curOuterWrap,
            div = createEle('div');
        
        // 蒙版宽度
        _topC.styleW = maskW
        // 蒙版高度
        _topC.styleH = maskH
        // 蒙版距离左侧距离
        _topC._left = maskTL
        // 蒙版距离顶部距离
        _topC._top = maskTT

        if(_top.renderFlag) {
            // 根据图片数量和配置，控制翻页按钮的显示与否
            if(_top.imgArr.length>1) {
                _topC.isPagingBtnShow = true;
            } else{
                if(_topC.pagingBtnShow) {
                    // 强制显示
                    _topC.isPagingBtnShow = true;
                } else {
                    // 如果只有一张图片，不显示翻页按钮
                    _topC.isPagingBtnShow = false;
                }
            }
            // 动态生成的id
            _topC.id = 'preview'+ uuidGrow();
            curId = _topC.id;
            div.css('display', 'none');
            // existWraps ? removeNode.call(existWraps.parentNode) : '';
            div.innerHTML = template('picPreview-template')(_top.config);
            doc.body.appendChild(div);
            curOuterWrap = doc.querySelector('#'+curId);
            // 提示的dom
            _top.toastDom = getSelectors(curOuterWrap, '.preview-toast')
            // 图片描述的dom
            _top.DescDom = getSelectors(curOuterWrap, '.preview-desc')
            
            regEvent.call(_top);
            // 移除首次加载外部loading
            // _topC.removeLoadingCb()
            _top.renderFlag = false;
        }
    }
    function removeNode(){
        return this.parentNode.removeChild(this);
    }

    function getSelectors(oParent, selectors, isElms){
      return  isElms ? oParent.querySelectorAll(selectors) : oParent.querySelector(selectors);
    }
    
    function renderImg() {
        var _top = this,
            _topC = _top.config,
            curIdx = _top.index,
            curId, curOuterWrap;
        var curImgInfos,imgDom;

        if(_top.renderFlag) {
            
        } else {
            // 改变dynamicImage容器中的布局样式
            curId = _topC.id;
            curOuterWrap = doc.querySelector('#'+curId);
            curImgInfos = _top.MapList['img'+curIdx];
            imgCol = getSelectors(curOuterWrap, '.preview-column-img')
            imgDom = getSelectors(curOuterWrap, 'img')

            // 蒙版
            curOuterWrap.css('width', _topC.styleW + 'px')
            curOuterWrap.css('height', _topC.styleH + 'px')
            curOuterWrap.css('top', _topC._left + 'px')
            curOuterWrap.css('left', _topC._top + 'px')

            // 图片外层容器
            imgCol.css('width', _topC.imgColW + '%')
            imgCol.css('height', _topC.imgColH + '%')

            // 图片
            imgDom.css('width', _topC.imgW + 'px')
            imgDom.css('height', _topC.imgH + 'px')
            imgDom.css('top', _topC.top + 'px')
            imgDom.css('left', _topC.left + 'px')
            imgDom.src = _topC.src
            setAttr.call(imgDom, 'originalSrc', _topC.originalSrc)
            _top.DescDom.innerText =  _topC.description
        }
        _top.toastDom.animate({
            opacity:0
        },_top.toast.duration,null,function(){
            addClass(_top.toastDom, 'p-toast')
            _top.toastDom.css('zIndex','-1')
        })
        // 旋转初始化赋值
        getSelectors(curOuterWrap, '.icon-preview-rotate').route = 0;
        // 分栏布局
        if(_topC.LRcolumns || _topC.UDcolumns) {
            var html = _topC.contentRender();
            getSelectors(curOuterWrap, '.preview-column-table').innerHTML = html
        }
    }

    function regEvent() {
        var _top = this,
            curId = _top.config.id,
            curOuterWrap = doc.querySelector('#'+curId),
            imgDom = curOuterWrap.querySelectorAll('img');
            // 当前展示的图片
            _top.curShowImg = imgDom;
            // 展示图片当前百分比
            // _top.loadingTip = getSelectors(curOuterWrap, '.preview-toast')
        
        // 注册事件
        // 关闭按钮事件
        bind(getSelectors(curOuterWrap, '.icon-preview-close'), 'click', function() {
            curOuterWrap.animate({
               transform:'scale(0)'
            },300,function(){
                // TODO
                removeNode.call(curOuterWrap.parentNode);
                _top.renderFlag = true;
            })
        })
        // 全屏
        bind(getSelectors(curOuterWrap, '.icon-preview-full-screen'), 'click', function() {
            if(_top.fullScreen.isFullScreen) {
                _top.fullScreen.exitFullScreen()
            } else {
                _top.fullScreen.setFullScreen(curOuterWrap)
            }
        })
        // 翻页
        bind(getSelectors(curOuterWrap, '.icon-preview-prev'), 'click', function() {
            _top.paging.prev()
        })
        bind(getSelectors(curOuterWrap, '.icon-preview-next'), 'click', function() {
            _top.paging.next()
        })
        // 旋转
        bind(getSelectors(curOuterWrap, '.icon-preview-rotate'), 'click', function() {
            var rotateDom = this;
            if (rotateDom.route == 4) {
                rotateDom.route = 0;
            }
            rotateDom.route++;
            _top.rotation.angle = rotateDom.route * 90;
            // _top.rotation.roate(imgDom, rotateDom.route * 90, 1)
            _top.rotation.roate(imgDom)
        })
        // 复原
        bind(getSelectors(curOuterWrap, '.icon-preview-restore'), 'click', function() {
            _top.reset.set()
        })
        // 下载
        bind(getSelectors(curOuterWrap, '.icon-preview-download'), 'click', function() {
            // 原始路径
            var src = imgDom[0].getAttribute('originalsrc');
            _top.download.down(src);
        })
        // 1:1展示原图 保留旋转角度，宽高还原
        bind(getSelectors(curOuterWrap, '.icon-preview-original-photo'), 'click', function() {
            _top.reset.set(1)
        })
        // 放大
        bind(getSelectors(curOuterWrap, '.icon-preview-enlarge'), 'click', function() {
            _top.scaling.scale(1)
        })
        // 缩小
        bind(getSelectors(curOuterWrap, '.icon-preview-narrow'), 'click', function() {
            _top.scaling.scale(-1)
        })
        // 按下图片的那一刻
        bind(getSelectors(curOuterWrap, '.preview-img'), 'mousedown', function(e) {
            saveImgData = {
                'x': e.pageX,
                'y': e.pageY,
                'elm': e.target
            };
            e.preventDefault();
        })
        
        // utils.saveImgData
        bind(curOuterWrap, 'mouseup', function() {
            saveImgData = null;
        })
        bind(curOuterWrap, 'mousemove', function(e) {
            if (!!saveImgData && saveImgData.elm) {
                var calcx = e.pageX - saveImgData.x;
                var calcy = e.pageY - saveImgData.y;
                saveImgData.x = e.pageX;
                saveImgData.y = e.pageY;
                saveImgData.elm.style.left = parseFloat(replacePx(saveImgData.elm.css('left'))) + calcx + 'px';
                saveImgData.elm.style.top = parseFloat(replacePx(saveImgData.elm.css('top'))) + calcy + 'px';
            }
            e.preventDefault();
        })
    }
    function replacePx(st) {
        return st.replace(/px/g, '')
    }

    function stopBubble(e) { 
        if ( e && e.stopPropagation ) {
            e.preventDefault(); 
            e.stopPropagation();
        } else { //IE
            window.event.cancelBubble = true; 
        }
    }
    function scrollFunc(e,scop) {
        var e = e || window.event;
        if (e.wheelDelta) {
            // 判断浏览器IE，谷歌滑轮事件         
            e.wheelDelta > 0 
                ? scop.scaling.scale(1)
                : scop.scaling.scale(-1)
        } else if (e.detail) { 
            // Firefox滑轮事件
            e.detail > 0
                ? scop.scaling.scale(1)
                : scop.scaling.scale(-1)
        } else{
            console.warn('[warn: scrollFunc-无滚轮事件]')
        }
        scop.renderFlag ? undefined : stopBubble(e);
    }

    function regMouseWheel() {
        if (doc.addEventListener) {//火狐
            doc.addEventListener('DOMMouseScroll', function(e){
                if (!!activePreview){
                    scrollFunc(e,activePreview)
                }
            }, false);
        }
        window.onmousewheel = doc.onmousewheel = function(e){
            if (!!activePreview) {
                scrollFunc(e,activePreview)
            }
        };
    }
    
    if(isFirstEnter) {
        // 仅注册一次滚轮事件
        isFirstEnter = false
        regMouseWheel();
    }
    // 初始化
    picPreview.init = function (options) {
        return new picPreview(options)
    }
    exports.exports.picPreview = picPreview;
})));