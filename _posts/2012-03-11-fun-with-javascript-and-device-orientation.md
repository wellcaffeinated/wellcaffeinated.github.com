---
layout: post
title: Fun with JavaScript and Device Orientation
category: articles
tags:
  - javascript
  - development
disqus_id: fun-with-javascript-and-device-orientation
---

There's some new "black magic" in the world of JavaScript... and its name is "device orientation". This emerging feature allows JavaScript to monitor the physical orientation of the current device. This is not to be confused with the `orientationchange` event, which triggers when mobile devices change from portrait to landscape views and vice versa. No, instead, this means I can tilt my computer or phone or tablet and have JavaScript do stuff based on the way I've tilted it.

![Euler Angles](http://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Eulerangles.svg/300px-Eulerangles.svg.png)

For a "wow" effect, take a look at this (ugly) [demo I quickly whipped up](http://jsfiddle.net/wellcaffeinated/rWj3Y/embedded/result/) -- *works on modern browsers only*. There is a lot of ugliness in that code, but the idea is there. I can perform a physical action (tilt my computer) and interact with the virtual content in an intuitive way. Very satisfying.

## How do I do this?

Firstly, I should point out the awesome [article about device orientation on html5rocks](http://www.html5rocks.com/en/tutorials/device/orientation/). It's got enough to get you started. Basically the idea is you subscribe to a `deviceorientation` event using `document.addEventListener()`. The event will pass along some information about the device's current orientation. Results will vary depending on the device and the browser.

The information you can possibly have access to includes information from the accelerometer (tilt of the device) and compass information (direction on the earth). If you are familiar with [Euler angles](http://en.wikipedia.org/wiki/Euler_angles), then that will help. The information that the event passes back is essentially the Euler angles. Here's a [video showing a quick demo](http://www.youtube.com/watch?v=UpSMNYTVqQI) of what Euler angles measure.

In my jsFiddle above, what I'm doing is monitoring the angle *gamma* which corresponds to the left-right tilt of your device. Once I have that angle, I use some easy trigonometry to figure out the horizontal and vertical acceleration of virtual gravity relative to the viewport.

Still interested? Ok. `data.lr * Math.PI / 180` converts the angle from degrees to radians so that I can put it into `sin()` and `cos()`. Those in turn, give me the amount of gravity in the horizontal and vertical directions when I multiply them by my total (virtual) gravity.

    ay = a * Math.cos(data.lr * Math.PI / 180);
    ax = a * Math.sin(data.lr * Math.PI / 180);

## Free code, anyone?

I've been playing around with this device orientation voodoo for a little while and decided to write some AMD modules to make my life easier. One of them basically copies the code from *html5rocks*. The other (called device-gravity) gives you the projection of gravity along your device. It will give you the magnitude, angle, and x and y components.

"Projection of gravity? What does that do?"

I'm glad you asked. Imagine placing your laptop or tablet down on a level surface. Now place a ball on it. Right now  -- if the surface is very level -- the ball won't move. That means the projection of gravity is *zero* along the surface of your device. In other words, gravity points directly into the surface of your device. If you tilt your device, then the ball starts to accelerate. The projection of gravity  along your device is the direction the ball moves, and the magnitude of the projection is the amount at which it accelerates.

[Maybe a little demo is in order](/demos/device-orientation). This demo shows a projection-o-meter that shows you the projection of gravity. It also shows another example of what you can do with device orientation.

[The code and documentation is on GitHub](https://github.com/wellcaffeinated/Orientation). Feedback is most welcome.
