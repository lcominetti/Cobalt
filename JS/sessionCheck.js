var sessionUsername;
var user;

//  Enables PopOvers
$(function () {
  $('[data-toggle="popover"]').popover()
})

//  Enables Tooltips
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
});

//Outside the ready to be avaible from every file
if (getUrlVars()["user"] != undefined || getUrlVars()["user"] != "") {
  console.time("Session Getting")
  $.ajax({
    type: "POST",
    url: "PHP/json.php",
    data: "",
    async: false,
    success: function (data) {
      try {
        user = JSON.parse(data);
        console.log("User logged found.");
        document.getElementById("welcomeText").innerHTML = "Bentornato, " + user.nome;
        sessionUsername = user.nome;
        document.getElementById("profileNavBtn").href = "profile.html?user=" + user.nome;
      }
      catch (error) {
        console.error(data);
      }
    }
  });
  console.timeEnd("Session Getting");
}

$(document).ready(function () {
  // Blocks breaks in TextAreas
  $("textarea").keypress(function (event) {
    if (event.which == '13') {
      return false;
    }
  });

  $(".banBadChar").each(function (index) {
    $(this).keypress(function (e) {
      var keyCode = e.keyCode || e.which;

      //Regex for Valid Characters i.e. Alphabets and Numbers.
      var regex = /[^\w\d\s\']/gi;

      //Validate TextBox value against the Regex.
      var isValid = regex.test(String.fromCharCode(keyCode));
      if (isValid) { $(this).popover('show') }
      else { $(this).popover('hide') }

      return !isValid;
    });

    $(this).click(function () {
      $(this).popover('hide')
    });
  })

});

function logout() {
  $.ajax({
    type: "POST",
    url: "PHP/logout.php",
    data: "",
    success: function (data) {
      console.log(data)
      if (data != "success") {
        alert("Errore nel logout!");
      }
      else {
        window.location.href = "login.html";
      }
    }
  });
}

function viewAlbum(id) {
  $.ajax({
    type: "GET",
    url: "PHP/setCurrentAlbum.php",
    data: { 'id': id },
    success: function (data) {
      if (data != "success") {
        console.log("Errore nell'impostare la variabile di sessione")
      }
      else {
        window.location.href = "albumView.html";
      }
    }
  });
}

function playAlbum(id) {
  $.ajax({
    type: "GET",
    url: "PHP/setCurrentAlbum.php",
    data: { 'id': id },
    success: function (data) {
      if (data != "success") {
        console.log("Errore nell'impostare la variabile di sessione")
      }
      else {
        window.location.href = "playGarden.html";
      }
    }
  });
}


function getUrlVars() {
  var vars = [], hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for (var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=');

    if ($.inArray(hash[0], vars) > -1) {
      vars[hash[0]] += "," + hash[1];
    }
    else {
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
  }

  return vars;
}

function markBtns(salvati) {
  if (salvati == undefined) {
    console.error("Error while retrieving saved albums");
    return;
  }

  $('div').find('button:contains("Aggiungi album")').each(function () {
    salvati.forEach(num => {
      if ($(this).attr('id') == ("btn" + String(num.id))) {
        $(this).html(`<i class="fas fa-minus"></i> Rimuovi album`);
        $(this).removeClass("btn-primary").addClass("btn-outline-primary");
        $(this).attr("onclick", `removeAlbum(${num.id})`)
      }
    });
  });
}


function removeAlbum(id) {
  $.ajax({
    type: "POST",
    url: "PHP/removeAlbum.php",
    data: { 'id': id },
    success: function (data) {
      if (data != "success") {
        console.error("Errore nella rimozione")
      }
      else {
        window.location.reload();
      }
    }
  });
}

//  Album Preview
function albumPreview(id, array) {
  array.forEach(album => {
    if (album.id == id) {
      //  Setting default image if its's null
      album.imgLink = album.imgLink == null ? "images\\albumCovers\\000-icon.svg": album.imgLink;

      //  Setting title and description
      $("#modal-title").html(`<img src="${album.imgLink}" class="albumPreviewProfile" alt=""> ` + album.nome);
      $("#modal-body").html("" + album.descrizione);

      //  Adds backs and fronts to the table
      let tableBody = document.getElementById("tableBody");
      tableBody.innerHTML = "";
      console.table(album.flashcards);

      if (album.flashcards.length < 1) {
        $("#noflashcards").show();
        $("#tableList").hide();
        return;
      }
      else {
        $("#noflashcards").hide();
        $("#tableList").show();
      }
      album.flashcards.forEach(flashcard => {
          tableBody.innerHTML += "<tr>" +
            `<td>${flashcard.fronte.replace('\\', '')}</td>` +
            `<td>${flashcard.retro.replace('\\', '')}</td>` +
            "</tr>";
      });
    }
  });
}

function getVibrant(imgLink) {
  var img = document.createElement('img');
  let path = imgLink.src;

  img.setAttribute('src', path);
  var vibrant = new Vibrant(img);
  var swatches = vibrant.swatches()
  return swatches["Vibrant"].getHex();
}

//  Save Preview
function saveAlbum(id, email = user.richiedente) {
  //  Ajax request
  $.ajax({
    type: "POST",
    url: "PHP/saveAlbum.php",
    data: { 'id_album': id, 'email': email },
    success: function (data) {
      switch (data) {
        case "success":
          $("#btn" + id).hide();
          $("#nbtn" + id).show();
          break;
      
        case "saveExisting":
          alert("L'album è già presente nella tua libreria!");
          break;

        default:
          console.error(data) 
          break;
      }
    }
  })
}

const copyTo = str => {
  const el = document.createElement('textarea');  // Create a <textarea> element
  el.value = str;                                 // Set its value to the string that you want copied
  el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
  el.style.position = 'absolute';                 
  el.style.left = '-9999px';                      // Move outside the screen to make it invisible
  document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
  const selected =            
    document.getSelection().rangeCount > 0        // Check if there is any content selected previously
      ? document.getSelection().getRangeAt(0)     // Store selection if found
      : false;                                    // Mark as false to know no selection existed before
  el.select();                                    // Select the <textarea> content
  document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
  document.body.removeChild(el);                  // Remove the <textarea> element
  if (selected) {                                 // If a selection existed before copying
    document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
    document.getSelection().addRange(selected);   // Restore the original selection
  }
};

function getFormattedDatetime(date) {
  //  Data formatted
  let dateTime = date.split(' ');
  let dateArray = dateTime[0].split("-");
  let calendar = `${dateArray[2]}/${dateArray[1]}/${dateArray[0]}`
  let hours = dateTime[1].substring(0, 5);

  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  today = dd + '/' + mm + '/' + yyyy;
  let yesterday = String(parseInt(dd) - 1).padStart(2, '0') + '/' + mm + '/' + yyyy;

  calendar = calendar == today ? "Oggi" : calendar;
  calendar = calendar == yesterday ? "Ieri" : calendar;

  return `${calendar} alle ${hours}`;
}
