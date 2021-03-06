var server_prefix = "https://eventsplus.herokuapp.com";
// var server_prefix = "http://localhost:5000";
currentFriendList = [];

function authenticate() {
    var path = "/authenticate";
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if(this.readyState == 4 && this.status === 500)
        {
            alert("Please log in.");
            disconnect();
        }
        else {
            document.getElementById("yesPass").style.visibility = "visible";
        }
    };
    request.open("POST", server_prefix + path, true );
    request.send();
}

function acceptOrReject(username) {
    return "<button class=\"myButton\" onclick=\"acceptFriend(\'" + username + "\')\">Accept</button>";
}

function goToFriends() {
    goToPage("Friends.html");
}

function goToEvents() {
    goToPage("Events.html");
}

function goHome() {
    goToPage("AfterLogin.html");
}

function disconnect() {
    goToPage("Home.html");
}

function acceptFriend(username) {
    var path = "/acceptFriend/" + username;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if(this.readyState == 4 && this.status === 200)
        {
            alert("You and " + username + " are now friends!");
        }
        else if(this.readyState == 4 && this.status === 500) {
            alert(JSON.parse(this.responseText).error);
        }
    };
    request.open("POST", server_prefix + path, true );
    request.send();
}

function fillCategories() {
    var path = "/getCategories";
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if(this.readyState == 4 && this.status === 200)
        {
            var arr = JSON.parse(this.responseText);
            for (var i = 0; i < arr.length; i++) {
                addCategoryToSelect(arr[i]);
            }
        } else if(this.readyState == 4 && this.status === 500)
        {
            alert(JSON.parse(this.responseText).error);
        }
    };
    request.open("GET", server_prefix + path, true );
    request.send();
}

function addCategoryToSelect(str) {
    var x = document.getElementById("publicEventCategory");
    var option = document.createElement("option");
    option.text = str;
    x.add(option);
}

function refreshFriendRequests() {
    var path = "/friendRequests";
    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var all_reqs = JSON.parse(this.responseText);
            var spanOfNumFriends = document.getElementById("requestNum");
            spanOfNumFriends.innerHTML = all_reqs.length;
            var str = "";
            all_reqs.forEach(function(friend) {
                str += friend + acceptOrReject(friend) + "<br>";
            });
            document.getElementById("addedMe").innerHTML =  str;

        } else if (this.readyState == 4 && this.status == 500) {
            alert(JSON.parse(this.responseText).error);
        }
    };
    request.open("GET", server_prefix + path, true);
    request.send();
}

setInterval(refreshFriendRequests, 1000);

function sendFriendRequest() {
    var user = document.getElementById("friendRequestName").value;
    var path = "/addFriend/" + user;
    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if(this.readyState == 4 && this.status === 200)
        {
            alert("Friend request to " + user + " sent.");
        } else if(this.readyState == 4 && this.status === 500)
        {
            alert(JSON.parse(this.responseText).error);
        }
    };
    request.open("POST", server_prefix + path, true );
    request.send();
}

function goToPage(page) {
    window.location.href = server_prefix + "/public/" + page;
}

function addFriendToEvent(eventType) {
    var friend;

    if (eventType === 'Private'){
        friend = getSelectValue("friendSelect");
    }
    else{
        friend = getSelectValue("publicEventfriendSelect");
    }

    if (currentFriendList.indexOf(friend) > -1){
        alert("You already invited " + friend + " to this event");
    }
    else{
        currentFriendList.push(friend);
    }
}

function fillFriendList() {
    var path = "/friends";
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if(this.readyState == 4 && this.status === 200)
        {
            var arr = JSON.parse(this.responseText);
            for (var i = 0; i < arr.length; i++) {
                addFriendToSelect(arr[i]);
            }
        } else if(this.readyState == 4 && this.status === 500)
        {
            alert(JSON.parse(this.responseText).error);
        }
    };
    request.open("GET", server_prefix + path, true );
    request.send();
}

