---
layout: post
title: A Responsive JavaScript Event Binding Method
category: articles
tags:
  - javascript
  - development
  - responsive design
disqus_id: a-responsive-javascript-event-binding-method
---
{% include JB/setup %}

I've recently been doing a lot of [responsive web development](http://www.alistapart.com/articles/responsive-web-design/) work. I was building a component that could have several different states depending on the size of the viewport. Each of these states dictated different user interaction. For example, a mouse move interaction in one state could turn into a mouse click interaction in another. So what I needed was a way to easily activate and deactivate JavaScript events depending on the viewport size.

One way to do this (that isn't so pretty) would be to monitor the viewport size and unbind and rebind the appropriate events between certain viewport size breakpoints. Similarly, you could manually add `if()` statements in the event callbacks to only use the callback if the breakpoint was the correct one. Neither of these solutions seemed easy enough to manage for me, so I came up with a more elegant solution.

The solution I came up with uses the [window.matchMedia()](https://developer.mozilla.org/en/DOM/window.matchMedia) method and [jQuery 1.7 .on()](http://api.jquery.com/on/) event delegation. The idea in a nutshell is to add a listener to a media query using `matchMedia()` and add a classname corresponding to the state of your component. Then by delegating events based on that state classname the events will automatically be disabled when that classname changes. 

First, let's start with some very simple HTML markup:

    <div id="my-component">
        <div class="inner">
            <div class="call-to-action">
                Do Stuff...
            </div>
        </div>
    </div>

So here `#my-component` is the main container of your component, `.inner` is an inner wrapper that we are going to add the state class names to, and `.call-to-action` is what we'll be expecting interaction events from. Now lets go to the javascript and define some states:

    var breakpoints = {
        bp1: 'screen and (min-width: 0px) and (max-width: 320px)',
        bp2: 'screen and (min-width: 321px)'
        //etc...
    };

So here we have two states. The first will be active in a viewport with a width less than 320px and the second will be active in widths larger than 321px. What we need to do now is use matchMedia to listen for these viewport changes and in the callback add a class name to the `.inner` element which corresponds to the currently active state. We do this by using the `.addListener()` method.

    for ( var name in breakpoints ){

        // need to scope variables in a for loop
        !function(breakName, query){

            // the callback
            function cb(data){
                // add class name associated to current breakpoint match
                $( '#my-component .inner' ).toggleClass( breakName, data.matches );
                // potentially do other stuff if you want...
            }

            // run the callback on current viewport
            cb({
                media: query,
                matches: matchMedia(query).matches
            });
    
            // subscribe to breakpoint changes
            matchMedia(query).addListener( cb );
    
        }(name, breakpoints[name]);
    }

Now whenever we change between these viewport ranges the `.inner` element will have a class name of either `.bp1` or `.bp2`. All we need to do now is delegate the events we want based on these class names. To do this we use jQuery's `.on()` with a query string that scopes the `.call-to-action` within either `.bp1` or `.bp2`, like so:

    $( '#my-component' )
    .on({
    
            //click events
            click: function(e){ 
                $(this).html('You clicked');
            }
    
        },
    
        //query string to match .call-to-action but only in first breakpoint
        '.bp1 .call-to-action'
    )
    .on({
    
            //mouse events
            mouseenter: function(e){
                $(this).html('You mouseentered');
            },
    
            mouseleave: function(e){ 
                $(this).html('You mouse...left...');
            }
    
        },
    
        //query string to match .call-to-action on all EXCEPT first breakpoint
        '.bp2 .call-to-action'
    );

And voila. Now these event callbacks will automatically only work inside their appropriate breakpoints. Adding more events or breakpoints becomes very easy to manage.

**Note**: Unfortunately there are a few problems with the `window.matchMedia()` implementation, as Nicholas C. Zakas outlines in [his informative article](http://www.nczonline.net/blog/2012/01/19/css-media-queries-in-javascript-part-2/). Fortunately, in the same article, he provides a solution to these problems through the implementation of a YUI module... which can easily be ported to jQuery or anything else. In future I'll provide a jQuery implementation based on Zakas' code.

[Here's a jsFiddle](http://jsfiddle.net/wellcaffeinated/5N2Dz/3/) of the above code so you can see how it works. I have used Zakas' fixes for firefox, so there are a few lines of extra JS in there to deal with that. Try resizing the result screen and clicking and mousing over!

<iframe style="width: 100%; height: 300px" src="http://jsfiddle.net/wellcaffeinated/5N2Dz/3/embedded/result,js,html,css" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>
