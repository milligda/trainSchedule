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
    var updatePeriod = 60 // in seconds

    // connect to the database on the page load and count the number of items in the database
    database.ref().on("value", function(snap) {

        // display the number of items in the folder (the number of online users) to the page
        trainID = snap.numChildren() + 1;
    });

    $("#submit-new-line").on("click", function(event) {

        event.preventDefault();

        //store the form inputs as variables
        trainLineName = $("#form-line-name").val().trim();
        trainDestination = $("#form-last-stop").val().trim();
        trainStops = $("#form-stops").val().trim();
        trainStartTime = $("#form-start-time").val().trim();
        trainFrequency = $("#form-frequency").val().trim();

        // create a newTrainLine object to pass to the database
        newTrainLine = {
            Name: trainLineName,
            destination: trainDestination,
            stops: trainStops,
            startTime: trainStartTime,
            frequency: trainFrequency,
            id: trainID,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        }

        // push the newTrainLine object to the database
        database.ref().push(newTrainLine);

        // clear out the form values
        $("#form-line-name").val("");
        $("#form-last-stop").val("");
        $("#form-stops").val("");
        $("#form-start-time").val("");
        $("#form-frequency").val("");
    });


    database.ref().on("child_added", function(childSnapshot) {

        // console log the object that is returned from the database
        console.log(childSnapshot.val());

        // call the addTrain function for adding a new train line to the page
        addTrain(childSnapshot);
    });

    // function for adding a new train line to the page
    function addTrain(childSnapshot) {

        // call the calculateTimes function and pass it the train object
        calculateTimes(childSnapshot.val());

        // call the populateTable function and pass it the train object
        populateTable(childSnapshot.val());

        // call the populateStopsDropdown function and pass it the train object
        populateStopsDropdown(childSnapshot.val());

        // call the populateTrainModal function and pass it the train object
        populateTrainModal(childSnapshot.val());
    }

    // calculates the minutes until the next train and the next arrival time
    function calculateTimes(train) {

        // store the train frequency and convert that to an integer
        var snapFrequency = train.frequency;
        snapFrequency = parseInt(snapFrequency);

        // store the train's start time and convert that to a moment time value
        var snapStartTime = train.startTime;
        var convertedStart = moment(snapStartTime, 'HH:mm'); 

        // calculate the difference in minutes between now and the train's start time
        var timeDifference = moment().diff(moment(convertedStart), "minutes");

        // calculate the remainder of time between the timeDifference and the frequency
        var timeRemainder = timeDifference % snapFrequency;

        // if we have not reached the start time 
        if (moment().diff(moment(convertedStart), "minutes") < 0) {
            
            // set the minutes away to be the difference between now and the start time and set the next arrival as the start time
            minutesAway = Math.abs(timeDifference);
            nextArrival = convertedStart;
        
        } else {

            // calculate the minutes away by subtracting the timeRemainder from the train frequency
            // set the next arrival based on the minutesAway
            minutesAway = snapFrequency - timeRemainder;
            nextArrival = moment().add(minutesAway, "minutes");
        }

        // format the nextArrival
        nextArrival = moment(nextArrival).format("h:mma");
    }

    // populates the table with the new train's information
    function populateTable(train) {

        // create the new table row and assign it a data variable of the train id to call the corresponding modal
        var newRow = $('<tr class="train-line" data-toggle="modal">');
        newRow.attr('data-target', '#trainSchedule' + train.id)

        // create the table data elements for the new row
        var nameTD = $('<td>' + train.Name + '</td>');
        var finalStopTD = $('<td>' + train.destination + '</td>');
        var frequencyTD = $('<td>' + train.frequency + '</td>');
        var nextArrivalTD = $('<td>' + nextArrival + '</td>');
        var minutesAwayTD = $('<td>' + minutesAway + '</td>');

        // append the table data elements to the new row and then append the row to the table
        nameTD.appendTo(newRow);
        finalStopTD.appendTo(newRow);
        frequencyTD.appendTo(newRow);
        nextArrivalTD.appendTo(newRow);
        minutesAwayTD.appendTo(newRow);

        newRow.appendTo("#train-schedule");
    }

    // populates the stops dropdown with the stops for the new train
    function populateStopsDropdown(train) {

        // store the train's stops as an array
        var stops = train.stops.split(', ');

        // for each item in the stops array, create a button that will call the train's modal. Append that button to the dropdown menu
        for (var i = 0; i < stops.length; i++) {
            var trainStop = $("<button>");
            trainStop.addClass('dropdown-item');
            trainStop.attr('data-toggle', 'modal');
            trainStop.attr('data-target', '#trainSchedule' + train.id);
            trainStop.text(stops[i]);
            trainStop.appendTo("#destination-menu");
        }
    }

    // create a modal for the new train line with the arrival information and stops 
    function populateTrainModal(train) {

        // store the train's stops as an array
        var stops = train.stops.split(', ');

        // creates the modal structure, sets its id based on the train's id and adds the name
        var trainModal = $('<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true" id="trainSchedule' + train.id + '">');
        var modalDialog = $('<div class="modal-dialog modal-dialog-centered" role="document">');
        var modalContent = $('<div class="modal-content">');
        var modalHeader = $('<div class="modal-header">');
        var modalTitle = $('<h5 class="modal-title">' + train.Name + '</h5>');
        var modalClose = $('<button type="button" class="close" data-dismiss="modal" aria-label="Close">');
        var modalCloseButton = $('<span aria-hidden="true">');
        modalCloseButton.text("x");
        var modalBody = $('<div class="modal-body">');

        // add the time of the next train to the modal
        var modalNextTrain = $('<p class="next-train-time">');
        modalNextTrain.text('Next Train: ' + nextArrival);
        modalNextTrain.appendTo(modalBody);

        // add the minutes until the next train to the modal
        var modalArrivalTime = $('<p class="next-train-minutes">');
        modalArrivalTime.text('arriving in ' + minutesAway + ' minutes');
        modalArrivalTime.appendTo(modalBody);

        // add the train stops header to the modal
        var modalStopsHeader = $('<p class="train-stops">Stops:</p>');
        modalStopsHeader.appendTo(modalBody);
        
        // add the train stops to the modal
        for (var i = 0; i < stops.length; i++) {
            var modalStop = $('<p class="train-stop">');
            modalStop.text(stops[i]);
            modalStop.appendTo(modalBody);
        }

        // append all the pieces to construct the modal and then append the modal to the modal-container on the page
        modalCloseButton.appendTo(modalClose);
        modalTitle.appendTo(modalHeader);
        modalClose.appendTo(modalHeader);
        modalHeader.appendTo(modalContent);
        modalBody.appendTo(modalContent);
        modalContent.appendTo(modalDialog);
        modalDialog.appendTo(trainModal);
        trainModal.appendTo("#modal-container");
    }

    // setInterval for updating the nextArrival time and minutes until the next train
    setInterval(function() {

        // call the database once and return the entire database as a snapshot
        database.ref().once('value', function(snapshot){

            // empty the train-schedule and modal-container divs
            $("#train-schedule").empty();
            $("#modal-container").empty();

            // cycle through each child in the snapshot
            snapshot.forEach(function(childSnapshot) {

                // calculate the new arrivalTime and minutesAway
                calculateTimes(childSnapshot.val());

                // repopulate the table with the updated arrivalTime and minutesAway
                populateTable(childSnapshot.val());

                // repopulate the train modals with the updated arrivalTime and minutesAway
                populateTrainModal(childSnapshot.val());
            });
        });
    }, 1000 * updatePeriod);

    // when the add-train-button is clicked, toggle the add-train form
    $("#add-train-button").on("click", function() {

        $("#add-train-container").slideToggle("slow");
    });
});