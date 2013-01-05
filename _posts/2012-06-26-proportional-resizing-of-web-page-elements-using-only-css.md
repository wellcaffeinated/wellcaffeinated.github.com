---
layout: post
title: Proportional Resizing of Web Page Elements Using Only CSS
category: articles
tags:
  - development
disqus_id: proportional-resizing-of-web-page-elements-using-only-css
---

There are times, throughout the development process where you are surprised to find something that really should be easy. But it isn't.

I came across such a thing recently while developing a responsive website for a client. One of the components involved a calendar layout that had to resize depending on the browser width. Usually, this is as easy as setting a percent width on the parent element, but this calendar had thumbnail images for each day that needed to be resized to _preserve the aspect ratio_. This meant that the whole calendar had to preserve its aspect ratio (more or less). This is actually a bit more tricky that it first looks. Let's take a look.

**EDIT: I've recently discovered a better solution for this. I recommend [this new method](/articles/very-simple-css-only-proportional-resizing-of-elements) over the one described below.**

## Something that doesn't work

Consider our friend the simple DIV element.

    <div class="outer"></div>

with styles...

    .outer {
        width: 100%;
        height: 100%;
    }

Some may think that setting a percentage height on the element will solve the problem. This is of course, wrong. The height will be a percentage _relative to its parent height_. Meaning the height will be completely independent of the width. That's not what we want.

## A solution

You could use JavaScript. That will certainly work. You'd have to monitor resize events and set the height and width appropriately. But that's a bit cumbersome and a CSS only solution would be much lighter on resources. What we can do instead is use something that already resizes proportionally in the browser: images! We can use an image to fill our container and force the appropriate height and width to preserve aspect ratio. Then we can position our content absolutely and have it expand to fit the width and height that the image has specified for us. This would be the code:

    <div class="outer">
        <div class="inner">
            Lorum Ipsum
        </div>
        <img src="http://placekitten.com/500/500" class="scaling-img" /> <!-- don't specify height and width so browser resizes it appropriately -->
    </div>

and the css:

    .outer {
        position: relative;
    }
    .scaling-image {
        position: relative;
        visibility: hidden; /* make sure it's hidden */
        width: 100%;
        min-width: 100%;
    }
    .inner {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow:hidden;
    }

So, this will work. But notice we're loading a specific image in here that we're not actually displaying. This uses unnecessary resources. So let's improve on this by using data URIs.

## Data URI to the rescue

Data URIs, among other things, allow us to place image data inside the HTML markup. To make sure we're loading the least resources possible, let's try our solution with the smallest possible image, which turns out to be a plain white 1x1 pixel GIF image:

    <img class="scaling-img" src="data:image/gif;base64,R0lGODlhAQABAIAAAP7//wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" />

Now our image comes with the aspect ratio of 1:1. In order to get different aspect radios for our content area, all we need to do is add some padding to our scaling image to get the appropriate aspect ratio. For example, if we want a 1:2 aspect ratio, we add a **top padding of 50%**. If we want a 2:1 radio, we'll have to add a **top margin of -50%**.

Here is the [JSfiddle showing the full example code](http://jsfiddle.net/wellcaffeinated/4tFKC/) using this image to proportionally scale our content:

<iframe style="width: 100%; height: 400px" src="http://jsfiddle.net/wellcaffeinated/4tFKC/embedded/result%2Chtml%2Ccss%2Cjs/" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>

You'll notice that the content is hinting at a tabular layout (like a calendar), but you can put whatever you want inside the inner element. I've tested this solution on **Chrome, Safari, Firefox 3.6+, and IEs. It works on all except IE7 and below.**

## Errata

If you start resizing this example, you'll notice that the inner boxes don't quite match up to fill the width and height of our `.inner` element. This is due to rounding errors from the percentage calculation in CSS. If you want to avoid this, you'll need to either use [CSS3 flexbox layout](flexbox), or use this [equidistant object hack from CSS-Tricks](equid).


[equid]: http://css-tricks.com/equidistant-objects-with-css/
[flexbox]: http://www.html5rocks.com/en/tutorials/flexbox/quick/