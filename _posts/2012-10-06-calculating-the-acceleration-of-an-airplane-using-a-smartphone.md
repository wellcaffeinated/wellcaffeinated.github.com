---
layout: post
title: Calculating the Acceleration of an Airplane using a Smartphone
category: articles
tags:
  - science
  - development
  - phyiscs
disqus_id: calculating-the-acceleration-of-an-airplane-using-a-smartphone
---
{% include JB/setup %}

As a web developer who loves physics, I'm always looking for ways to use what I know about web browser technology to do neat physics experiments. A few months ago I was sitting in an airport ready to return home. I had been thinking about the [device orientation](/articles/fun-with-javascript-and-device-orientation) detection capability of smartphones for a while, and was wondering what I could do with it. With airplanes on the mind, I decided to use the small amount of time I had to write a quick webapp to record the orientation of my phone during takeoff. Since I could write this purely in javascript, I could safely put my phone into "Airplane Mode" and continue to monitor its orientation. Javascript's "localStorage" could also save the data I accumulated. With the orientation data, I could then get a rough estimate of the acceleration profile of the airplane during takeoff (or any other time, really).

The webapp I wrote in about 30 minutes is not worth putting up here. It basically involved a start and stop button for the data. But it did the trick. Don't worry, soon I'll write one that will be easy for everyone to load onto their phones and tinker around with acceleration measurements.

All I needed to do was place my phone on the armrest of the seat and click start. Here's a graph of the data:

<script type="text/javascript" src="//ajax.googleapis.com/ajax/static/modules/gviz/1.0/chart.js"> {"dataSourceUrl":"//docs.google.com/spreadsheet/tq?key=0Akupmpq7rS__dEhtYVE3dDZkZnI5dTAweHlWUndQMXc&transpose=0&headers=0&range=B1%3AC1207&gid=0&pub=1","options":{"vAxes":[{"useFormatFromData":true,"title":"Android Angle (degrees)","minorGridlines":{"count":"0"},"minValue":null,"viewWindowMode":"pretty","viewWindow":{"min":null,"max":null},"gridlines":{"count":"8"},"maxValue":null},{"useFormatFromData":true,"minValue":null,"viewWindowMode":"pretty","viewWindow":{"min":null,"max":null},"maxValue":null}],"titleTextStyle":{"bold":true,"color":"#000","fontSize":16},"series":{"0":{"pointSize":2}},"booleanRole":"certainty","title":"Airbus A320 Orientation Data from Android Web App","animation":{"duration":500},"pointSize":7,"legend":"right","lineWidth":0,"hAxis":{"useFormatFromData":true,"title":"Time (s)","formatOptions":{"scaleFactor":null},"minValue":125,"viewWindowMode":"explicit","gridlines":{"count":"10"},"viewWindow":{"min":125,"max":230},"maxValue":230},"tooltip":{},"width":'auto',"height":'auto'},"state":{},"view":{},"chartType":"ScatterChart","chartName":"Chart 1"}  </script>

Not too shabby! It's pretty noisy, but you can see the takeoff pretty clearly.

So, what are we measuring?

We're measuring the *perceived* tilt angle of the phone. Normally, if you tilted your phone forwards and backwards, the phone would measure the direction of gravitational force relative to the screen. So if you placed your phone on a level table, it would measure gravity directly into the screen. This would give you a tilt angle of zero (in front-back, and left-right axes). When you tilt your phone, the phone will detect gravity at some angle, and be able to give you the measure of that angle. You can [play around with that here](/demos/device-orientation), if your phone or laptop supports it.

![Airplane Takeoff](http://simplescientist.files.wordpress.com/2010/10/airplane1.png)

But what happens during takeoff? Well, gravity is no longer the only force the phone detects. Now it's detecting the combination of gravity and the thrust of the airplane. As the airplane is rolling along the runway, this thrust will be horizontal (perpendicular to gravity). If you add up these effects, the result is that the phone interprets this as a tilt. The amount of tilt measured can be easily calculated:

$$\\tan(\\theta) = \\frac{F_{\\textrm{thrust}}}{F_{\\textrm{gravity}}}$$

If we want to, we can divide the top and bottom of that equation by the mass of the airplane. Then we can put everything in terms of accelerations:

$$\\tan(\\theta) = \\frac{a_{\\textrm{thrust}}}{a_{\\textrm{gravity}}}$$

We have the angle, and the gravitational acceleration value (`9.8 m/s/s`), so we can get the acceleration of the airplane. The data I've got here is pretty noisy, so let's just do a rough estimation. At around 140s, the angle fluctuates between 16 and 24 degrees. So let's ballpark it at 20 degrees.

$$a_{\\textrm{thrust}} = 9.8 \\\\ \\tan(20\\deg) \\\\ m/s^2$$

... which gives us around `3.5 m/s/s`.

How does this compare to the "actual" acceleration? Well, it's hard to say what the real acceleration of the airplane was. This will depend on many factors; air resistance, number of passengers, ... But still, we can estimate this from the [airplane specs](http://en.wikipedia.org/wiki/Airbus_A320_family#Specifications). For an A320, the thrust can vary between `111 - 120 kN`, its operating empty weight is `42600 kg`, and its maximum takeoff weight is around `77110 kg`. So the maximum acceleration is maximum thrust divided by the weight while the airplane is empty:

$$a_{\\textrm{thrust}} = \\frac{120 \\\\ \\textrm{kN}}{42600 \\\\ \\textrm{kg}}$$

which is about `2.8 m/s/s`. The minimum acceleration is minimum thrust divided by maximum takeoff weight, which gives you `1.4 m/s/s`.

So, we're a bit off, but remember, this is quite a rough estimate from the data. Aside from the noisiness of the data, one major caveat is that we didn't take into account the angle of the phone when the airplane wasn't moving (it wasn't quite at zero). But it still gives you an idea of the fun physics you can do with your phone.

Stay tuned for more smartphone physics fun.
