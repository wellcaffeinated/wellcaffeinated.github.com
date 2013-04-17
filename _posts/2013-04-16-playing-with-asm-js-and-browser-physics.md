---
layout: post
title: "Playing with asm.js and Browser Physics"
category: articles
tags:
  - development
  - optimization
  - physics
published: true
---

<a href="/demos/asm-js-physics.html"><img style="float: right" src="http://content.screencast.com/users/jpalfr/folders/Jing/media/8d32d26c-7384-440c-b99b-c86c7e77952f/00000016.png" alt="Asm.js Physics Demo"/></a>

Lately I've been **very** intrigued about Mozilla's [asm.js specification](asmjs).
**ASM.js is a subset of javascript** that allows javascript interpreters to compile
code ahead of time, directly into assembly code. This results in huge speed increases.

Current benchmarks of asm.js code running in Firefox's Nightly build, place
javascript at only half the speed of native compiled code! A big difference
from the usual, which is around 4 to 10 times slower. One fun showcase
of this was the recently ported Unreal Engine 3 to Asm.js. 

Yes. We're running high performance 3D games in web browsers now...

<iframe width="560" height="315" src="http://www.youtube.com/embed/XsyogXtyU9o" frameborder="0" allowfullscreen="allowfullscreen">
</iframe>

[John Resig has a nice writeup about asm.js](resig), including a QA transcript 
with David Herman (Senior Researcher at Mozilla Research). You should give it
a read if you're interested.

Of course, being curious and well caffeinated, I like to play around. I did a simple
benchmark and a little proof of concept of my own. But first, let's quickly
go over asm.js.

## asm.js Modules in a nutshell

Firstly, a disclaimer. asm.js code is a pain to write by hand. (I do so because I
drink too much coffee...) I don't really recommend starting any large project thinking that you'll
write it in asm.js from scratch. Likely, the best way to leverage asm.js will be to write in
another language (like C++, or something like [LLJS](lljs)), and then
"compile" it into asm.js. The painful part is mainly that it feels like
writing in two languages at once. It's javascript... but it feels like something
else... anyways, let's move on.

Asm.js contexts begin with a declaration like this:

    "use asm";

