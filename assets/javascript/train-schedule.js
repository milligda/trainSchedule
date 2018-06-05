$(document).ready(function() {

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyDu5tHxLGB6UF6_PuvV4lbv1CVuNxGarnA",
        authDomain: "trainschedule-db51f.firebaseapp.com",
        databaseURL: "https://trainschedule-db51f.firebaseio.com",
        projectId: "trainschedule-db51f",
        storageBucket: "",
        messagingSenderId: "541274982192"
    };
    
    firebase.initializeApp(config);

    var database = firebase.database();

    var newTrainLine;
    var trainLineName = "";
    var trainDestination = "";
    var trainStops = "";
    var trainStartTime = "";
    var trainFrequency = "";
    var trainID = 0;
    var allStops = [];

    // connect to the database on the page load and count the number of items in the database
    database.ref().on("value", function(snap) {

        // display the number of items in the folder (the number of online users) to the page
        trainID = snap.numChildren() + 1;
    });

    $("#submit-new-line").on("click", function(event) {

        event.preventDefault();

        //store the form inputs
        trainLineName = $("#form-line-name").val().trim();
        trainDestination = $("#form-last-stop").val().trim();
        trainStops = $("#form-stops").val().trim();
        trainStartTime = $("#form-start-time").val().trim();
        trainFrequency = $("#form-frequency").val().trim();

        newTrainLine = {
            Name: trainLineName,
            destination: trainDestination,
            stops: trainStops,
            startTime: trainStartTime,
            frequency: trainFrequency,
            id: trainID,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        }

        database.ref().push(newTrainLine);

        // clear out the form values
        $("#form-line-name").val("");
        $("#form-last-stop").val("");
        $("#form-stops").val("");
        $("#form-start-time").val("");
        $("#form-frequency").val("");
    });

    database.ref().on("child_added", function(childSnapshot) {

        console.log(childSnapshot.val());

        var snapFrequency = childSnapshot.val().frequency; // string
        snapFrequency = parseInt(snapFrequency);  // integer 15



        var snapStartTime = childSnapshot.val().startTime; // string in 08:10 format

        var convertedStart = moment(snapStartTime, 'HH:mm'); 
        console.log(convertedStart);


        var newRow = $('<tr>');
        var nameTD = $('<td>' + childSnapshot.val().Name + '</td>');
        var finalStopTD = $('<td>' + childSnapshot.val().destination + '</td>');
        var frequencyTD = $('<td>' + childSnapshot.val().frequency + '</td>');
        var nextArrivalTD = $('<td>' +  + '</td>');
        var minutesAwayTD = $('<td>' + '</td>');

        nameTD.appendTo(newRow);
        finalStopTD.appendTo(newRow);
        frequencyTD.appendTo(newRow);
        nextArrivalTD.appendTo(newRow);
        minutesAwayTD.appendTo(newRow);

        newRow.appendTo("#train-schedule");

        var stopsArray = childSnapshot.val().stops.split(', ');

        for (var i = 0; i < stopsArray.length; i++) {
            allStops.push(stopsArray[i]);
        }

        allStops.sort();

        $("#destination-menu").empty();

        for (var i = 0; i < allStops.length; i++) {
            var trainStop = $("<button>");
            trainStop.addClass('dropdown-item');
            trainStop.attr('train-id', childSnapshot.val().id);
            trainStop.text(allStops[i]);
            trainStop.appendTo("#destination-menu");
        }
    });

        




});