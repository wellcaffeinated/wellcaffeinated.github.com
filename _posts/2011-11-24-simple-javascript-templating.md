---
layout: post
title: Simple Javascript Templating
category: articles
tags:
  - development
  - MVC
disqus_id: simple-javascript-templating
---
{% include JB/setup %}

Suppose you need just a little bit of templating functionality, here's a code snippet for you:

	/**
	 * Very simple find/replace template.
	 *
	 * Optional filter function that is used on tags with three curlies. Ex: `{{{this_param_will_be_filtered}}}`
	 * 
	 * @function {mixin} Application.template
	 * @param {string} t templateable string
	 * @param {object} d data object
	 * @... {string} yourKey containing value to replace
	 * @param {function(value)} filter a filter function that is passed members of `d` that are templated by triple curlys
	 * @return {string} string with templates filled
	 * @author [Jasper Palfree](http://wellcaffeinated.net)
	 * @license [GPLv3](http://www.gnu.org/licenses/)
	 * @example
	 * This will return the text: `this is a template!`
	 *
	 *

	 * 	template("this is a {{what}}", {what: "template!"});
	 * 	
	 * @example
	 * This will return the text: `this is a template!`
	 *
	 *

	 * 	template("this is a {{nested.what}}", {nested: {what:'template!'} });
	 */
	function template(t, d, filter){
		var data = d;
		var ret = t;
		
		var segments = ret.match(/\\{?\\{\\{[a-zA-Z$_][a-zA-Z0-9_.$]*\\}\\}\\}?/g);
		for(var x=0, len = segments.length; x < len; x++){
                        var tags = segments[x].replace(/[\\{\\}]*/g,').split('.');
			var id = tags.shift();
                        var repl = (tags.length > 0)? arguments.callee('{{'+tags.join('.')+'}}',data[id],filter) : '+data[id];
			if(segments[x].match(/^\\{\\{\\{/) && typeof filter === 'function'){
				repl = filter(repl);
			}
			ret = ret.replace(segments[x], repl);
		}
		
		return ret;
	};

## What can you do with it? ##

Well, let's say you have some data in javascript that you want to put into the DOM.

	// mimicking retrieval from data source
	var entries = [
	    {id:'1', data: {title:"Title1", content:"<p>This is an entry</p>"}},
	    {id:'2', data: {title:"Title2", content:"<p>This is another entry</p>"}},
	    {id:'3', data: {title:"Title3", content:"<p>This is yet another fracking entry</p>"}}
	];

What you can do is set up a template in your HTML, by placing it in script tags and specify a type such as `type="text/html"`. For example, you may do something like this:

	<script type="text/html" id="tpl-entry">
	    <div class="entry">
	        <h2>{{data.title}}</h2>
	        <div class="content">
	            {{{data.content}}}
	        </div>
	    </div>
	 </script>

Now you can retrieve the inner html of that script tag and use it as the template for your data, like so:

	var el = document.getElementById('entryWrap'),
	    tpl = document.getElementById('tpl-entry').innerHTML,
	    html = ';
	for(var x in entries){
	    html += template(tpl, entries[x]);
	}

If you like, you can also add a filter function that can filter any data in the template called with a triple-curly.

Here's the full [example usage on jsFiddle](http://jsfiddle.net/wellcaffeinated/szASd/).