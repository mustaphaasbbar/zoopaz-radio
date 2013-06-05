/*
Copyright 2013 Weldon Sams

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

function toggleMusicOn(url) {
    if ($(".m3uplayer").length > 0 && url == $("#theurl").data("url")) {
        if ($(".jp-playlist ul li").length > 0) {
            if ($("#playbutton").html() == "Play") {
                $(".jp-play").click();
                $("#playbutton").html("Pause");
            } else {
                $(".jp-pause").click();
                $("#playbutton").html("Play");
            }
        }
    } else {
        //location.href = "index.php?action=createPlaylist&dir=" + encodeURIComponent(url);
        createPlaylistJs(url);
    }
}

function createPlaylistJs(url) {
    displayWorking();
    $.ajax({
        type: "GET",  
        url: "ajax.php",  
        data: "action=createPlaylistJs&dir=" + encodeURIComponent(url),
        success: function(html){
            var width = $("#content").width();
            $("#content-player").html(html);

            // Currently the player only works in iPhone with the Chrome browser.
            // We remove this playlist because it is not functional while playing.
            if (isMobile && isMobile()) {
                $("#musicindex").remove();
                $("#playercontrols").remove();
                var newwidth = width - 16;
                //alert('newwidth = ' + newwidth);
                $("#mediaplayer_wrapper").css("width", newwidth + "px");
            }
            hideWorking();
        }
    });
}

function openDir(url) {
    location.hash = "#/open/" + encodeURIComponent(url);
    displayWorking();
    $.ajax({
        type: "GET",  
        url: "ajax.php",  
        data: "action=openDir&url=" + encodeURIComponent(url) + "&dir=" + encodeURIComponent(url),
        success: function(text){
            hideWorking();
            $("#content").html(text);
        }
    });
}

function init() {
    var hash = window.location.hash;
    hash = hash.replace(/^#/, "");
    var hashVars = hash.split("/");
    switch(hashVars[1]) {
        case "open":
            var dir = decodeURIComponent(hashVars[2]);
            openDir(dir);
            break;
        default:
            var doNothing = true;
    }
}

function search(q) {
    if (q.length < 3) {
        return false;
    }
    if ($("#playbutton").length > 0) {
        var p = $("#playbutton").parent();
        p.remove();
    }
    displayWorking();
    $.ajax({
        type: "GET",  
        url: "ajax.php",  
        data: "action=search&q=" + encodeURIComponent(q),
        success: function(html){
            $("#musicindex").html(html);
            hideWorking();
        }
    });
}

function displayWorking() {
    $("#loading").css("display", "block").css("visibility", "visible");
}

function hideWorking() {
    $("#loading").css("display", "none").css("visibility", "hidden");
}

function addToPlaylist(e, thiz) {
    var event = e || window.event;
    displayWorking();
    $.getJSON("ajax.php?action=addToPlaylist&dir=" + encodeURIComponent($(thiz).data('url')), function(json){
        $(json).each(function(i, audioFile) {
            myPlaylist.add(audioFile);
        });
        $(".album-title").text("Custom playlist");
        hideWorking();
    });
    event.stopPropagation();
    event.stopImmediatePropagation();
    event.cancelBubble = true;
    return false;
}

function logout(e) {
    displayWorking();
    $.ajax({
        type: "GET",  
        url: "ajax.php",  
        data: "action=logout",
        success: function(html){
            hideWorking();
            location.href="index.php";
        }
    });
}

function playRadio(e) {
    displayWorking();
    $.ajax({
        type: "GET",  
        url: "ajax.php",  
        data: "action=playRadio&num=10",
        success: function(html){
            var width = $("#content").width();
            $("#content-player").html(html);
            $(".album-title").text("Radio");

            // Currently the player only works in iPhone with the Chrome browser.
            // We remove this playlist because it is not functional while playing.
            if (isMobile && isMobile()) {
                $("#musicindex").remove();
                $("#playercontrols").remove();
                var newwidth = width - 16;
                //alert('newwidth = ' + newwidth);
                $("#mediaplayer_wrapper").css("width", newwidth + "px");
            }

            // After each song plays, remove the first song.
            $("#mediaplayer").bind($.jPlayer.event.ended, function(event) {
                var current = myPlaylist.current;
                myPlaylist.remove(current - 1);
                $.getJSON("ajax.php?action=getRandomPlaylist&num=1", function(json){
                    $(json).each(function(i, audioFile) {
                        myPlaylist.add(audioFile);
                    });
                });
            }).bind($.jPlayer.event.play, function(event) {
                // TODO: This is kind of a bug, but shouldn't happen with normal usage.
                //       If you click the last item in the list, after it's done, the player will stop.
                console.log("This is where we'll add an item to the list if playing the last item.");
            });;

            hideWorking();
        }
    });
}

$(document).ready(function(){
    init();

    if ($("#content-player").length > 0 && $(".m3uplayer").length > 0) {
        $("#playbutton").html("Pause");
    }
    
    $(document).on("click", "#playbutton", function() {
        toggleMusicOn($(this).data('url'));
    });

    $(document).on("click", ".jp-play", function() {
        $("#playbutton").html("Pause");
    });

    $(document).on("click", ".jp-pause,.jp-stop", function() {
        $("#playbutton").html("Play");
    });

    $(document).on("click", ".droplink", function() {
        openDir($(this).data('url'));
    });

    $(document).on("click", ".dirlink", function() {
        openDir($(this).data('url'));
    });

    $(document).on("click", ".dirlinkcover", function() {
        openDir($(this).data('url'));
    });

    $(document).on("click", ".addtoplaylist", function(e) {
        addToPlaylist(e, this);
    });

    $(document).on("click", "#logout-link", function(e) {
        logout(this);
    });

    $(document).on("click", "#radio-button", function(e) {
        playRadio(e);
    });

    prevtime = parseInt(new Date().getTime());
    // Waits 500 milliseconds before performing search.
    threshold = 500;
    curval = "";
    t = null;
    $(document).on("keyup", "#search", function() {
        curval = $(this).val();
        curtime = parseInt(new Date().getTime());
        next = prevtime + threshold;
        prevtime = curtime;
        if (curtime < next) {
            clearTimeout(t);
            t = setTimeout("search('" + curval + "')", threshold);
            return;
        }
    });
});