function addFriendToSelect(str) {
    var x = document.getElementById("friendSelect");
    var option = document.createElement("option");
    option.text = str;
    x.add(option);

    var x = document.getElementById("publicEventfriendSelect");
    var option = document.createElement("option");
    option.text = str;
    x.add(option);
}
function getSelectValue(id) {
    var e = document.getElementById(id);
    return e.options[e.selectedIndex].text;
}

function eventer() {
    var eventObj = {
        "name" : getDocValue("eventName"),
        "location" : getDocValue("eventLoc"),
        "dateAndTime" : getDocValue("eventDate"),
        "imgURL" : getDocValue("eventPic"),
        "description" : getDocValue("eventDescription"),
        "participants" : currentFriendList
    };

    var timestamp = Date.parse(eventObj.dateAndTime);

    if (eventObj.name !== "" && eventObj.location !== "" && isNaN(timestamp) === false &&
        eventObj.description !== "" && eventObj.participants.length > 0){

        var path = "/createPrivateEvent";

        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if(this.readyState == 4 && this.status === 200)
            {
                alert(this.responseText);
                alert(JSON.parse(this.responseText).message);
            } else if(this.readyState == 4 && this.status === 500)
            {
                alert(JSON.parse(this.responseText).error);
            }
        };
        request.open("POST", server_prefix + path, true );
        request.setRequestHeader("Content-Type", "application/json");
        request.send(JSON.stringify(eventObj));
        currentFriendList = [];
        request.send();
    }
    else{
        alert('Please fill all the fields');
    }
}

function publicEventer() {
    var eventObj = {
        "name" : getDocValue("publicEventName"),
        "category": getSelectValue("publicEventCategory"),
        "location" : getDocValue("publicEventLoc"),
        "dateAndTime" : getDocValue("publicEventDate"),
        "imgURL" : getDocValue("publicEventPic"),
        "description" : getDocValue("publicEventDescription"),
        "participants" : currentFriendList,
        "maxAge": getDocValue("publicMaxAge"),
        "minAge": getDocValue("publicMinAge"),
        "maxParticipants" : getDocValue("publicEventMaxPartici")
    };

    var timestamp = Date.parse(eventObj.dateAndTime);
    var maxAge = parseInt(eventObj.maxAge);
    var minAge = parseInt(eventObj.minAge);
    var maxParticipants = parseInt(eventObj.maxParticipants);

    if (eventObj.name !== "" && eventObj.location !== "" && isNaN(timestamp) === false &&
        eventObj.description !== "" && isNaN(maxAge) === false && isNaN(minAge) === false && minAge > 0 &&
        maxAge >= minAge && isNaN(maxParticipants) === false && maxParticipants >= 2){

        var path = "/createPublicEvent";

        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if(this.readyState == 4 && this.status === 200)
            {
                alert(JSON.parse(this.responseText).message);
            } else if(this.readyState == 4 && this.status === 500)
            {
                alert(JSON.parse(this.responseText).error);
            }
        };
        request.open("POST", server_prefix + path, true );
        request.setRequestHeader("Content-Type", "application/json");
        request.send(JSON.stringify(eventObj));
        currentFriendList = [];
        request.send();
    }
    else{
        alert('Please fill all the fields');
    }
}

function getDocValue(id) {
    return document.getElementById(id).value;
}

function addMyEvents() {

    var strarr = ["Yes", "No", "Maybe"];
    for (var i =0; i < 25; i++) {

        var j = Math.floor(Math.random() * 3);
        // addMockEvent(i,strarr[j]);
    }

    var path = "/getEvents";
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if(this.readyState == 4 && this.status === 200)
        {
            var arr = JSON.parse(this.responseText);
            alert("you have " + arr.length + " new event(s)");
            for (var i = 0; i < arr.length; i++) {
                addEvent(arr[i], "myEvents");
            }
        } else if(this.readyState == 4 && this.status === 500)
        {
            alert(JSON.parse(this.responseText).error);
        }
    };
    request.open("GET", server_prefix + path, true );
    request.send();
}

