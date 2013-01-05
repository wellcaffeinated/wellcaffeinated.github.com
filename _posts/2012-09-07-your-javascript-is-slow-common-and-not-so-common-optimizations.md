---
layout: post
title: 'Your JavaScript is Slow - Common and not-so Common Optimizations'
category: articles
tags:
  - development
disqus_id: your-javascript-is-slow-common-and-not-so-common-optimizations
---
{% include JB/setup %}

Optimization considerations for any language can lead down a long and complex road. For JavaScript, things get even more complex because the same code can be run on a huge number of permutations of browser, version, OS, and machine (think mobile devices too).

Still, I was surprised how little information I found on the subject. A quick google search turns up a few great resources. To mention a few: [An overview of Nicholas Zakas's tips][js10], [Google's "Make the Web Faster" article][googleoptim], and [An older article by Jeff Greenberg][earthlink].

These all are great resources, but they lack a few of the more surprising offenders in terms of bottlenecks. So I decided to post some information that I've discovered during my long hours on [JSPerf][jsperf]. If you haven't heard of JSPerf before, check it out. 

*What is it, you ask*?

>jsPerf aims to provide an easy way to create and share test cases, comparing the performance of different JavaScript snippets by running benchmarks. But even if you don’t add tests yourself, you can still use it as a JavaScript performance knowledge base.
	
In other words, you don't need to wait around for someone to benchmark a test for you. You can do it yourself! (*aside: At a later date, I'll try to write some guidelines for intelligently creating test cases.*) For now, I'm going to go over some of the common and not-so common bottlenecks to look for while trying to optimize your code.

## Most Importantly...

Firstly, **Don't optimize on the fly**. The big reason for this is that your implementation may change as you develop your code... so you might end up burning hours on unnecessary optimizations for algorithms that you end up scrapping by the end. You should also go hunting for your largest bottlenecks first. You don't want to spend hours optimizing in the wrong place. Use a profiler (like chrome dev tools) to find these bottlenecks.

Secondly, **Don't sacrifice readability for speed! That's what minifiers are there for**. You might come across optimization tips like "don't use long variable names", or "avoid creating unnecessary variables"... but I say forget that! You should be minifying your code. Always. Period. That's the most important optimization tip you can take away from this.

Consider the following...

    // sure... this...
    var NumberOfFingers = 4 + 1;
    
    // is not as fast as this...
    var n = 5;
    
... the first option is more readable. Similarly,

    // this is faster...
    function toRad( deg ){
    	return deg*Math.Pi/180;
    }
    //... than...
    function toRad( degrees ){
    	var radiansPerDegrees = Math.Pi/180;
        return degrees * radiansPerDegrees;
    }
    
the second option here will make people much less frustrated when they try to understand your program. And when you put that second option through a minifier like [Closure Compiler][cc], look what it becomes:

    function toRad(a){return a*(Math.Pi/180)};

So there.

Finally, **Don't trust everything you hear!** Javascript engines are changing all the time, and some optimization tips that applied to certain browsers in 2009 may not apply now. And those that apply now, may not apply in a year. It's best to test these things yourself.

## Unsurprising (common) Optimizations

### Loops

Ok. So. Let's start with some easy ones. What's wrong with the following for loop?

    for (var i = 0; i < catPictures.length; i++)
    	catPictures[ i ].comment = 'lolz';
        
You guessed it. We aren't caching the `length` of the `catPictures` array. It's being recalculated every single cycle of the loop. If you don't believe me, [try it on jsperf](http://jsperf.com/simple-loop-optimizations). 

