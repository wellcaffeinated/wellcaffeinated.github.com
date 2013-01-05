---
layout: post
title: 'Quick Tip: Google Analytics Tracking for external links'
category: articles
tags:
  - javascript
  - development
  - analytics
disqus_id: quick-tip-google-analytics-tracking-for-external-links
---

Here's a nice snippet I've been using to track visitor exit flows on some of the sites I've built. You see, google analytics doesn't automatically log what *external* link visitors click on to exit your site. You might want to know this if your site is trying to reach a certain goal of funneling visitors to a particular place on another server.

For example, if you're trying to boost views particular YouTube video by directing traffic there, you want to know how effective your website is at doing that. So here's what you do. You set up a bit of javascript to log a google analytics "event" every time users try to visit an external link (click). If you use jQuery, you can basically copy and paste this snippet anywhere into your code (after jQuery is loaded):

    (function($, window, document){

    $(document).on('click', 'a[href^=http]', function(e){

        var $this = $(this)
            ,url = $this.attr('href')
            ,newtab = ($this.attr('target') === '_blank' || e.metaKey || e.ctrlKey)
            ;

        window._gaq = window._gaq || [];
        
        try {

            window._gaq.push(['_trackEvent', 'Outbound Links', e.currentTarget.host, url, 0]);
            
            if (!newtab) {

                e.preventDefault();
                setTimeout(function(){
                    document.location = url;
                }, 100);
            }
        } catch (err){}
    });

    })(jQuery, this, this.document);
    
This will detect whether or not the user has tried to load it in a new tab or if you're using `target="_blank"` and accommodate for those outcomes. It will also work before domReady has fired because we're using [event delegation](http://api.jquery.com/on/).

Enjoy :)