---
layout: post
title: Font Smoothing Detection... Modernizr Style!
category: articles
tags:
  - javascript
  - development
  - typography
disqus_id: font-smoothing-detection-modernizr-style
---

I recently have been playing around with [Google Webfonts](http://www.google.com/webfonts) which allow you much more freedom in font selection on the web... for free. I've been using Google Webfonts on this very website, which is why the fonts are so pretty... at least I think so.

There is one downside though. Sometimes you'll find that awesome font you want to use, and it looks **great** in OSX, but when you check how it looks on Windows... you can be quite disappointed.

<a href="/images/font-smoothing.png"><img alt="Comparison of wellcaffeinated.net as viewed on chrome in OSX and Windows" src="/images/font-smoothing.png" width="100%" /></a>

## What's going on!?

Well, it turns out Windows and OSX have different *default* ways of rendering fonts. Roughly speaking, [glyphs](http://en.wikipedia.org/wiki/Glyph) of a particular font are stored as black pixels or white pixels. On a high resolution medium this isn't a problem... but on a computer screen, simply using black and white pixels can lead to jagged edges. 

This is where font smoothing comes in. Font smoothing algorithms use semi-transparent pixels to smooth out these jagged edges. Whereas OSX uses something called Quartz font smoothing, Windows, it seems by default doesn't use any font smoothing. (Although you can turn it on by going to Control Panel->Display->Appearance->Effects on XP, for example).

## How do I make my fonts look nice on the web?

Fortunately, there's a way to detect font smoothing using a little javascript. This method was the product of some [great investigation by Zoltan Hawryluk](http://www.useragentman.com/blog/2009/11/29/how-to-detect-font-smoothing-using-javascript/trackback), a strong proponent for better web typography.

The code he's provided is great and works out of the box... but I, being a fan of [Modernizr](http://modernizr.com), wanted a way to detect font smoothing as a Modernizer test. That way, I could just plug the test into my head of my website and use css classes to display particular typefaces depending on whether the user has font smoothing enabled.

I've rewritten the font smoothing detection algorithm as a Modernizr test you can cut and paste into your website. Without further ado, here it is:

	// The following is adapted from...
	
	/*
	 * TypeHelpers version 1.0
	 * Zoltan Hawryluk, Nov 24 2009.  
	 * 
	 * Released under the MIT License. http://www.opensource.org/licenses/mit-license.php
	 * 
	 */
	
	Modernizr.addTest('fontsmoothing', function() {
	    // IE has screen.fontSmoothingEnabled - sweet!      
	    if (typeof(screen.fontSmoothingEnabled) != "undefined") {
	        return screen.fontSmoothingEnabled;
	    } else {
	        try {
	            // Create a 35x35 Canvas block.
	            var canvasNode = document.createElement("canvas")
	              , test = false
	              , fake = false
	              , root = document.body || (function () {
	                    fake = true;
	                    return document.documentElement.appendChild(document.createElement('body'));
	              }());
	            
	            canvasNode.width = "35";
	            canvasNode.height = "35"
	
	            // We must put this node into the body, otherwise 
	            // Safari Windows does not report correctly.
	            canvasNode.style.display = "none";
	            root.appendChild(canvasNode);
	            var ctx = canvasNode.getContext("2d");
	
	            // draw a black letter "O", 32px Arial.
	            ctx.textBaseline = "top";
	            ctx.font = "32px Arial";
	            ctx.fillStyle = "black";
	            ctx.strokeStyle = "black";
	
	            ctx.fillText("O", 0, 0);
	
	            // start at (8,1) and search the canvas from left to right,
	            // top to bottom to see if we can find a non-black pixel.  If
	            // so we return true.
	            for (var j = 8; j <= 32; j++) {
	                for (var i = 1; i <= 32; i++) {
	                    var imageData = ctx.getImageData(i, j, 1, 1).data;
	                    var alpha = imageData[3];
	
	                    if (alpha != 255 && alpha != 0) {
	                        test = true; // font-smoothing must be on.
	                        break;
	                    }
	                }
	            }
	            
	            //clean up
	            root.removeChild(canvasNode);
	            if (fake) {
	                document.documentElement.removeChild(root);
	            }
	            
	            return test;
	        }
	        catch (ex) {
	            root.removeChild(canvasNode);
	            if (fake) {
	                document.documentElement.removeChild(root);
	            }
	            // Something went wrong (for example, Opera cannot use the
	            // canvas fillText() method.  Return false.
	            return false;
	        }
	    }
	});

And [here it is on jsFiddle](http://jsfiddle.net/wellcaffeinated/tYyqA/) with an example usage:

<iframe style="width: 100%; height: 300px" src="http://jsfiddle.net/wellcaffeinated/tYyqA/embedded/result,js,html,css" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>

I haven't yet implemented this on my website, but expect prettier fonts for windows machines (without font smoothing) soon...