function deleteCookie() {
    document.cookie = "appId" +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}


function addEvent(event, divName) {
    var eventDiv = document.createElement("div");
    var img = document.createElement("img");
    var container = document.createElement("div");
    var strings = [];
    strings.push(event.name, parseEventDateTime(event.dateAndTime), event.location);
    container.className = "container";
    img.src = event.imgURL || "http://mac.h-cdn.co/assets/15/35/1440442371-screen-shot-2015-08-24-at-25213-pm.png";
    img.className = "eventImg";
    eventDiv.className = "eventStyle" + event.status;
    eventDiv.id = event.id;
    container.appendChild(img);
    eventDiv.appendChild(container);
    textNodeWithSpaces(eventDiv,strings);
    var mainEventsDiv = document.getElementById(divName);
    mainEventsDiv.appendChild(eventDiv);
}

$(document).click(function(e) {
    if (isEvent(e.target.className)) {
        var eventId =  e.target.id;

        var path = "/getEvent/" + eventId;
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if(this.readyState == 4 && this.status === 200)
            {
                try {
                    var event = JSON.parse(this.responseText);
                    presentEvent(event, "currentEvent");
                    document.getElementById("currentEvent").style.display = "block";
                    if (document.getElementById("myEvents")) {
                        document.getElementById("myEvents").style.display = "none";
                    } else {
                        document.getElementById("myPublicEvents").style.display = "none";
                    }
                } catch(err) {
                    alert(err);
                }
            } else if(this.readyState == 4 && this.status === 500)
            {
                alert(JSON.parse(this.responseText).error);
            }
        };
        request.open("GET", server_prefix + path, true );
        request.send();
    }
});

function parseEventDateTime(strDate){
    var date = new Date(strDate);

    return date.toDateString() + " " + date.toLocaleTimeString();
}

$(document).bind( "touchstart", function(e) {
    if (isEvent(e.target.className)) {
        var eventId =  e.target.id;

        var path = "/getEvent/" + eventId;
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if(this.readyState == 4 && this.status === 200)
            {
                try {
                    var event = JSON.parse(this.responseText);
                    presentEvent(event, "currentEvent");
                    document.getElementById("currentEvent").style.display = "block";
                    if (document.getElementById("myEvents")) {
                        document.getElementById("myEvents").style.display = "none";
                    } else {
                        document.getElementById("myPublicEvents").style.display = "none";
                    }
                } catch(err) {
                    alert(err);
                }
            } else if(this.readyState == 4 && this.status === 500)
            {
                alert(JSON.parse(this.responseText).error);
            }
        };
        request.open("GET", server_prefix + path, true );
        request.send();
    }
});

function presentEvent(event, divName) {
    if(event.type === "Private"){
        showPrivateEvent(event, divName);
    }
    else{
        showPublicEvent(event, divName);
    }
}

function showPrivateEvent(event, divName) {
    var strName = "Name: " + event.name;
    var strHostedBy = "Hosted By: " + event.creator;
    var strDateAndTime = "Date and Time: " + parseEventDateTime(event.dateAndTime);
    var strLocation = "Location: " + event.location;
    var strDescription = "Description: " + event.description;
    var strAttendingUsers = "Participants: " + event.attendingUsers;

    var eventDiv = document.createElement("div");
    var img = document.createElement("img");
    var container = document.createElement("div");
    var strings = [];
    strings.push(strName, strHostedBy, strDateAndTime, strLocation,
        strDescription,strAttendingUsers);

    container.className = "container";

    img.src = event.imgURL || "http://mac.h-cdn.co/assets/15/35/1440442371-screen-shot-2015-08-24-at-25213-pm.png";
    img.className = "eventImg";
    eventDiv.className = "eventStyleNonClickAble" + event.status;
    eventDiv.id = event.id;
    container.appendChild(img);
    eventDiv.appendChild(container);
    textNodeWithSpaces(eventDiv,strings);

    if (!event.isAdmin) {

        var acceptButton = document.createElement("button");
        var rejectButton = document.createElement("button");
        acceptButton.className = "mybutton";
        rejectButton.className = "mybutton";
        acceptButton.setAttribute("content", "Accept");
        rejectButton.setAttribute("content", "Reject");
        acceptButton.innerHTML = 'Accept';
        rejectButton.innerHTML = 'Reject';
        acceptButton.addEventListener("click", function(){acceptEvent( event.id )});
        rejectButton.addEventListener("click", function(){rejectEvent( event.id )});

        eventDiv.appendChild(acceptButton);
        eventDiv.appendChild(rejectButton);
    }

    var mainEventsDiv = document.getElementById(divName);
    mainEventsDiv.appendChild(eventDiv);
}

