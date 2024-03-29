async function getFriends() {
    $.ajax({
        type: "POST",
        url: "PHP/getFriends.php",
        data: { 'username': username },
        success: function (data) {
            try { friendsJson = JSON.parse(data) }
            catch (error) { console.error("Errore nell'ottenimento degli amici") }

            checkForUnfollowBtn(friendsJson.seguaci);

            $("#nfriends").html("" + friendsJson.nAmici);
            friendsJson.amici.forEach(friend => {
                friendsSetter(friend, "friendsUL")
            });

            $("#nfollowers").html("" + friendsJson.nSeguaci);
            friendsJson.seguaci.forEach(friend => {
                friendsSetter(friend, "followersUL")
            });

            $("#nfollowed").html("" + friendsJson.nSeguiti);
            friendsJson.seguiti.forEach(friend => {
                friendsSetter(friend, "followedUL")
            });
        }
    })
}

function friendsSetter(friend, ULName) {
    if (friend.imgProfilo == undefined || friend.imgProfilo == "" || friend.imgProfilo == "")
        friend.imgProfilo = "images\\profilesCovers\\dog.svg"

    let img = document.createElement('img');
    img.className += "listIcon";
    img.setAttribute('src', friend.imgProfilo)

    let a = document.createElement('a');
    a.href = "profile.html?user=" + friend.nome;
    a.id = ULName + friend.nome;

    addUL(ULName, document.getHTML(img) + "&nbsp;" + document.getHTML(a))
    $("#" + a.id).html("" + friend.nome);
}

function checkForUnfollowBtn(array) {

    if (username == sessionUsername) {
        return;
    }
    array.forEach(friend => {
        if (friend.nome == sessionUsername) {
            $("#followBtn").hide();
            $("#unfollowBtn").show();
            return;
        }
    });
}

function getPCard(id, name, description, imgLink, author) {

    //  Truncate strings that exceeds the max length
    var descMaxLength = 32;
    if (description.length > descMaxLength) {
        description = description.substring(0, descMaxLength) + "...";
    }

    //  Personalized info in own profile
    author = author != sessionUsername ? author : "te";

    //  Returns the formatted HTML
    return `<div class="card mb-3 mx-auto singleCard"> <div class="row no-gutters"> <div class="col-md-4">` +
        `<img src="${imgLink}" id="cardImg"> </div> <div class="col-md-8"> <div class="card-body"> <h5 class="card-title">${name}</h5> ` +
        `<p class="card-text">${description}</p><p class="card-text btnBox" id="${id}">` +
        `<button onclick='saveAlbum(${id},"${author}")' id="btn${id}" class='btn btn-primary'><i class="fas fa-plus"></i> Aggiungi album</button>` +
        `<button onclick='removeAlbum(${id},"${author}")' id="nbtn${id}" class='btn btn-outline-primary' style="display:none;"><i class="fas fa-minus"></i> Aggiunto ai tuoi Album</button>` +
        `<button data-toggle="modal" data-target="#previewModal" onclick='albumPreview(${id}, user.albums)' class='btn btn-secondary ml-1'><i class="fas fa-search"></i> Anteprima</button>` +
        `</p> <p class="card-text text-secondary">Creato da ${author}</p> </div> </div> </div> </div>`;
}

//  Adapt the page depending on the user
function checkLocalProfile() {
    if (username != sessionUsername) {
        $("#followBtn").show();
        $("#messageBtn").show();
        $("#followBtn").click(function () { follow(profileJson.nome) });
        $("#unfollowBtn").click(function () { unfollow(profileJson.nome) });
    }
    else {
        setProfileImages();
        $("#editBtn").show();
        $("#name").val(user.nome);
        $("#motto").val(user.motto);
        $("#userCards").find("button").addClass("d-none");
        $("#userCards").find(".btnBox").html(
            `<button id="playAlbum${$(".btnBox").attr('id')}" onclick='playAlbum(${$(".btnBox").attr('id')})' class='btn btn-primary' data-container="body" data-toggle="popover" data-placement="bottom" data-content="L'` +
            `album deve contenere almeno due flashcards!"> <i class="fa fa-arrow-right"></i> Avvia</button>` +
            `<button id="viewAlbum${$(".btnBox").attr('id')}" onclick='viewAlbum(${$(".btnBox").attr('id')})' class='btn btn-outline-secondary ml-1'><i class="fa fa-pencil"></i> Modifica</button>`
        );
    }
}

function setProfileImages() {
    var dir = "images/profilesCovers";
    var fileextension = ".svg";
    $.ajax({
        //This will retrieve the contents of the folder if the folder is configured as 'browsable'
        url: dir,
        success: function (data) {
            //List all .png file names in the page
            $(data).find("a:contains(" + fileextension + ")").each(function () {
                var filename = this.href.replace(window.location.host, "").replace("http://", "");
                $("#icons").append(`<img class="img-thumbnail imgList" data-dismiss="modal" src="${dir}${filename}" onclick="changeIcon('${dir}','${filename}');">`);
            });
        }
    });
}

async function setBackground() {
    var img = document.createElement('img');
    let path = document.getElementById("profileImage").src;

    img.setAttribute('src', path);
    img.addEventListener('load', function () {
        var vibrant = new Vibrant(img);
        var swatches = vibrant.swatches()
        document.getElementById("coverImg").style.background = swatches["Vibrant"].getHex();
    });
}

function changeIcon(dir, filename) {
    document.getElementById('currentIcon').src = dir + filename;
}

function addUL(parent, str) {
    var ul = document.getElementById(parent);
    var li = document.createElement("li");
    $(li).addClass("list-group-item d-flex align-items-left");
    $(li).html(str);
    ul.appendChild(li);
}

function follow(user) {
    $.ajax({
        type: "POST",
        url: "PHP/followPerson.php",
        data: { 'username': user },
        success: function () {
            $("#followBtn").hide();
            $("#unfollowBtn").show();
            $("#nfollowers").html(parseInt($("#nfollowers").html()) + 1);
        }
    })
}

function unfollow(user) {
    $.ajax({
        type: "POST",
        url: "PHP/unfollowPerson.php",
        data: { 'username': user },
        success: function () {
            $("#unfollowBtn").hide();
            $("#followBtn").show();
            $("#nfollowers").html(parseInt($("#nfollowers").html()) - 1);
        }
    })
}

function editAlert(str) {
    $("#editAlert").html(str)
    $("#editAlert").show()
}

document.getHTML = function (who, deep) {
    if (!who || !who.tagName) return '';
    var txt, ax, el = document.createElement("div");
    el.appendChild(who.cloneNode(false));
    txt = el.innerHTML;
    if (deep) {
        ax = txt.indexOf('>') + 1;
        txt = txt.substring(0, ax) + who.innerHTML + txt.substring(ax);
    }
    el = null;
    return txt;
}
