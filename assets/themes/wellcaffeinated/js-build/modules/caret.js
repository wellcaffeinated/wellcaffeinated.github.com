/*
 *
 * Copyright (c) 2010 C. F., Wong (<a href="http://cloudgen.w0ng.hk">Cloudgen Examplet Store</a>)
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 */

define(["jquery"],function(e){var t="length",n="createRange",r="duplicate";e.fn.caret=function(i,s){var o,u,a=this[0],f=e.browser.msie;if(typeof i=="object"&&typeof i.start=="number"&&typeof i.end=="number")o=i.start,u=i.end;else if(typeof i=="number"&&typeof s=="number")o=i,u=s;else if(typeof i=="string")(o=a.value.indexOf(i))>-1?u=o+i[t]:o=null;else if(Object.prototype.toString.call(i)==="[object RegExp]"){var l=i.exec(a.value);l!=null&&(o=l.index,u=o+l[0][t])}if(typeof o!="undefined"){if(f){var c=this[0].createTextRange();c.collapse(!0),c.moveStart("character",o),c.moveEnd("character",u-o),c.select()}else this[0].selectionStart=o,this[0].selectionEnd=u;return this[0].focus(),this}if(f){var h=document.selection;if(this[0].tagName.toLowerCase()!="textarea"){var p=this.val(),d=h[n]()[r]();d.moveEnd("character",p[t]);var v=d.text==""?p[t]:p.lastIndexOf(d.text);d=h[n]()[r](),d.moveStart("character",-p[t]);var m=d.text[t]}else{var d=h[n](),g=d[r]();g.moveToElementText(this[0]),g.setEndPoint("EndToEnd",d);var v=g.text[t]-d.text[t],m=v+d.text[t]}}else var v=a.selectionStart,m=a.selectionEnd;var y=a.value.substring(v,m);return{start:v,end:m,text:y,replace:function(e){return a.value.substring(0,v)+e+a.value.substring(m,a.value[t])}}}});