function showPublicEvent(event, divName) {

    var strName = "Name: " + event.name;
    var strCategory = "Category: " + event.category;
    var strHostedBy = "Hosted By: " + event.creator;
    var strDateAndTime = "Date and Time: " + parseEventDateTime(event.dateAndTime);
    var strLocation = "Location: " + event.location;
    var strAges = "Ages: " + event.minAge + " - " + event.maxAge;
    var strMaxParticipants = "Max Participants: " + event.maxParticipants;
    var strDescription = "Description: " + event.description;
    var strAttendingUsers = "Participants: " + event.attendingUsers;

    var eventDiv = document.createElement("div");
    var img = document.createElement("img");
    var container = document.createElement("div");
    var strings = [];
    strings.push(strName, strCategory, strHostedBy, strDateAndTime, strLocation, strAges,
        strMaxParticipants, strDescription,strAttendingUsers);

    container.className = "container";

    img.src = event.imgURL || "http://mac.h-cdn.co/assets/15/35/1440442371-screen-shot-2015-08-24-at-25213-pm.png";
    img.className = "eventImg";
    eventDiv.className = "eventStyleNonClickAble" + event.status;
    eventDiv.id = event.id;
    container.appendChild(img);
    eventDiv.appendChild(container);
    textNodeWithSpaces(eventDiv,strings);

    if (event.isAdmin) {

        if(event.requestToParticipantUsers.length > 0){
            eventDiv.appendChild(document.createTextNode("Users who ask to join to this event:"));
            eventDiv.appendChild(document.createElement("br"));
        }

        event.requestToParticipantUsers.forEach(function(user) {
            var userDiv = document.createElement("div");
            userDiv.id = "request" + user;
            var acceptUserButton = document.createElement("button");
            var rejectUserButton = document.createElement("button");
            acceptUserButton.className = "mybutton";
            rejectUserButton.className = "mybutton";
            acceptUserButton.setAttribute("content", "Accept User");
            rejectUserButton.setAttribute("content", "Reject User");
            acceptUserButton.innerHTML = 'Accept User';
            rejectUserButton.innerHTML = 'Reject User';

            acceptUserButton.addEventListener("click", function () {
                acceptUser(event.id, user)
            });
            rejectUserButton.addEventListener("click", function () {
                rejectUser(event.id, user)
            });
            userDiv.appendChild(document.createTextNode(user));
            userDiv.appendChild(acceptUserButton);
            userDiv.appendChild(rejectUserButton);
            userDiv.appendChild(document.createElement("br"));

            eventDiv.appendChild(userDiv);
        })
    }
    else{
        if(event.status === 'NotPartOfTheEvent'){
            var askToJoinButton = document.createElement("button");
            askToJoinButton.className = "mybutton";
            askToJoinButton.setAttribute("content", "Ask to join");
            askToJoinButton.innerHTML = 'Ask to join';
            askToJoinButton.addEventListener("click", function(){askToJoinEvent( event.id )});
            eventDiv.appendChild(askToJoinButton);
        }
        else if (event.status !== 'Pending'){
            var acceptButton = document.createElement("button");
            var rejectButton = document.createElement("button");
            acceptButton.className = "mybutton";
            rejectButton.className = "mybutton";
            acceptButton.setAttribute("content", "Accept");
            rejectButton.setAttribute("content", "Reject");
            acceptButton.innerHTML = 'Accept';
            rejectButton.innerHTML = 'Reject';

            acceptButton.addEventListener("click", function(){acceptEvent( event.id )});
            rejectButton.addEventListener("click", function(){rejectEvent( event.id )});

            eventDiv.appendChild(acceptButton);
            eventDiv.appendChild(rejectButton);
        }
    }

    var mainEventsDiv = document.getElementById(divName);
    mainEventsDiv.appendChild(eventDiv);
}

