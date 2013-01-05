---
layout: post
title: Better Content Editing in Wolf CMS
category: articles
tags:
  - development
disqus_id: better-content-editing-in-wolf-cms
---
{% include JB/setup %}

Originally, I created this blog using a modified version of [Frog CMS](http://www.madebyfrog.com), but soon upgraded to [Wolf CMS](http://www.wolfcms.org) which is a fork of Frog under active development. I thought that Wolf would bring about huge improvements in the backend design, and while it improved slightly, one major gap still stood out: *the page editor*. 

The Wolf page editor sucks. All it is is a text area element. Don't get me wrong... I'm not hoping for a TinyMCE sort of thing... I write in [Markdown](http://daringfireball.net/projects/markdown/basics) which is pretty much text anyways. But there are those times when I want to write code snippets, and having the tab key pull focus outside of my writing area is annoying to say the least. Not to mention the lack of syntax highlighting.

Fortunately, being a developer means you can always have your way (as long as you put in the work). So I decided to make a [Wolf CMS plugin that uses Code Mirror for page editing](https://github.com/wellcaffeinated/Code-Mirror-for-Wolf-CMS). Free for download, obviously. All you need to do is drop it into the Wolf Plugins directory and activate it.

It still lacks some features I'd like to add. I'm sure you'd probably find some nice-to-haves of your own. But the code is on GitHub, for your forking pleasure. Enjoy.