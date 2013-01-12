---
layout: post
title: Creating a 3D Histogram with CSS 3D Transforms
category: articles
tags:
    - development
    - css
    - 3D
---

Using CSS 3D transforms can be a bit a bit challenging. It's new, support is sketchy, and it requires a type of spatial thinking that we aren't used to on the web (yet). But the results are worth it. With a bit of CSS and some javascript for event binding, you can turn a boring old table into a 3D histogram like this one:

<style>
.noselect *,
.viewport * {
    -webkit-user-select: none;  
       -moz-user-select: none;    
        -ms-user-select: none;      
            user-select: none;
}

.viewport {
    position: relative;
    width: 100%;
    padding-bottom: 100%;
    cursor: move;

    -webkit-perspective: 4000px;
       -moz-perspective: 4000px;
        -ms-perspective: 4000px;
            perspective: 4000px;
    
    -webkit-perspective-origin: 50% -100%;
       -moz-perspective-origin: 50% -100%;
        -ms-perspective-origin: 50% -100%;
            perspective-origin: 50% -100%;
}

.viewport .world {
    position: absolute;
    top:0;
    left:0;
    right:0;
    bottom:0;

    -webkit-transform: rotateX(-15deg) rotateY(-20deg);
       -moz-transform: rotateX(-15deg) rotateY(-20deg);
        -ms-transform: rotateX(-15deg) rotateY(-20deg);
            transform: rotateX(-15deg) rotateY(-20deg);
}

.viewport .world, 
.viewport .world * { /* firefox needs this * selector */
    -webkit-transform-style: preserve-3d;
       -moz-transform-style: preserve-3d;
        -ms-transform-style: preserve-3d;
            transform-style: preserve-3d;
}

.viewport .ground {
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 50%;
    width: 90%;
    height: 90%;
    margin-left: -50%;
    margin-top: -50%;
    background: #eee;
    
    -webkit-transform: rotateX(90deg);
       -moz-transform: rotateX(90deg);
        -ms-transform: rotateX(90deg);
            transform: rotateX(90deg);
}

.viewport .histogram-3d {
    width: 80%;
    height: 80%;
    margin: 10% auto;
    border-collapse: collapse;
    border-style: solid;

    -webkit-transform: translateZ(1px);
       -moz-transform: translateZ(1px);
        -ms-transform: translateZ(1px);
            transform: translateZ(1px);
}

.viewport .histogram-3d td {
    position: relative;
    width: 30%;
    height: 30%;
    padding: 10px;
    border: 2px solid #555;
    z-index: 0;
}

.viewport .bar {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 1;
}

.viewport .bar .face {
    background: hsl(0, 100%, 50%);
    position: absolute;
    width: 100%;

    overflow: hidden;
    z-index: 1;
}

.viewport .bar .face.front {
    background: hsl(0, 100%, 20%);
    bottom: 0;
    height: 1em;

    -webkit-transform-origin: bottom center;
       -moz-transform-origin: bottom center;
        -ms-transform-origin: bottom center;
            transform-origin: bottom center;
    
    -webkit-transform: rotateX(-90deg);
       -moz-transform: rotateX(-90deg);
        -ms-transform: rotateX(-90deg);
            transform: rotateX(-90deg);
}

.viewport .bar .face.right {
    top: 0;
    right: 0;
    width: 1em;
    height: 100%;

    -webkit-transform-origin: center right;
       -moz-transform-origin: center right;
        -ms-transform-origin: center right;
            transform-origin: center right;
    
    -webkit-transform: rotateY(90deg);
       -moz-transform: rotateY(90deg);
        -ms-transform: rotateY(90deg);
            transform: rotateY(90deg);
}

.viewport .bar .face.left {
    background: hsl(0, 100%, 45%);
    top: 0;
    left: 0;
    width: 1em;
    height: 100%;

    -webkit-transform-origin: center left;
       -moz-transform-origin: center left;
        -ms-transform-origin: center left;
            transform-origin: center left;
    
    -webkit-transform: rotateY(-90deg);
       -moz-transform: rotateY(-90deg);
        -ms-transform: rotateY(-90deg);
            transform: rotateY(-90deg);
}

.viewport .bar .face.back {
    top: 0;
    height: 1em;

    -webkit-transform-origin: top center;
       -moz-transform-origin: top center;
        -ms-transform-origin: top center;
            transform-origin: top center;
    
    -webkit-transform: rotateX(90deg);
       -moz-transform: rotateX(90deg);
        -ms-transform: rotateX(90deg);
            transform: rotateX(90deg);
}

