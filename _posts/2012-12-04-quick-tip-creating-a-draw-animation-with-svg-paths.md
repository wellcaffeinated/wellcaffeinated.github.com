---
layout: post
title: 'Quick Tip: Creating a "Draw" animation with svg paths'
category: articles
tags:
  - javascript
  - development
  - svg
disqus_id: quick-tip-creating-a-draw-animation-with-svg-paths
---

Let's say you want to create an animation that draws some kind of shape. Like watching a pencil draw a line on paper. Turns out this is really easy with SVG paths.

<iframe style="width: 100%; height: 300px" src="http://jsfiddle.net/wellcaffeinated/6tc8x/embedded/result" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>

If you haven't heard of SVG, you should check it out. It's a [well-supported way](http://caniuse.com/#feat=svg) of creating complex shapes with DOM elements. [RaphaelJS is a library](http://raphaeljs.com/) that makes this process even easier by providing javascript methods to do complex drawings.

One way of creating a shape is by creating it as an SVG path. This is exactly what it sounds like. It's a directional outline of a shape, or a way of drawing a curvy line from point A to point B. You can draw along this path with different stroke styles (solid, dashed, etc). The neat thing about creating a dashed line along a path is that you can control the length of the dashes. What happens if you make the dash as long as the line? Magic.

If you create a path, and then specify the dash length to be much greater than the path itself, you can animate the dash offset to give the effect of "drawing" along that path. Here's how you do it:

1. Create a path (see [RaphaelJS](http://raphaeljs.com/))
2. Set the properties: `path-dasharray` and `path-dashoffset` to be equal, and a pixel value much greater than the path itself (eg: 99999px). Let's call this `maxLen` for now.
3. Animate the `path-dashoffset` from its starting value, to the value of the `path-dasharray` minus the path length (`maxLen - path length`). You can use jQuery for this.

Here's a [jsFiddle showing an example of this technique](http://jsfiddle.net/wellcaffeinated/uZp3q/).

<iframe style="width: 100%; height: 500px" src="http://jsfiddle.net/wellcaffeinated/uZp3q/embedded/result,js,css,html,resources" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>