function acceptUser(event_id,username) {
    var path = "/acceptParticipationRequest/" + event_id + "/" + username;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if(this.readyState == 4 && this.status === 200)
        {
            alert(username + " accepted");
        } else if (this.readyState == 4 && this.status === 500) {
            alert(JSON.parse(this.responseText).error);
        }
    };
    request.open("POST", server_prefix + path, true );
    request.send();
    document.getElementById("request" + username).style.display = "none";
}

function rejectUser(event_id,username) {
    var path = "/rejectParticipationRequest/" + event_id + "/" + username;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if(this.readyState == 4 && this.status === 200)
        {
            alert(username + " rejected");
        } else if (this.readyState == 4 && this.status === 500) {
            alert(JSON.parse(this.responseText).error);
        }
    };
    request.open("POST", server_prefix + path, true );
    request.send();
    document.getElementById("request" + username).style.display = "none";
}

function askToJoinEvent(id) {
    var path = "/requestToParticipantInPublicEvent/" + id;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if(this.readyState == 4 && this.status === 200)
        {
            alert("Asked to join event");
        } else if (this.readyState == 4 && this.status === 500) {
            alert(JSON.parse(this.responseText).error);
        }
    };
    request.open("POST", server_prefix + path, true );
    request.send();
}

function acceptEvent(id) {
    var path = "/acceptEventRequest/" + id;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if(this.readyState == 4 && this.status === 200)
        {
            alert("event accepted");
        } else if (this.readyState == 4 && this.status === 500) {
            alert(JSON.parse(this.responseText).error);
        }
    };
    request.open("POST", server_prefix + path, true );
    request.send();
}

function rejectEvent(id) {
    var path = "/rejectEventRequest/" + id;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if(this.readyState == 4 && this.status === 200)
        {
            alert("event rejected");
        } else if (this.readyState == 4 && this.status === 500) {
            alert(JSON.parse(this.responseText).error);
        }
    };
    request.open("POST", server_prefix + path, true );
    request.send();
}

function isEvent(str) {
    return (str === "eventStyleNo" ||  str === "eventStyleYes" || str === "eventStyleMaybe"
    || str === "eventStylePending"|| str === "eventStyleNotPartOfTheEvent");
}

function textNodeWithSpaces(div, strings) {
    for (var i = 0; i < strings.length; i++) {
        var textNode = document.createTextNode(strings[i]);
        div.appendChild(textNode);

        var linebreak = document.createElement('br');
        div.appendChild(linebreak);

        var linebreak = document.createElement('br');
        div.appendChild(linebreak);
    }
}

function addMockEvent(username, goingStatus) {
    var event = document.createElement("div");
    var img = document.createElement("img");
    var txt = document.createTextNode("Text text text text");
    var container = document.createElement("div");
    container.className = "container";
    img.src = Math.random() > 0.5 ? "http://mac.h-cdn.co/assets/15/35/1440442371-screen-shot-2015-08-24-at-25213-pm.png":
        "http://images.fashionmodeldirectory.com/images/models/14441/header_image_8b1d51db-3e50-4965-b0a7-a524430b4f67.jpg";
    img.className = "eventImg";
    event.className = "eventStyle" + goingStatus;
    container.appendChild(img);
    event.appendChild(txt);
    event.appendChild(container);
    var mainEventsDiv = document.getElementById("myEvents");
    mainEventsDiv.appendChild(event);
}