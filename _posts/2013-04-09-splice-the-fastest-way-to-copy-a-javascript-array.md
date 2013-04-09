---
layout: post
title: splice(0): The fastest way to copy a JavaScript array
category: articles
draft: true
published: false
---

Just thought I'd share a quick tip for writing optimal JavaScript. When it comes to copying (non-typed) arrays, there are many ways to do it. But there is most definitely one **fastest** way to do it:

	var copied = original.splice(0);
    
That's s**p**lice, and not slice.

Check for yourself in [this JSPerf test](http://jsperf.com/array-copy-techniques). I've compared this with arrays holding different types of objects; int, float, string, object, arrays, and mixed. And I've compared using `for` loops, `.concat([])`, and `slice(0)`. But they are all much slower.

Typed arrays like `Int32Array()` are a different story... for a different post...