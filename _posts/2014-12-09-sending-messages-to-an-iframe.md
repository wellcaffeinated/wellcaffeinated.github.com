---
published: false
---

While browsing [stackoverflow](http://stackoverflow.com/questions/3177261/set-a-variable-in-an-iframe) recently, I discovered a trick to send arbitrary data to an iframe, even if it's across domains!

If your iframe is on the same domain, you can use the regular trick:

	var iframeWin = iframe.contentWindow || iframe.contentDocument.defaultView;
    iframeWin.data = myData;
    
But if you want to send data to an iframe across domains, you need to be more clever. The trick is to use `window.location.hash` and the `onhashchange` event, then set the location of the iframe to have a different hash value (that includes your encoded data).

Let's write some code that will encode arbitrary data (as long as it's JSON encodable) and put it into the hash value of the desired iframe.

    function sendIFrameData( frame, data ){
        var idx = frame.src.indexOf('#'), url = frame.src;
        if ( idx > -1 ){
            url = url.substr(0, idx);
        }
        
        frame.src = url + '#' + window.btoa(JSON.stringify(data));
    }
    
Easy enough...

Now on the iframe side, let's write a function to decode the data.

    function getHashData(){
        var data;
        try {
            data = JSON.parse(window.atob(window.location.hash.substr(1)));
        } catch( e ){}
        return data;
    }

That's all there is to it!

## An example

Here's a real life example. I created a codepen that will load an iframe on my domain, and send it some messages.

	// send arbitrary data to the iframe
    sendIFrameData( frame, { text: "Hello world" } );
    
    setTimeout(function(){
        sendIFrameData( frame, { text: "How are you today?" } );
    }, 2000);

The iframe will listen to the hashchange event and log out what it hears.

	var el = document.getElementById('log');
    function showMsg(){
        var data = getHashData();
        if ( data && data.text ){
            el.innerHTML += "<br/>Received msg: " + data.text;
        }
    }
    
    // in case we sent data on first load.
    showMsg();
    // when the hash changes we check the new data and print it out
    window.addEventListener('hashchange', function(){
        showMsg();
    });

Check out the working example!

<p data-height="266" data-theme-id="2533" data-slug-hash="myVaQX" data-default-tab="result" data-user="wellcaffeinated" class='codepen'>See the Pen <a href='http://codepen.io/wellcaffeinated/pen/myVaQX/'>myVaQX</a> by Well Caffeinated (<a href='http://codepen.io/wellcaffeinated'>@wellcaffeinated</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>
