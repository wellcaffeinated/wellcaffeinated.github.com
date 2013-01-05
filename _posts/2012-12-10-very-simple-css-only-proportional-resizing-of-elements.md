---
layout: post
title: Very Simple CSS-only Proportional Resizing of Elements
category: articles
tags:
  - development
  - css
disqus_id: very-simple-css-only-proportional-resizing-of-elements
---
{% include JB/setup %}

A while ago I posted about [Proportional Resizing of Web Page Elements Using Only CSS](http://wellcaffeinated.net/articles/2012/06/26/proportional-resizing-of-web-page-elements-using-only-css). At the time, it seemed like the only solution... but fortunately a slightly counter intuitive CSS standard provides a *much better way* to get this same effect. Credit goes to [Nathan D. Ryan for his solution on Stackoverflow](http://stackoverflow.com/a/6615994/1729163).

The concept is nicely discussed in [Matt Snider's Blog Post](http://mattsnider.com/css-using-percent-for-margin-and-padding/)...
> Doing a little research, I was reminded that when you use percents to apply the margin of an element, the browsers determine **the actual size of the margin by multiply the percent against the width of the parent node** (this is true for margin-top, -right, -bottom, and -left). It is not based on either the height or width of the element that the margin is applied to. [...] I was surprised to relearn that the **padding is also relative to the width of the applied elements parent node**. So using percentages with padding works exactly as it does with margin.

This could come in handy for a few things. It's a good fact to note if you're doing CSS work. For proportional resizing purposes, it makes matters extremely simple: **Define the width of an element as a percentage (eg: 100%) of the parent's width, then define the element's padding-top (or -bottom) as a percentage so that the height is the aspect ratio you need**.

For example, if I have a container with a child element like so:

    <div class="container">
        <div class="child">
        </div>
    </div>

I can use the following css to give the child element an aspect ratio of 4:3

    .container { 
        width: 500px; /* pick whatever width you want */
    }
    .container .child {
        width: 100%;
        padding-top: 75%;
    }

But, of course, if we put any content inside the child it will change the height and throw off our aspect ratio. So what we need is another element inside which is positioned absolutely over the child element which obtains its size. We do that like this:

    <div class="container">
        <div class="outer">
            <div class="inner">Your content</div>
        </div>
    </div>

and css...

    .container { 
        width: 500px; /* pick whatever width you want */
    }
    .container .outer {
        width: 100%;
        padding-top: 75%; /* defines aspect ratio */
        position: relative;
    }
    .container .outer .inner {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }

And that's it! All in all, very intuitive solution that uses a counter intuitive feature of CSS.

Here's the [full jsFiddle](http://jsfiddle.net/wellcaffeinated/8Frb6/):

<iframe style="width: 100%; height: 300px" src="http://jsfiddle.net/wellcaffeinated/8Frb6/embedded/result,html,css,js" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>
