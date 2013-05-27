function toggleMusicOn(url) {
    if ($(".m3uplayer").length > 0 && url == $("#theurl").data("url")) {
        var player = document.getElementById("mediaplayer");
        var playlist = player.getPlaylist();
        if (playlist.length > 0) {
            if ($("#playbutton").html() == "Play") {
                player.sendEvent('PLAY', 'true');
                $("#playbutton").html("Pause");
            } else {
                player.sendEvent('PLAY', 'false');
                $("#playbutton").html("Play");
            }
        }
    } else {
        //location.href = "index.php?action=createPlaylist&dir=" + encodeURIComponent(url);
        createPlaylistJs(url);
    }
}

function createPlaylistJs(url) {
    $.ajax({
        type: "GET",  
        url: "index.php",  
        data: "action=createPlaylistJs&dir=" + encodeURIComponent(url),
        success: function(html){
            $("#content-player").html(html);
        }
    });
}

function openDir(url) {
    location.hash = "#/open/" + encodeURIComponent(url);
    $.ajax({
        type: "GET",  
        url: "index.php",  
        data: "action=openDir&url=" + encodeURIComponent(url) + "&dir=" + encodeURIComponent(url),
        success: function(text){
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
    $.ajax({
        type: "GET",  
        url: "index.php",  
        data: "action=search&q=" + encodeURIComponent(q),
        success: function(html){
            $("#musicindex").html(html);
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

    $(document).on("click", ".droplink", function() {
        openDir($(this).data('url'));
    });

    $(document).on("click", ".dirlink", function() {
        openDir($(this).data('url'));
    });

    $(document).on("click", ".dirlinkcover", function() {
        openDir($(this).data('url'));
    });

    $(document).on("keyup", "#search", function() {
        search($(this).val());
    });
});