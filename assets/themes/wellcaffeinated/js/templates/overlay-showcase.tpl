<div class="{{=it.wrapClassName}}">
    <div class="inner">
        <div class="overlay">
            <div class="overlay-showcase">
                <div class="media">
                    {{?it.content.media}}
                        {{=it.content.media}}
                    {{??it.content.img}}
                        <img src="{{=it.content.img}}">
                    {{??}}
                        <!-- empty -->
                    {{?}}
                </div>
                <div class="description">
                    {{=it.content.description}}
                </div>
            </div>
            <a href="#" class="close">close</a>
        </div>
    </div>
    
</div>
<div class="overlay-screen"><div></div></div>