.viewport .bar .face.top {
    background: hsl(0, 100%, 40%);
    height: 100%;
    width: 100%;
    top: 0;

    -webkit-transform: translateZ(1em);
       -moz-transform: translateZ(1em);
        -ms-transform: translateZ(1em);
            transform: translateZ(1em);
}

/* fixes for firefox 
**********************/
.viewport .histogram-3d * {
    /* this improves jagged edges in firefox */
    outline: 1px solid transparent;
}

/* don't use table displays... need to use a combination of block and inline-block. Eww. */
.no-3dtablelayout .viewport .histogram-3d,
.no-3dtablelayout .viewport .histogram-3d tbody,
.no-3dtablelayout .viewport .histogram-3d tr,
.no-3dtablelayout .viewport .histogram-3d td { 
    display: block; 
    -webkit-box-sizing: border-box;
       -moz-box-sizing: border-box;
        -ms-box-sizing: border-box;
            box-sizing: border-box;
}

.no-3dtablelayout .viewport .histogram-3d tbody { height: 100%; }
.no-3dtablelayout .viewport .histogram-3d tr {
    text-align: center;
    height: 33%;
    /* fix grid */
    letter-spacing: -0.5em;
    margin-top: -1px;
}
.no-3dtablelayout .viewport .histogram-3d td {
    display: inline-block;
    height: 100%;
}

.no-csstransforms3d .viewport {
    display: none;
}

.csstransforms3d #histogram-3d-fallback {
    display: none;
}
</style>

<div class="viewport">
    <div class="world">
        <div class="ground">
            <table class="histogram-3d">
                <tr>
                    <td>30</td>
                    <td>20</td>
                    <td>60</td>
                </tr>
                <tr>
                    <td>80</td>
                    <td>10</td>
                    <td>40</td>
                </tr>
                <tr>
                    <td>20</td>
                    <td>50</td>
                    <td>30</td>
                </tr>
            </table>
        </div>
    </div>
</div>

<img id="histogram-3d-fallback" src="http://content.screencast.com/users/jpalfr/folders/Jing/media/c3dbb76a-0788-4f0d-b3e6-71b6a2ed46f6/00000001.png"/>

<script id="bartpl" type="text/template">
  <div class="bar">
    <div class="face top"></div>
    <div class="face front"></div>
    <div class="face back"></div>
    <div class="face left"></div>
    <div class="face right"></div>
  </div>
</script>

<script>
require(['boot-index'],function(){
require([
    'jquery'
], function(
    $
){
    var dragStart = {}
        ,dragging = false
        ,curpos = {x:100,y:-75}
        ;

    if ($.browser.mozilla){
        $('body').addClass('no-3dtablelayout');
    }

    $(function(){
    
        // get the template
        var tpl = $('#bartpl').html();

        // insert template markup into each td
        // and set the font size to be the value of the td
        $('.histogram-3d td').each(function(){
            var val = this.innerHTML;
            $(this)
                .html(tpl)
                .css('font-size', val+'px')
                ;
        });

        var touch = Modernizr.touch
            ,$vp = $('.viewport:first')
            ;
        
        $vp.on(touch?'touchstart':'mousedown', function(e){
          
            var evt = touch? e.originalEvent.touches[0] : e;
            dragStart = {
                x: evt.screenX + curpos.x,
                y: evt.screenY + curpos.y
            };

            dragging = true;
            $('body').addClass('noselect');
        });
        
        $(document).on(touch?'touchend':'mouseup', function(){
            dragging = false;
            $('body').removeClass('noselect');
        });
        
        $(document).on(touch?'touchmove':'mousemove', function(e){
          
            if (!dragging) return;

            e.preventDefault();

            var evt = touch? e.originalEvent.touches[0] : e
                ,x = dragStart.x - evt.screenX
                ,y = dragStart.y - evt.screenY
                ,amp = 0.2
                ;

            curpos.x = x;
            curpos.y = y;

            $vp.find('.world').css(
                Modernizr.prefixed('transform'),
                ['rotateX(',y*amp,'deg) rotateY(',-x*amp,'deg)'].join('')
            );

        });
    
    });
});
});
</script>

## Step 1 - Markup

First, we need the HTML. We'll create two container elements that are quite common in 3D css work:

* a viewport: acts as the projection layer or "camera"
* a world: which holds every other child element which we can easily rotate

I also like to add another element, *the ground*, which is just a plane that objects will sit on.

