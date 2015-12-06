/*! BitwiseCmd 2015-12-06 */
"use strict";window.core={},function(){window.core.is={plainObject:function(a){return"object"==typeof a&&a instanceof Object},aFunction:function(a){return"function"==typeof a},string:function(a){return"string"==typeof a},regex:function(a){return"object"==typeof a&&this.constructedFrom(RegExp)},constructedFrom:function(a,b){return a instanceof b},htmlElement:function(a){return a instanceof HtmlElement},array:function(a){return a instanceof Array},number:function(a){return"number"==typeof a&&!isNaN(a)}}}(),function(){function a(a,b){return"string"==typeof a?a+" "+b:b}var b=window.core.is;window.core.should={beNumber:function(c,d){this.check(b.number(c),c+" is not a number"),this.check(isFinite(c),a(d,"is an infinite number"))},bePositiveInteger:function(b,c){this.beNumber(b),this.check(b>=0,a(c,"should be positive integer"))},notBeNull:function(b,c){this.check(null!=b,a(c,"is null or undefined"))},beString:function(a,b){this.check("string"==typeof a,"should be a string")},check:function(a,b){if(a!==!0)throw new Error(b)}}}(),function(a){function b(a){this.store=a||{},this.resolutionStack=[]}function c(a){if(e(this.resolutionStack,a))throw new Error("Failed to resolve dependency: "+a+". Circular reference: "+this.resolutionStack.join(" < "));this.resolutionStack.unshift(a);var b=this.store[a];if(null==b)throw new Error(a+" component is not registered");return null==b.resolved&&b.createInstance(),this.resolutionStack.shift(),b.resolved}function d(a){this.def=a,this.resolved=null}function e(a,b){for(var c=a.length;c-- >0;)if(a[c]===b)return!0;return!1}var f=a.is;b.prototype.register=function(a,b){var c;return null!=this.store[a]&&console.warn("Previous registration for [%1] has been replaced",a),c=b instanceof d?b:new d(b),c.name=a,this.store[a]=c,c},b.prototype.resolve=function(a){return c.call(this,a)},b.prototype.clone=function(){var a={};for(var c in this.store)a[c]=this.store[c];return new b(a)},d.prototype.createInstance=function(){var a=this.def;"function"==typeof a?this.resolved=a():this.resolved=a,f.aFunction(this.onFirstTimeResolve)&&this.onFirstTimeResolve(this.resolved)},b.Registration=d,a.Container=b}(window.core),function(){function a(a){this.models={},this.di=a,this.runList=[],this.compositionList=[]}function b(a){a.forEach(function(a){a()})}a.prototype.get=function(a){return this.di.resolve(a)},a.prototype.set=function(a,b){this.di.register(a,b)},a.prototype.run=function(a){this.runList.push(a)},a.prototype.compose=function(a){this.compositionList.push(a)},a.prototype.initialize=function(){b(this.compositionList),b(this.runList)},window.core.AppShell=a}(),function(core){function normalize(a){return a.replace(/(\r|\n)+/g,"").replace("'","\\'")}function replaceToken(a,b){if(0==a.indexOf("each")){var c=/([\w\.]+)\sin\s([\w\.]+)/g,d=c.exec(a),e=d[1],f=d[2];return"var "+e+"_list = "+f+".slice(), "+e+";\r\nwhile(("+e+"="+e+"_list.splice(0,1)[0])!==undefined)\r\n{"}return"/"==a?"}":"		html.push("+a+");"}var html={},should=core.should;html.element=function(a,b){var c=document.createElement("div");return c.innerHTML=html.template(a,b),c.children[0]},html.template=function(a,b){should.beString(a,"template");var c,d=/(?:{([^}]+)})/g;return c=null==b?a:a.replace(d,function(a,c){return html.escapeHtml(b[c])})},html.compileTemplate=function(template){var regex=/(?:{([^}]+)})/g,sb=[];sb.push("(function() {"),sb.push("return function (m) { "),sb.push("	var html = [];");for(var m,index=0;null!==(m=regex.exec(template));)m.index>index&&sb.push("		html.push('"+normalize(template.substr(index,m.index-index))+"');"),sb.push(replaceToken(m[1])),index=m.index+m[0].length;return index<template.length-1&&sb.push("		html.push('"+normalize(template.substr(index,template.length-index))+"');"),sb.push("	return html.join('');"),sb.push("}"),sb.push("})()"),eval(sb.join("\r\n"))},html.escapeHtml=function(a){return null==a?a:("string"!=typeof a&&(a=a.toString()),a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"))},core.html=html}(window.core),function(a){function b(){this.$store={},this.$executionHandlers=[]}var c=a.is;b.create=function(a){var c=new b;for(var d in a)a.hasOwnProperty(d)&&(Object.defineProperty(c,d,{get:b.createGetter(d),set:b.createSetter(d)}),c[d]=a[d]);return Object.seal(c)},b.createGetter=function(a,b){return function(){return this.$store[a]}},b.createSetter=function(a,b){return function(b){this.$store[a]=b,this.notifyPropertyChanged(a,b)}},b.prototype.observe=function(a,b){var d;if(c.aFunction(a))d=a;else{if(!c.string(a)||!c.aFunction(b))return void console.warn("Unsupported set of arguments: ",arguments);d=function(c,d){c===a&&b(d)}}var e=this.$executionHandlers,f=e.push(d);return function(){e.splice(1,f)}},b.prototype.notifyPropertyChanged=function(a,b){this.$executionHandlers.forEach(function(c){c(a,b)})},b.prototype.store=function(){return this.$store},b.prototype.keys=function(){return Object.keys(this.$store)},a.ObservableObject=b}(window.core),function(a){var b=new a.Container,c=new a.AppShell(b);c.set("cmdConfig",a.ObservableObject.create({emphasizeBytes:!0,theme:"dark"})),c.debugMode=!1,c.bootstrap=function(a){this.rootViewElement=a,this.set("rootView",a),this.initialize()},window.app=c}(window.core),function(a,b){function c(a){a.attachView=function(b){this.viewElement=b,"function"==typeof a.onViewAttached&&a.onViewAttached(b)},a.detachView=function(){this.viewElement=null,"function"==typeof a.onViewDetached&&a.onViewDetached(viewElement)}}function d(b){for(var c,d,e,f=b.querySelectorAll("[data-controller]"),g=0,h=f.length;h>g;g++)e=f[g],c=e.getAttribute("data-controller"),d=a.controller(c),null!=d?(d.attachView(e),"function"==typeof d.detachView&&e.addEventListener("DOMNodeRemoved",function(a){e===a.target&&d.detachView()})):console.warn(c+" controller wasn't found")}var e=b.should;a.controller=function(a,d){if(e.beString(a,"name"),null==d)return this.get(a);var f=new b.Container.Registration(d);f.onFirstTimeResolve=function(a){c(a)},this.set(a,f)},a.run(function(){d(a.get("rootView"),a.di)})}(window.app,window.core),function(a){function b(a,b){this.html=a,this.isCompiled=b===!0}function c(c){var d=c.querySelectorAll("[data-template]"),e=a.templates;Array.prototype.forEach.call(d,function(c){var d=c.getAttribute("data-template");if(e[d]instanceof b)return void console.warn(d+" templates already registered");var f=new b(c.innerHTML);e[d]=f,c.hasAttribute("data-compiled")&&(f.process=a.get("html").compileTemplate(f.html),f.isCompiled=!0)})}b.prototype.render=function(b){return this.isCompiled?a.get("html").element(this.process(b)):a.get("html").element(this.html,b)},a.templates=[],a.template=function(a){var b=this.templates[a];if(null==b)throw new Error(a+" template is not found");return b},a.run(function(){c(a.get("rootView"))})}(window.app),function(a,b){function c(a){return d(a)+"ViewBuilder"}function d(a){var b=a.toString();return b.substr(8,b.indexOf("(")-8).trim()}a.modelView=function(b,d){var e=c(b);a.di.register(e,d)},a.buildViewFor=function(a){var b=c(a.constructor),d=this.di.resolve(b);return d.renderView(a)}}(window.app,window.is),app.set("calc",function(){var should=app.get("should");return{numberOfBits:function(a){return 0>a?32:(should.bePositiveInteger(a),Math.floor(Math.log(a)/Math.log(2))+1)},maxNumberOfBits:function(a){for(var b,c=[],d=0;d<a.length;d++)b=a[d],c.push(this.numberOfBits(b));return Math.max.apply(null,c)},calcExpression:function(expr){return eval(expr.expressionString)}}}),app.set("expression",function(){function Operand(a){this.input=a,this.value=parseInt(a),this.hex=Operand.toHexString(this.value.toString(16)),this.dec=this.value.toString(10),this.bin=this.value<0?(this.value>>>0).toString(2):this.value.toString(2),this.kind=this.input.indexOf("0x")>-1?"hex":"dec",this.other="dec"==this.kind?this.hex:this.dec}function SingleOperandExpression(a,b,c){this.expressionString=a,this.operand1=b,this.sign=c}function TwoOperandExpression(a,b,c,d){this.expressionString=a,this.operand1=b,this.operand2=c,this.sign=d}function MultipleOperandsExpression(a,b){this.expressionString=a,this.expressions=b}function ListOfNumbersExpression(a,b){this.expressionString=a,this.numbers=b}function Expression(){}var expression={factories:[],canParse:function(a){for(var b=a.replace(/^\s+|\s+$/,""),c=this.factories.length-1;c>=0;c--)if(this.factories[c].canCreate(b)===!0)return!0;return!1},parse:function(a){for(var b,c=a.replace(/^\s+|\s+$/,""),d=0,e=this.factories.length;e>d;d++)if(b=this.factories[d],1==b.canCreate(c))return b.create(c);return null},parseOperand:function(a){return new Operand(a)},createOperand:function(a,b){return Operand.create(a,b)},addFactory:function(a){this.factories.push(a)},Operand:Operand,TwoOperandExpression:TwoOperandExpression,SingleOperandExpression:SingleOperandExpression,ListOfNumbersExpression:ListOfNumbersExpression,MultipleOperandsExpression:MultipleOperandsExpression};return expression.addFactory({regex:/^(-?(?:\d+|0x[\d,a-f]+)\s?)+$/,canCreate:function(a){return this.regex.test(a)},create:function(a){var b=this.regex.exec(a),c=[],d=b.input;return d.split(" ").forEach(function(a){a.trim().length>0&&c.push(new Operand(a.trim()))}),new ListOfNumbersExpression(d,c)}}),expression.addFactory({regex:/^(~)(-?(?:\d+|0x[\d,a-f]+))$/,canCreate:function(a){return this.regex.test(a)},create:function(a){var b=this.regex.exec(a),c=new Operand(b[2]);return new SingleOperandExpression(b.input,c,b[1])}}),expression.addFactory({fullRegex:/^((<<|>>|>>>|\||\&|\^)?(-?((?:\d+(?!x))|(?:0x[\d,a-f]+))))+$/,regex:/(<<|>>|>>>|\||\&|\^)?(-?((?:\d+(?!x))|(?:0x[\d,a-f]+)))/g,canCreate:function(a){return this.fullRegex.lastIndex=0,this.fullRegex.test(this.normalizeString(a))},create:function(a){for(var b,c=[],d=this.normalizeString(a);null!=(b=this.regex.exec(d));)c.push(this.parseMatch(b));return new MultipleOperandsExpression(d,c)},parseMatch:function(a){var b=a[0],c=a[1],d=a[2];return null==c?new Operand(d):new SingleOperandExpression(b,new Operand(d),c)},normalizeString:function(a){return a.replace(/\s+/g,"")}}),Operand.toHexString=function(a){return 0==a.indexOf("-")?"-0x"+a.substr(1):"0x"+a},Operand.create=function(a,b){var c=a.toString(Operand.getBase(b));return"hex"==b&&(c=Operand.toHexString(c)),new Operand(c)},Operand.prototype.getLengthInBits=function(){return this.value<0?32:Math.floor(Math.log(this.value)/Math.log(2))+1},Operand.getBase=function(a){switch(a){case"bin":return 2;case"hex":return 16;case"dec":return 10}},SingleOperandExpression.prototype.apply=function(value){var str="";return str="~"==this.sign?"~"+this.operand1.value:value+this.sign+this.operand1.value,Operand.create(eval(str),this.operand1.kind)},SingleOperandExpression.prototype.isShiftExpression=function(){return this.sign.indexOf("<")>=0||this.sign.indexOf(">")>=0},Expression.prototype.toString=function(){return this.expressionString?"Expression: "+this.expressionString:this.toString()},Operand.prototype.toString=function(){return this.input},SingleOperandExpression.prototype.toString=function(){return this.sign+this.operand1.toString()},Operand.toKindString=function(a,b){switch(b){case"hex":var c=Math.abs(a).toString(16);return a>=0?"0x"+c:"-0x"+c;case"bin":return(a>>>0).toString(2);case"dec":return a.toString(10);default:throw new Error("Unexpected kind: "+b)}},Operand.getOtherKind=function(a){switch(a){case"dec":return"hex";case"hex":return"dec";default:throw new Error(a+" kind doesn't have opposite kind")}},expression}),app.set("formatter",function(){function a(a){switch(a){case"bin":return 2;case"hex":return 16;case"dec":return 10}}app.get("should"),app.get("is");return{formatString:function(b,c){return b.toString(a(c||"bin"))},padLeft:function(a,b,c){var d=Array.prototype.slice.call(a),c=c||"0";if(null==b)return a;for(;b>d.length;)d.unshift(c);return d.join("")}}}),app.set("cmd",function(){function a(a,b){var c=new app.models.ErrorResult(b);g.display(new app.models.DisplayResult(a,c))}function b(a,b){var c=b.handle(a);if(null!=c){var d=new app.models.DisplayResult(a,c);g.display(d)}}function c(a,b){return f.plainObject(a)?a:f.string(a)?{canHandle:function(b){return b===a},handle:b}:null}function d(a){var b=0;for(b;b<e.length;b++)if(e[b].canHandle(a))return e[b]}var e=[],f=app.get("is"),g=app.controller("cmdController");return{execute:function(c){var e=c.trim().toLowerCase(),f=d(e);if(null!=f)if(app.debugMode)b(e,f);else try{b(e,f)}catch(g){a(e,"Error: "+g)}else a(e,"Unsupported expression: "+e.trim())},commands:function(a){for(var b in a)a.hasOwnProperty(b)&&this.command(b,a[b])},command:function(a,b){var d=c(a,b);return null==d?void console.warn("unexpected set of arguments: ",Array.prototype.splice.call(arguments)):f.aFunction(d.canHandle)?f.aFunction(d.handle)?void e.push(d):void console.warn('handler is missing "handle" function. registration denied.'):void console.warn('handler is missing "canHandle" function. registration denied.')},clear:function(){g.clear()}}}),app.run(function(){function a(a){var b=a.parentNode.parentNode;if(b.parentNode.firstChild!=b){var c=b.parentNode;c.removeChild(b),c.insertBefore(b,c.firstChild)}}var b=app.get("cmd"),c=app.get("cmdConfig"),d=(app.get("rootView"),app.get("expression"));b.commands({help:function(){var b=document.querySelector(".result .helpResultTpl");return null!=b?void a(b):new app.models.ViewResult("helpResultTpl")},clear:function(){b.clear()},em:function(){c.emphasizeBytes=!c.emphasizeBytes},dark:function(){c.theme="dark"},light:function(){c.theme="light"},about:function(){var b=document.querySelector(".result .aboutTpl");return null!=b?void a(b):new app.models.ViewResult("aboutTpl")},"-debug":function(){app.debugMode=!0,console.log("debug is on")},"-notrack":function(){}}),b.command({canHandle:function(a){return app.get("expression").canParse(a)},handle:function(a){var b=d.parse(a);return this.locateModel(b)},locateModel:function(a){return a instanceof d.ListOfNumbersExpression?new app.models.BitwiseNumbersViewModel(a):a instanceof d.SingleOperandExpression?new app.models.BitwiseExpressionViewModel.buildNot(a):a instanceof d.MultipleOperandsExpression?new app.models.BitwiseExpressionViewModel.buildMultiple(a):new app.models.ErrorResult("Cannot create model for expression: "+a.toString())}})}),app.controller("expressionInputCtrl",function(){var a=app.get("cmd");return{onViewAttached:function(){var b=this;b.history=[],b.historyIndex=0,this.viewElement.focus(),this.viewElement.addEventListener("keyup",function(c){var d=c.target;13==c.keyCode&&0!=d.value.trim().length&&(a.execute(d.value),b.history.unshift(d.value),b.historyIndex=0,d.value="")}),this.viewElement.addEventListener("keydown",function(a){return 38==a.keyCode?(b.history.length>b.historyIndex&&(a.target.value=b.history[b.historyIndex++]),void a.preventDefault()):void(40==a.keyCode&&(b.historyIndex>0&&(a.target.value=b.history[--b.historyIndex]),a.preventDefault()))})}}}),app.controller("cmdController",function(){app.get("html"),app.get("rootView");return{clear:function(){this.viewElement.innerHTML=""},display:function(a){var b=app.buildViewFor(a),c=this.viewElement;0==c.childNodes.length?c.appendChild(b):c.insertBefore(b,c.childNodes[0])}}}),app.controller("configPanelCtrl",{onViewAttached:function(){var a=this,b=app.get("cmdConfig");a.update(b),b.observe(function(){a.update(b)})},update:function(a){var b=this.viewElement.querySelector("#emphasizeBytes");a.emphasizeBytes?b.classList.add("on"):b.classList.remove("on")}}),app.compose(function(){function a(a){var b=f.maxNumberOfBits(a);if(h.emphasizeBytes&&b%8!=0){if(8>b)return 8;var c=b-b%8;return c+8}return b}function b(a){var b=a.querySelectorAll(".bin");return Array.prototype.forEach.call(b,function(a){var b=a.textContent;h.emphasizeBytes&&(b=b.replace(/(\d{8})/g,'<span class="byte">$1</span>')),a.innerHTML=b.replace(/0/g,'<span class="bit zero">0</span>').replace(/1/g,'<span class="bit one">1</span>')}),a}function c(a){var b=a.target,c=b.textContent;"0"==c?(b.innerHTML="1",b.classList.remove("zero"),b.classList.add("one")):(b.innerHTML="0",b.classList.add("zero"),b.classList.remove("one"));var e=d(b,"TR"),f=parseInt(e.cells[1].textContent,2),g=e.dataset.kind;e.cells[0].innerHTML=i.Operand.toKindString(f,g),e.cells[2].innerHTML=i.Operand.toKindString(f,i.Operand.getOtherKind(g))}function d(a,b){for(var c=a.parentNode;c.tagName!=b;)c=c.parentNode;return c}var e=app.get("formatter"),f=app.get("calc"),g=app.get("html"),h=app.get("cmdConfig"),i=app.get("expression");String.prototype.padLeft=function(a,b){return e.padLeft(this,a,b)},app.modelView(app.models.BitwiseExpressionViewModel,{renderView:function(a){var c=app.template("bitwiseExpressionView");return b(c.render(a))}}),app.modelView(app.models.BitwiseNumbersViewModel,{renderView:function(d){d.bitsSize=a(d.numbers);var e=b(app.template("numbersList").render(d)),f=e.querySelectorAll(".bit");return Array.prototype.forEach.call(f,function(a){a.classList.add("flipable"),a.setAttribute("title","Click to flip this bit"),a.addEventListener("click",c)}),e}}),app.modelView(app.models.ViewResult,{renderView:function(a){var b=app.template(a.template);return b.render()}}),app.modelView(app.models.ErrorResult,{renderView:function(a){return g.element('<div class="error">{message}</div>',a)}}),app.modelView(app.models.DisplayResult,{renderView:function(a){var b=app.template("resultView").render(a),c=app.buildViewFor(a.content);return b.querySelector(".content").appendChild(c),b}})}),function(a){function b(a){this.expression=a,this.operands=a.numbers;var b=this.numbers=[];a.numbers.forEach(function(a){b.push(a.value)})}function c(){this.items=[],this.maxNumberOfBits=0}function d(a){this.message=a}function e(a){this.template=a}function f(b,c){this.input=b,this.inputHash=a.get("hash").encodeHash(b),this.content=c}c.buildMultiple=function(a){var b,d=a.expressions[0],e=1,f=a.expressions.length,g=new c;for(g.addOperand(d);f>e;e++)b=a.expressions[e],d=b.apply(d.value),b.isShiftExpression()?g.addShiftExpressionResult(b,d):(g.addExpression(b),g.addExpressionResult(d));return g.maxNumberOfBits=g.emphasizeBytes(g.maxNumberOfBits),g},c.buildNot=function(a){var b=new c;return b.addExpression(a),b.addExpressionResult(a.apply()),b.maxNumberOfBits=b.emphasizeBytes(b.maxNumberOfBits),b},c.prototype.addOperand=function(a){this.maxNumberOfBits=Math.max(a.getLengthInBits(),this.maxNumberOfBits),this.items.push({sign:"",label:a.toString(),bin:a.bin,other:a.other,css:""})},c.prototype.addExpression=function(a){this.maxNumberOfBits=Math.max(a.operand1.getLengthInBits(),this.maxNumberOfBits),this.items.push({sign:a.sign,label:a.operand1.input,bin:a.operand1.bin,other:a.operand1.other,css:""})},c.prototype.addShiftExpressionResult=function(a,b){this.maxNumberOfBits=Math.max(b.getLengthInBits(),this.maxNumberOfBits),this.items.push({sign:a.sign+a.operand1.input,label:b,bin:b.bin,other:b.other,css:"expression-result"})},c.prototype.addExpressionResult=function(a){this.maxNumberOfBits=Math.max(a.getLengthInBits(),this.maxNumberOfBits),this.items.push({sign:"=",label:a.toString(),bin:a.bin,other:a.other,css:"expression-result"})},c.prototype.emphasizeBytes=function(b){var c=a.get("cmdConfig");if(c.emphasizeBytes&&b%8!=0){if(8>b)return 8;var d=b-b%8;return d+8}return b},a.models.BitwiseExpressionViewModel=c,a.models.BitwiseNumbersViewModel=b,a.models.ErrorResult=d,a.models.ViewResult=e,a.models.DisplayResult=f}(window.app),app.run(function(){var a=app.get("rootView"),b=app.get("cmdConfig");b.observe("theme",function(b){var c="dark"==b?"light":"dark";a.classList.contains(b)||(a.classList.remove(c),a.classList.add(b))})}),app.run(function(){function a(){localStorage.setItem(d,JSON.stringify(c.store()))}function b(){var a,b=localStorage.getItem(d);if(core.is.string(b)){a=JSON.parse(b);for(var e in a)c[e]=a[e]}}var c=app.get("cmdConfig"),d="cmdConfig";b(),c.observe(function(b,c){a()})}),app.run(function(){var a=app.get("rootView").querySelectorAll("[data-cmd]");Array.prototype.forEach.call(a,function(a){a.addEventListener("click",function(a){app.get("cmd").execute(a.target.getAttribute("data-cmd"))})})}),function(a,b){a.set("html",b.html),a.set("is",b.is),a.set("should",b.should),a.set("bindr",b.bindr),a.set("hash",function(){function a(a){var b=[];return a.indexOf("||")?a.split("||").forEach(function(a){a.length>0&&b.push(a)}):b.push(a),b}return{encodeHash:function(a){return encodeURI(a.trim().replace(/\s/g,","))},decodeHash:function(a){return decodeURI(a).replace(/^\#/,"").replace(/,/g," ")},getArgs:function(c){b.should.beString(c,"hashValue");var d=this.decodeHash(c),e={commands:[]};return a(d).forEach(function(a){return/^\-[a-zA-Z]+$/.test(a)?void(e[a.substr(1)]=!0):void e.commands.push(a)}),Object.freeze(e)}}}),a.set("hashArgs",function(){return a.get("hash").getArgs(window.location.hash)})}(window.app,window.core);