As for which type of looping method is the fastest... results may vary. [Here's a suite of looping tests on jsperf](http://jsperf.com/faster-loop/5) for your pleasure. Generally it seems that the standard cached length `for` loop is empirically faster than other loops (including `while` loops and especially built-in `.each` methods).

### Object lookups

Here's another one that might be a walk in the park.

	for (var i = 0, l = ids.length; i < l; i++)
        myFramework.utils.addText( ids[ i ], 'text' );
    
The problem with this is we can speed this up by caching the `addText` method. Every time we use a `.` to dig deeper into our objects we loose time. Here's some better code:

    var addText = myFramework.utils.addText;
	for (var i = 0, l = ids.length; i < l; i++)
        addText( ids[ i ], 'text' );

**Note: this is especially useful when you're using `document.getElementById` and similar methods.**

### Local Scope > Global Scope

Finally, here's one that I found surprising at first, but it makes total sense. Consider the following code.

    var Fn1 = 0;
    var Fn2 = 1;
    
    function nextFibonacci() {
        var ret = Fn1 + Fn2;
        Fn1 = Fn2;
        Fn2 = ret;
        return ret;
    }
    
We can actually improve on this by cacheing the values of the variables that are outside the scope of that function. This speeds things up because the interpreter has to look for variable names up the scope chain until it finds what it's looking for. If the variables are declared within the same scope... it's faster. Here's the optimized version:

    var Fn1 = 0;
    var Fn2 = 1;
    
    function nextFibonacci() {
        var f1 = Fn1,
            f2 = Fn2,
            f3 = f1 + f2;
    
        Fn1 = f2;
        Fn2 = f3;
        return f3;
    }

If you don't believe me, [check out the JSPerf for this optimization](http://jsperf.com/caching-scope-vars/5).

### Avoiding anything `new`

The `new` keyword certainly has its uses and circumstances. But if you're creating a bunch of objects, especially in a loop, you should try to avoid creating them with `new`. Instead of `var thing = new myObj()`, try just using javascript object literals: `var thing = { ... }`. It will vastly speed up your code. Here's the [JSPerf for new vs object litterals](http://jsperf.com/data-structure-new-vs-literal-instantiation).

## Surprising (uncommon) Optimizations

### Function declaration vs. Function expression

In my countless hours of tinkering around on [JSPerf][jsperf], I've discovered a lot of kooky thinks to watch out for in terms of performance. One of the most basic is *how you declare your functions*! To create a function you can either do it as a function declaration or a function expression. Here's the difference:

    // function declaration
    function foo(){
    	// stuff...
    }
    
    // function expression
    var foo = function(){
    	// stuff...
    };
    
    // self-executing function expressions
    (function(){
    	// stuff...
    })();
    // or...
    !function(){
    	// stuff...
    }();
    
You can visit [JavaScript Weblog][jsblog] for some of the finer points on the differences between function declarations and function expressions.

So turns out, that [function **declarations** are much faster to create, as seen from this JSPerf](http://jsperf.com/function-declarations-vs-function-expressions). So if you're creating a helper function, you might as well *declare* it and reap some of the speed benefits.

### Use of the `arguments` object

You know that ever-so-useful `arguments` object you can use inside a function to access the arguments? Yeah. Don't use it unless you have to. There's a significant performance hit. Even if you just put the word "arguments" in your function... even in code that will never run... you will see a performance hit. Here are the specifics of [arguments object performance effects](http://jsperf.com/the-arguments-object-s-effect-on-speed).

### Clever ways around slow native methods

Have you ever wondered if `array = array.concat(otherarray)` is really the fastest way to concatenate an array? Well, it may not be depending on your situation. Specifically, if you don't mind modifying the original array, you can certainly get a vast improvement in speed by doing the following:

    var arr1 = [1,2,3];
    var arr2 = [4,5,6];
    var push = Array.prototype.push;
    
    push.apply(arr1, arr2); // arr1 == [1,2,3,4,5,6]
    
And here's the [JSPerf of this push-concat method](http://jsperf.com/concat-push/6). And even if you don't want to modify the original array, you can perform an array copy of the original (with `array.slice(0)`) and use that one and it will *still* be faster!

Why does this work? It's because the `.push()` method can push several elements passed as arguments (eg: `.push(1,2,3,4)`). So when you use it as the second parameter in an apply call, it's like you're doing: `arr1.push(arr2[0], arr2[1], ...)`.

Another nice workaround that is even more dependant on the situation involves the situation of array element removal. If you want to remove an object from an array, an easy way to do it is:

    myArray.splice( index, 1 );
    
But if you **don't care about the order** then a faster method would be:

    if ( index === (myArray.length - 1) )
    	myArray.pop();
    else
    	myArray[index] = myArray.pop();
        
It's a very particular circumstance, but still, a great concept to keep in mind. [Here's the JSPerf](http://jsperf.com/splice-vs-remove).

## Putting it all together

If you want to see how this all fits together, I've created a quick implementation of a PubSub library to show what kind of effect these optimizations can have. The actual usefulness of this pubsub implementation is questionable, I made it more for instructional purposes. Here's a [codepen.io of the pubsub implementations][codepenpubsub]. What I did was create two versions of it; an unoptimized version, and an optimized version (using the previously mentioned suggestions). I then created some test cases to test for instantiation time and execution time. Here is a [JSPerf of the side-by-side performance results][jsperfpubsub]. You'll probably find that the graph won't help you, you should check the tabular version of the results and look at how the unoptimized/optimized versions of each operation compare.

Happy coding.

[js10]: http://jonraasch.com/blog/10-javascript-performance-boosting-tips-from-nicholas-zakas
[earthlink]: http://home.earthlink.net/~kendrasg/info/js_opt/
[googleoptim]: https://developers.google.com/speed/articles/optimizing-javascript

[jsperf]: http://jsperf.com/
[cc]: http://closure-compiler.appspot.com/home
[jsblog]: http://javascriptweblog.wordpress.com/2010/07/06/function-declarations-vs-function-expressions/

[jsperfpubsub]: http://jsperf.com/unoptimized-pubsub-vs-optimized-pubsub/2
[codepenpubsub]: http://codepen.io/wellcaffeinated/full/Hladx