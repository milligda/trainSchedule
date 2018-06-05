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
    var nextArrival;
    var minutesAway;

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

        var snapFrequency = childSnapshot.val().frequency;
        snapFrequency = parseInt(snapFrequency);

        var snapStartTime = childSnapshot.val().startTime;

        var convertedStart = moment(snapStartTime, 'HH:mm'); 

        var timeDifference = moment().diff(moment(convertedStart), "minutes");

        var timeRemainder = timeDifference % snapFrequency;

        if (moment().diff(moment(convertedStart), "minutes") < 0) {
            
            minutesAway = Math.abs(timeDifference);
            nextArrival = convertedStart;
        
        } else {

            minutesAway = snapFrequency - timeRemainder;
            nextArrival = moment().add(minutesAway, "minutes");
        }

        nextArrival = moment(nextArrival).format("h:mma");

        var stopsArray = childSnapshot.val().stops.split(', ');

        populateTable(childSnapshot.val());

        $("#destination-menu").empty();

        populateStopsDropdown(childSnapshot.val(), stopsArray);

        populateTrainModal(childSnapshot.val(), nextArrival, minutesAway, stopsArray);
    });

    function populateTable(train) {

        var newRow = $('<tr>');
        var nameTD = $('<td>');
        var nameModalLink = $('<a class="train-name" data-toggle="modal">' + train.Name + '</a>');
        nameModalLink.attr('data-target', '#trainSchedule' + train.id);
        var finalStopTD = $('<td>' + train.destination + '</td>');
        var frequencyTD = $('<td>' + train.frequency + '</td>');
        var nextArrivalTD = $('<td>' + nextArrival + '</td>');
        var minutesAwayTD = $('<td>' + minutesAway + '</td>');

        nameModalLink.appendTo(nameTD);
        nameTD.appendTo(newRow);
        finalStopTD.appendTo(newRow);
        frequencyTD.appendTo(newRow);
        nextArrivalTD.appendTo(newRow);
        minutesAwayTD.appendTo(newRow);

        newRow.appendTo("#train-schedule");
    }

    function populateStopsDropdown(train, stops) {

        for (var i = 0; i < stops.length; i++) {
            allStops.push(stops[i]);
        }

        allStops.sort();

        for (var i = 0; i < allStops.length; i++) {
            var trainStop = $("<button>");
            trainStop.addClass('dropdown-item');
            trainStop.attr('data-toggle', 'modal');
            trainStop.attr('data-target', '#trainSchedule' + train.id);
            trainStop.text(allStops[i]);
            trainStop.appendTo("#destination-menu");
        }
    }

    function populateTrainModal(train, nextArrival, minutesAway, stops) {

        var trainModal = $('<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true" id="trainSchedule' + train.id + '">');
        var modalDialog = $('<div class="modal-dialog modal-dialog-centered" role="document">');
        var modalContent = $('<div class="modal-content">');
        var modalHeader = $('<div class="modal-header">');
        var modalTitle = $('<h5 class="modal-title">' + train.Name + '</h5>');
        var modalClose = $('<button type="button" class="close" data-dismiss="modal" aria-label="Close">');
        var modalCloseButton = $('<span aria-hidden="true">');
        modalCloseButton.text("x");
        var modalBody = $('<div class="modal-body">');

        var modalNextTrain = $('<p class="next-train-time">');
        modalNextTrain.text('Next Train: ' + nextArrival);
        modalNextTrain.appendTo(modalBody);

        var modalArrivalTime = $('<p class="next-train-minutes">');
        modalArrivalTime.text('arriving in ' + minutesAway + ' minutes');
        modalArrivalTime.appendTo(modalBody);

        var modalStopsHeader = $('<p class="train-stops">Stops:</p>');
        modalStopsHeader.appendTo(modalBody);
        
        for (var i = 0; i < stops.length; i++) {
            var modalStop = $('<p class="train-stop">');
            modalStop.text(stops[i]);
            modalStop.appendTo(modalBody);
        }

        modalCloseButton.appendTo(modalClose);
        modalTitle.appendTo(modalHeader);
        modalClose.appendTo(modalHeader);
        modalHeader.appendTo(modalContent);
        modalBody.appendTo(modalContent);
        modalContent.appendTo(modalDialog);
        modalDialog.appendTo(trainModal);
        trainModal.appendTo("#modal-container");
    }

    $("#add-train-button").on("click", function() {
        $("#add-train-container").slideToggle("slow");
    });
});