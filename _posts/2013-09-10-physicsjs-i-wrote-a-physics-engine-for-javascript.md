---
title: PhysicsJS - I wrote a physics engine for javascript
layout: post
category: articles
tags: 
  - development
  - physics
---

I've finally [released a little project][physicsjs] I've been working on lately: [PhysicsJS][physicsjs]. It's a physics engine written in javascript. For those who haven't used or heard of a physics engine before, a physics engine is a library that helps simulate physical realism in a computer program. For example, here's a little jsFiddle of a classic tearable cloth simulation I made with PhysicsJS. You can use your mouse to move and even tear the cloth.

<iframe width="100%" height="300" src="http://jsfiddle.net/wellcaffeinated/MEgG3/embedded/result,js,html,css/" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>

It's not quite the same as the type of physics simulation a physicist would use, because generally a physics engine will do computations in real time, so the algorithms need to be fast. The algorithms in (real-time) physics engines will cut some corners to acheive an effect that is physically plausible to the eye, even if it's not what would *really* happen. Usually they are used in game development but there are, of course, other applications also.

There are actually a few javascript physics engines that have been released recently. The two that I've most recently come across are [VerletJS][verletjs] and [coffeephysics][coffeephysics]. While both are really cool, and have great example simulations, neither have good documentation, and both are very specialized to particular types of effect. Of course, there's always the classic [Box2DJS][box2djs], which was ported over from a flash implementation... and it shows in the API. While I do love what Box2DJS can do, it's also a monster of a library, weighing 724 KB **minified**. 

After playing around with physics engines and creating modest simulations of my own, I decided to see if I could pool all of my work into a little library, that hopefully could evolve into something people would find useful. The result is [PhysicsJS][physicsjs]. It's generally well documented and the code is written as cleanly as I could. It's also **modular**, so the bare-bones functionality is only 32 KB (minified) and the (current) full functionality is 52 KB (minified), but it was written with AMD in mind, so you can *include exactly what you need to get the job done* with requreJS. It's also **extendable**; I wanted to make sure that it would be easy to mixin new functionality of any kind, and replace what isn't suitable. I'm hoping people will start writing plugins to extend the capabilities, which is an exciting prospect! It's also fun to use. Only time will tell whether or not it's an intuitive API... but I'd like to think it is.

Anyways, [go check it out and play around][physicsjs]. There are some cool demos of the functionality. I'm really interested to see what people think of it so send me your feedback. If you're interested in contributing, I'd love people to make some plugins to extend the functionality, and also fix some of the quirks in its algorithms.

Enjoy!

[physicsjs]: http://wellcaffeinated.net/PhysicsJS/
[verletjs]: http://subprotocol.com/verlet-js/
[coffeephysics]: http://soulwire.co.uk/experiments/coffee-physics/
[box2djs]: https://github.com/kripken/box2d.js/