This is in the spirit of the `"use strict";` declaration, that you are hopefully
familiar with. (If not, google it. It's good to know).

This will most often be placed inside a function that acts as a "factory"
for an asm.js module. This asm.js module format looks like this:

    function my_module( stdlib, foreign, heap ){
        "use asm";

        // magic... (not really)

        return {
            someMethod: someMethod
        };
    }

    var instance = my_module(
            window,
            {
                customProperty: value,
                externalFunction: function(){
                    // ...
                }
            },
            new ArrayBuffer( size )
        );

When this function is run, it will return an instance of an asm.js module.
If asm.js is supported, the methods in the returned object will be compiled
into native code. If not, they will be javascript with identical functionality.

Inside the module factory, `stdlib` will hold standard global functionality
(like Math), `foreign` is user specified and can be used to escape back into
regular javascript, and `heap` is a fixed-size ArrayBuffer for storage.

The magic that happens in between relies on a very restrictive requirement
that all primitives must be **statically typed** as integers, or floats. 
Numerical computation is pretty much all you can do in an asm.js context
(and that's why it's so fast). Of course, javascript doesn't allow for declaring
types, so this is done by transforming variables into their types like so:

    variable_int = variable_int|0;
    variable_float = +variabla_float;

I'm not going to go into great detail about the specifics of hand crafting
asm.js code. For that you should check out [John Resig's article](resig) and
[read the specification](asmjs).

However, one of the big pains to writing it by hand is dealing with memory allocation.
The only thing you really have access to in terms of memory, is the fixed-size
[ArrayBuffer](mdnarraybuffer) you specify when you instantiate the asm.js module. You then
have to then create [views into the array buffer](mdnviews) to manipulate data.

## Easier asm.js Memory Management

Memory management becomes cumbersome. After playing around with it, I decided I needed to write
a quick [helper module](https://gist.github.com/wellcaffeinated/5399067) to make 
this easier.

Basically, the helper lets you manipulate "collections" of objects that store
all of their (primitive) properties in an array buffer. For example:

    var coln = ASMHelpers.Collection({
            foo: 'int16'
        });

This would create a collection instance that holds objects that hold
16 bit integers in their `foo` properties. You can then add one of these
objects to the collection and all of the ArrayBuffer memory management is
taken care of behind the scenes:

    coln.add({
        foo: 42
    });

    var obj = coln.at( 0 );
    obj.foo; // => 42

The objects have *getters* and *setters* defined, so if you change the
property, it will get changed in the array buffer.

    obj.foo = 34; // changed in array buffer

Unfortunately, non of those tricks can be used in the context of an asm.js
module. But that's ok, because the helper collection sets up
pointer addresses that *can* be used in asm.js. Here's how:
    
    // include asm.js module methods into the collection
    coln.include(function(stdlib, coln, heap){
        "use asm";

        // general purpose std functions
        var sqrt = stdlib.Math.sqrt;
        // set up our view to look into the heap
        // this will be used to access our int16 properties
        // in our example, this would be the "foo" property
        var int16 = new stdlib.Int16Array( heap );

        // object property pointers, relative to object ptr
        var $foo = coln.$foo|0;
        
        // function to get the number of objects in the collection
        var getLen = coln.getLen;
        // the size of each object in bytes
        var size = coln.objSize|0;
        // starting point for iteration (ie: the address of first object)
        var iterator = coln.ptr|0;

        // example function that increments the foo property 
        // of every object by specified number
        //
        function incrementFoo( n ){
            // declare n as an integer
            n = n|0;

            // declare local variables
            var i = 0, l = 0, ptr = 0;
            ptr = iterator|0;
            l = getLen()|0;

            // loop through objects
            while ((i|0) < (l|0)){

                // foo += n;
                int16[(ptr + $foo) >> 1] = ( (n|0) + (int16[(ptr + $foo) >> 1]|0) )|0;
                // i++;
                i = ((i|0) + 1)|0;
                // ptr += size;
                ptr = ((ptr|0) + (size|0))|0;
            }
        }

        // these functions will get mixed into the collection
        return {

            incrementFoo: incrementFoo
        }
    });

## Benchmarking with JSPerf

Using this helper, I wrote a very simple 1D physics engine
to test performance difference between simulating numbers of 
objects with the "use asm" declaration, and without it.

[Here's the benchmark on JSPerf](http://jsperf.com/asm-js-benchmark-with-simple-physics)

The results in Firefox 23 nightly build:

<iframe width='500' height='300' frameborder='0' src='https://docs.google.com/spreadsheet/pub?key=0Akupmpq7rS__dDhCdEhGM19HdVpJV0hPbnVxeDlxYnc&single=true&gid=0&output=html&widget=true'>
</iframe>

Aside for some weirdness on the last test, **enabling asm.js is significantly faster** for
this physics algorithm.

## Building a simple physics engine in asm.js

Of course, benchmarks are nice... but graphics are more fun! I wanted to keep going and
see what this speed increase felt like for some real-time browser simulation.


[![asm.js Physics Demo](http://content.screencast.com/users/jpalfr/folders/Jing/media/8d32d26c-7384-440c-b99b-c86c7e77952f/00000016.png)](/demos/asm-js-physics.html)
[To that end, I created this fun demo](/demos/asm-js-physics.html).


[asmjs]: http://asmjs.org/ "asm.js spec homepage"
[resig]: http://ejohn.org/blog/asmjs-javascript-compile-target/ "Asm.js: The JavaScript Compile Target"
[lljs]: http://jlongster.com/Compiling-LLJS-to-asm.js,-Now-Available- "Compiling LLJS to asm.js, Now Available!"
[mdnarraybuffer]: https://developer.mozilla.org/en-US/docs/JavaScript/Typed_arrays/ArrayBuffer
[mdnviews]: https://developer.mozilla.org/en-US/docs/JavaScript/Typed_arrays/ArrayBufferView?redirectlocale=en-US&redirectslug=JavaScript_typed_arrays%2FArrayBufferView