Inside this tree of three elements, we'll add our table, which contains the 3D histogram values. Here's the markup:

    <div class="viewport">
        <div class="world">
            <div class="ground">
                <table class="histogram-3d">
                    <tr>
                        <td>30</td>
                        <td>20</td>
                        <td>60</td>
                    </tr>
                    <tr>
                        <td>80</td>
                        <td>10</td>
                        <td>40</td>
                    </tr>
                    <tr>
                        <td>20</td>
                        <td>50</td>
                        <td>30</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>

## Step 2 - The environment CSS

Next we need to set up our 3D environment. **For the sake of simplicity, I will omit -vendor-prefixed values**.

First, the viewport. I some relative positioning, and dimensions, but the important values are the `perspective` and `perspective-origin` values. Roughly speaking, the [perspective](https://developer.mozilla.org/en-US/docs/CSS/perspective) controls how far the "camera" is from the origin, and [perspective-origin](https://developer.mozilla.org/en-US/docs/CSS/perspective-origin) defines its position.

    .viewport {
        position: relative;
        width: 100%;
        padding-bottom: 100%;
        cursor: move;

        perspective: 4000px;
        perspective-origin: 50% -100%;
    }

Next, the world. Again, we set some positioning and dimension values, but the important values for the world are `tranform` and `transform-style`. The transform value will rotate the world to its starting orientation. The transform-style is set to `preserve-3d`. This is so that all children of the world will also have 3D appearances. If we didn't set this, all children of the world element would be smushed into the world plane with no depth. **Note**: we're also setting `preserve-3d` on every child of the world too. Firefox doesn't seem to properly propagate this setting down the DOM tree... so this gets around that.

    .viewport .world {
        position: absolute;
        top:0;
        left:0;
        right:0;
        bottom:0;

        transform: rotateX(-15deg) rotateY(-20deg);
    }

    .viewport .world, 
    .viewport .world * {
        transform-style: preserve-3d;
    }

Finally, the ground. Easy peasy. Set some positioning (absolute centered alignement), give it a background, and rotate it along the X axis so that it lies flat on the world's X-Z plane.

    .viewport .ground {
        position: absolute;
        z-index: 1;
        top: 50%;
        left: 50%;
        width: 90%;
        height: 90%;
        margin-left: -50%;
        margin-top: -50%;
        background: #eee;
        
        transform: rotateX(90deg);
    }


Try it out in a JSFiddle with the appropriate vendor prefixes and you should see a boring grey square skewed a bit with the table data inside.


## Step 3 - The Histogram

Here's where things get tricky... and fun! First, we want to set up the table to be the grid of the histogram. That's easy. Just set some dimensions and borders on the tables, like you normally would.

    .viewport .histogram-3d {
        width: 80%;
        height: 80%;
        margin: 10% auto;
        border-collapse: collapse;
        border-style: solid;

        /* make sure grid is raised above ground */
        transform: translateZ(1px);
    }

    .viewport .histogram-3d td {
        position: relative;
        width: 30%;
        height: 30%;
        padding: 10px;
        border: 2px solid #555;
        z-index: 0;
    }

The tricky part is creating the bars. What we need to do is use some javascript to replace the numeric values in the table with some markup to act as the 3D bar. The markup we want to insert into every table cell looks like this:
    
    <script id="bartpl" type="text/template">
        <div class="bar">
            <div class="face top"></div>
            <div class="face front"></div>
            <div class="face back"></div>
            <div class="face left"></div>
            <div class="face right"></div>
        </div>
    </script>

The `.bar` element just contains the five faces (we don't need a bottom face). To do the replacement, it's easiest to use a template. We can store this markup in a script tag with a `type="text/template"` or similar. The browser won't try to run this as javascript, and we can simply use `.innerHTML` to get the content. The javascript will look like this (using jQuery):

    // get the template
    var tpl = $('#bartpl').html();

    // insert template markup into each td
    // and set the font size to be the value of the td
    $('.histogram-3d td').each(function(){
        var val = this.innerHTML;
        $(this)
            .html(tpl)
            .css('font-size', val+'px')
            ;
    });

Pretty straightforward, but *why are we setting a font size!?* This is the magic bullet to control the **size of the 3D bars**.

We're going to use dimensions relative to the font size (em), in order to control the height of the bars. So if we set a font-size on the bar element, the faces will resize appropriately to the correct height. Snazzy, eh? [I can't take full credit for this strategy, though](http://tympanus.net/codrops/2012/05/21/animated-3d-bar-chart-with-css3/).

So, let's add the bar css. First, we simply resize the bar container to fill the table cell, and set a relative position. Then for every face element, set a background, an absolute position, relative size, and orientation in 3D space. The differences in color correspond to different *shadings* of each face. If you want to get fancy, you can use [the Photon CSS lighting engine](http://photon.attasi.com/), but beware, I found some buggy behaviour in firefox when using it table elements. More about that later. Here's the rest of the CSS.

    .viewport .bar {
        position: relative;
        width: 100%;
        height: 100%;
        z-index: 1;
    }

    .viewport .bar .face {
        background: hsl(0, 100%, 50%);
        position: absolute;
        width: 100%;

        overflow: hidden;
        z-index: 1;
    }

    .viewport .bar .face.front {
        background: hsl(0, 100%, 20%);
        bottom: 0;
        height: 1em;

        transform-origin: bottom center;
        transform: rotateX(-90deg);
    }

    .viewport .bar .face.right {
        top: 0;
        right: 0;
        width: 1em;
        height: 100%;

        transform-origin: center right;
        transform: rotateY(90deg);
    }

    .viewport .bar .face.left {
        background: hsl(0, 100%, 45%);
        top: 0;
        left: 0;
        width: 1em;
        height: 100%;

        transform-origin: center left;
        transform: rotateY(-90deg);
    }

    .viewport .bar .face.back {
        top: 0;
        height: 1em;

        transform-origin: top center;
        transform: rotateX(90deg);
    }

    .viewport .bar .face.top {
        background: hsl(0, 100%, 40%);
        height: 100%;
        width: 100%;
        top: 0;

        transform: translateZ(1em);
    }


## Step 4 - Make it rotate!

The last step can be done in many different ways. We need to attach mouse/touch events to change the world element's orientation in order to rotate the histogram.

Generally this means tracking the mouse/touch event coordinates and mapping them to an angle. This is how I've done it, but you can probably come up with a cleaner and more general way to do this, right? :)

    var dragStart = {}
        ,dragging = false
        ,curpos = {x:100,y:-75}
        ;

    var touch = Modernizr.touch
        ,$vp = $('.viewport:first')
        ;
    
    $vp.on(touch?'touchstart':'mousedown', function(e){
      
        var evt = touch? e.originalEvent.touches[0] : e;
        dragStart = {
            x: evt.screenX + curpos.x,
            y: evt.screenY + curpos.y
        };

        dragging = true;
        $('body').addClass('noselect');
    });
    
    $(document).on(touch?'touchend':'mouseup', function(){
        dragging = false;
        $('body').removeClass('noselect');
    });
    
    $(document).on(touch?'touchmove':'mousemove', function(e){
      
        if (!dragging) return;

        e.preventDefault();

        var evt = touch? e.originalEvent.touches[0] : e
            ,x = dragStart.x - evt.screenX
            ,y = dragStart.y - evt.screenY
            ,amp = 0.2
            ;

        curpos.x = x;
        curpos.y = y;

        $vp.find('.world').css(
            Modernizr.prefixed('transform'),
            ['rotateX(',y*amp,'deg) rotateY(',-x*amp,'deg)'].join('')
        );

    });

## Caveats

Unfortunately, things get messier because of cross-browser support. I'm not even talking about IE. I'm talking about Firefox. Turns out **3D transforms won't work with CSS table layouts in Firefox**. This means, for Firefox (and perhaps other browsers), we need to reset the layouts of the table, tr, and td elements to use only `block` and `inline-block` display values... which is annoying. What I've done on this page is browser sniff for firefox, and add a body class `no-3dtablelayout`. Then I override the layouts within that scope like so:

    /* don't use table displays... need to use a combination of block and inline-block. Eww. */
    .no-3dtablelayout .viewport .histogram-3d,
    .no-3dtablelayout .viewport .histogram-3d tbody,
    .no-3dtablelayout .viewport .histogram-3d tr,
    .no-3dtablelayout .viewport .histogram-3d td { 
        display: block; 
        -webkit-box-sizing: border-box;
           -moz-box-sizing: border-box;
            -ms-box-sizing: border-box;
                box-sizing: border-box;
    }

    .no-3dtablelayout .viewport .histogram-3d tbody { height: 100%; }
    .no-3dtablelayout .viewport .histogram-3d tr {
        text-align: center;
        height: 33%;
        /* fix grid */
        letter-spacing: -0.5em;
        margin-top: -1px;
    }
    .no-3dtablelayout .viewport .histogram-3d td {
        display: inline-block;
        height: 100%;
    }

To add insult to injury, the result looks a bit ugly. Firefox doesn't seem to be using anti-aliasing for the face edges. To make it look a bit better, we can [apply a little hack](http://stackoverflow.com/a/9333891):

    .viewport .histogram-3d * {
        /* this improves jagged edges in firefox */
        outline: 1px solid transparent;
    }

That's all for now. I'd love to hear any other cross-browser issues you find.



