/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

define(["exports"],function(e){function a(e){return u.test(e)}function p(e){return String(e).replace(/&(?!\w+;)|[<>"']/g,function(e){return h[e]||e})}function d(e,t,n,r){r=r||"<template>";var i=t.split("\n"),s=Math.max(n-3,0),o=Math.min(i.length,n+3),u=i.slice(s,o),a;for(var f=0,l=u.length;f<l;++f)a=f+s+1,u[f]=(a===n?" >> ":"    ")+u[f];return e.template=t,e.line=n,e.file=r,e.message=[r+":"+n,u.join("\n"),"",e.message].join("\n"),e}function v(e,t,n){if(e===".")return t[t.length-1];var r=e.split("."),i=r.length-1,s=r[i],o,u,a=t.length,f,l;while(a){l=t.slice(0),u=t[--a],f=0;while(f<i){u=u[r[f++]];if(u==null)break;l.push(u)}if(u&&s in u){o=u[s];break}}return typeof o=="function"&&(o=o.call(l[l.length-1])),o==null?n:o}function m(e,t,n,r){var i="",u=v(e,t);if(r){if(u==null||u===!1||s(u)&&u.length===0)i+=n()}else if(s(u))o(u,function(e){t.push(e),i+=n(),t.pop()});else if(typeof u=="object")t.push(u),i+=n(),t.pop();else if(typeof u=="function"){var a=t[t.length-1],f=function(e){return S(e,a)};i+=u.call(a,n(),f)||""}else u&&(i+=n());return i}function g(t,n){n=n||{};var r=n.tags||e.tags,i=r[0],s=r[r.length-1],o=['var buffer = "";',"\nvar line = 1;","\ntry {",'\nbuffer += "'],u=[],l=!1,c=!1,h=function(){if(l&&!c&&!n.space)while(u.length)o.splice(u.pop(),1);else u=[];l=!1,c=!1},p=[],v,m,g,y=function(e){r=f(e).split(/\s+/),m=r[0],g=r[r.length-1]},b=function(e){o.push('";',v,'\nvar partial = partials["'+f(e)+'"];',"\nif (partial) {","\n  buffer += render(partial,stack[stack.length - 1],partials);","\n}",'\nbuffer += "')},w=function(e,r){var i=f(e);if(i==="")throw d(new Error("Section name may not be empty"),t,N,n.file);p.push({name:i,inverted:r}),o.push('";',v,'\nvar name = "'+i+'";',"\nvar callback = (function () {","\n  return function () {",'\n    var buffer = "";','\nbuffer += "')},E=function(e){w(e,!0)},S=function(e){var r=f(e),i=p.length!=0&&p[p.length-1].name;if(!i||r!=i)throw d(new Error('Section named "'+r+'" was never opened'),t,N,n.file);var s=p.pop();o.push('";',"\n    return buffer;","\n  };","\n})();"),s.inverted?o.push("\nbuffer += renderSection(name,stack,callback,true);"):o.push("\nbuffer += renderSection(name,stack,callback);"),o.push('\nbuffer += "')},x=function(e){o.push('";',v,'\nbuffer += lookup("'+f(e)+'",stack,"");','\nbuffer += "')},T=function(e){o.push('";',v,'\nbuffer += escapeHTML(lookup("'+f(e)+'",stack,""));','\nbuffer += "')},N=1,C,k;for(var L=0,A=t.length;L<A;++L)if(t.slice(L,L+i.length)===i){L+=i.length,C=t.substr(L,1),v="\nline = "+N+";",m=i,g=s,l=!0;switch(C){case"!":L++,k=null;break;case"=":L++,s="="+s,k=y;break;case">":L++,k=b;break;case"#":L++,k=w;break;case"^":L++,k=E;break;case"/":L++,k=S;break;case"{":s="}"+s;case"&":L++,c=!0,k=x;break;default:c=!0,k=T}var O=t.indexOf(s,L);if(O===-1)throw d(new Error('Tag "'+i+'" was not closed properly'),t,N,n.file);var M=t.substring(L,O);k&&k(M);var _=0;while(~(_=M.indexOf("\n",_)))N++,_++;L=O+s.length-1,i=m,s=g}else{C=t.substr(L,1);switch(C){case'"':case"\\":c=!0,o.push("\\"+C);break;case"\r":break;case"\n":u.push(o.length),o.push("\\n"),h(),N++;break;default:a(C)?u.push(o.length):c=!0,o.push(C)}}if(p.length!=0)throw d(new Error('Section "'+p[p.length-1].name+'" was not closed properly'),t,N,n.file);h(),o.push('";',"\nreturn buffer;","\n} catch (e) { throw {error: e, line: line}; }");var D=o.join("").replace(/buffer \+= "";\n/g,"");return n.debug&&(typeof console!="undefined"&&console.log?console.log(D):typeof print=="function"&&print(D)),D}function y(e,t){var n="view,partials,stack,lookup,escapeHTML,renderSection,render",r=g(e,t),i=new Function(n,r);return function(n,r){r=r||{};var s=[n];try{return i(n,r,s,v,p,m,S)}catch(o){throw d(o.error,e,o.line,t.file)}}}function w(){b={}}function E(e,t){return t=t||{},t.cache!==!1?(b[e]||(b[e]=y(e,t)),b[e]):y(e,t)}function S(e,t,n){return E(e)(t,n)}e.name="mustache.js",e.version="0.5.0-dev",e.tags=["{{","}}"],e.parse=g,e.compile=E,e.render=S,e.clearCache=w,e.to_html=function(e,t,n,r){var i=S(e,t,n);if(typeof r!="function")return i;r(i)};var t=Object.prototype.toString,n=Array.isArray,r=Array.prototype.forEach,i=String.prototype.trim,s;n?s=n:s=function(e){return t.call(e)==="[object Array]"};var o;r?o=function(e,t,n){return r.call(e,t,n)}:o=function(e,t,n){for(var r=0,i=e.length;r<i;++r)t.call(n,e[r],r,e)};var u=/^\s*$/,f;if(i)f=function(e){return e==null?"":i.call(e)};else{var l,c;a(" ")?(l=/^\s+/,c=/\s+$/):(l=/^[\s\xA0]+/,c=/[\s\xA0]+$/),f=function(e){return e==null?"":String(e).replace(l,"").replace(c,"")}}var h={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},b={}})