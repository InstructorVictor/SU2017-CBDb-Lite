(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    function onDeviceReady() {
        // Handle the Cordova pause and resume events, as well as Android's Back Button
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);
        document.addEventListener('backbutton', function(event) { onBackKeyDown(event);}, false);

        navigator.splashscreen.hide(); // Hide the Splashscreen when the app fully loads
        console.log("App ready!");

        // Variables for capturing the Sing Up, Log In elements, and user customization plus Contact button
        var $elFormSignUp = $("#formSignUp");
        var $elFormLogIn = $("#formLogIn");
        var $elBtnLogOut = $("#btnLogOut");
        var $elUserEmail = $(".userEmail");
        var $elBtnContact = $("#btnContact");

        // If..Else Conditional Statement to check if a user has logged in previously
        if (localStorage.getItem("isLoggedIn") === undefined || localStorage.getItem("isLoggedIn") === null || localStorage.getItem("isLoggedIn") === "") {
            console.log("Is NOT logged in: " + localStorage.getItem("isLoggedIn"));
        } else {
            console.log("YES IS logged in: " + localStorage.getItem("isLoggedIn"));
            initDB(); // Initialize the Database (either create a new one or load an existing one)
            fnShowComicsPrep(); // Show the latest Comic collection
            // Move Use from #pgWelcome to #pgHome, with various options
            $(":mobile-pagecontainer").pagecontainer("change", "#pgHome", { "transition": "flip"});
            // Also write the User's email to the Footers [because we didn't use fnLogIn()]
            $elUserEmail.html(localStorage.getItem("isLoggedIn").toLowerCase());
        } // END If...Else checking if a User is logged in

        // Use the JS keywork function to create a 'bundle of Methods'
        // Function to create an account for the User
        function fnSignUp(event) {
            event.preventDefault(); // Prevent default behavior from a Submit button

            // Create 3 JQ Variables to hold the Input Field Nodes
            var $elInEmailSignUp = $("#inEmailSignUp"),
                $elInPasswordSignUp = $("#inPasswordSignUp"),
                $elInPasswordConfirmSignUp = $("#inPasswordConfirmSignUp");

            console.log($elInEmailSignUp.val(), $elInPasswordSignUp.val(), $elInPasswordConfirmSignUp.val());

            // If...Else checks for two possiblities
            // If part checks for True/False of something. If TRUE,
            // do the part in the first pair of Curly Braces.
            // If FALSE, do the part in the second pair of Curlys.
            // Check if both passwords ARE NOT !== equal to each other
            if ($elInPasswordSignUp.val() !== $elInPasswordConfirmSignUp.val()) {
                console.log("PASSWORD DO NOT MATCH");
                $elInPasswordSignUp.val(""); // Reset the Inputs to empty
                $elInPasswordConfirmSignUp.val("");
                $("#popErrorSignUpMismatch").popup(); // Prepare a Popup Message
                $("#popErrorSignUpMismatch").popup("open", { "positionTo": "open", "transition": "flip" }); // Execute Popup Message
            } else {
                console.log("Passwords DO match");
                // Set email/password to Uppercase to avoid capitalization issues
                var tmpValInEmailSignUp = $elInEmailSignUp.val().toUpperCase(),
                    tmpValInPasswordSignUp = $elInPasswordSignUp.val().toUpperCase();
                console.log("Saved email: " + tmpValInEmailSignUp, "Saved password: " + tmpValInPasswordSignUp);
                // Check if the user's email exists already
                if (localStorage.getItem(tmpValInEmailSignUp) === null) {
                    console.log("tmpValInEmailSignUp DOES NOT exist");
                    localStorage.setItem(tmpValInEmailSignUp, tmpValInPasswordSignUp); // Save the email/password in permanent storage
                    console.log("Cookie saved: " + localStorage.getItem(tmpValInEmailSignUp));
                    $elFormSignUp[0].reset(); // Syntax to reset a Form that is referenced via jQuery
                    $("#popSuccessSignUp").popup();
                    $("#popSuccessSignUp").popup("open", { "positionTo": "window", "transition": "flip" });
                } else {
                    console.log("tmpValInEmailSignUp DOES exist!!");
                    $("#popErrorSignUpExists").popup();
                    $("#popErrorSignUpExists").popup("open", { "positionTo": "window", "transition": "flip" });
                } //END If...Else of checking for user existing
            } // END If...Else of checking password match
        } // END fnSignUp()

        // Function to log the User in
        function fnLogIn(event) {
            event.preventDefault();

            var $elInEmailLogIn = $("#inEmailLogIn"),
                $elInPasswordLogIn = $("#inPasswordLogIn"),
                tmpValInEmailLogIn = $elInEmailLogIn.val().toUpperCase(),
                tmpValInPasswordLogIn = $elInPasswordLogIn.val().toUpperCase();

            console.log("Email is: " + tmpValInEmailLogIn, "PWD is: " + tmpValInPasswordLogIn);

            // Check if the attempted email login does not exist (null)
            if (localStorage.getItem(tmpValInEmailLogIn) === null) {
                console.log("This user doesn't exist: " + tmpValInEmailLogIn);
                $("#popLogInNonexistant").popup();
                $("#popLogInNonexistant").popup("open", { "positionTo": "window", "transition": "flip" });
            } else {
                console.log("This user DOES exist: " + tmpValInEmailLogIn);
                // If User exists, check if Password matches existing one
                if (tmpValInPasswordLogIn === localStorage.getItem(tmpValInEmailLogIn)) {
                    console.log("Password MATCH!");
                    // Via JS, change from the current page, to a new page (<section>)
                    $(":mobile-pagecontainer").pagecontainer("change", "#pgHome", { "transition": "flip" });
                    // Write the user's email at the footer of a screen (h4)
                    $elUserEmail.html(tmpValInEmailLogIn.toLowerCase());
                    // Store the email of who last logged in, in localStorage
                    localStorage.setItem("isLoggedIn", tmpValInEmailLogIn);
                    initDB();
                    fnShowComicsPrep();
                } else {
                    console.log("Passwords DO NOT Match!");
                    $("#popLogInIncorrect").popup();
                    $("#popLogInIncorrect").popup("open", { "positionTo": "window", "transition": "flip" });
                    $elInPasswordLogIn.val("");
                } // END If...Else of checking password
            } // END If...Else of checking user existence
        } // END fnLogIn()

        // Function to log out a User. It returns them to pgWelcome and resets the isLoggedIn cookie
        function fnLogOut() {
            $(":mobile-pagecontainer").pagecontainer("change", "#pgWelcome");
            // Reset the localStorage of who has last logged in to empty
            localStorage.setItem("isLoggedIn", "");
        } // END fnLogOut()

        /*
            Function to send the developer an email. Based on the Cordova/PhoneGap Social Sharing plugin
            by Eddy Verbruggen: https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin 
        */
        function fnContact() {
            window.plugins.socialsharing.shareViaEmail(
                "Regarding your app... <br>",                               // Message Body ("String")
                "CBDb Feedback",                                            // Email Subject ("String")
                ["vcampos@school.com"],                                     // To: Emails in Array  of "Strings"
                null,                                                       // CC: Emails in Array of "Strings"
                null,                                                       // BCC: Emails in Array of "Strings"
                "www/images/screen-mdpi-portrait.png",                      // Attachments, in your www folder
                function (success) { console.log("SUCCESS: " + success); }, // Success callback (Function)
                function (failure) { console.log("Fail: " + failure); }     // Failure callback (Function)
            );
        }

        /* *** Event Handlers *** */
        $elFormSignUp.submit(function (event) { fnSignUp(event); }); // Run the fnSignUp() function, and pass the Event Object, so we can preventDefault
        $elFormLogIn.submit(function (event) { fnLogIn(event); });
        $elBtnLogOut.on("click", fnLogOut);
        $elBtnContact.on("click", fnContact);

        /* **** PouchDB Section Start - using http://pouchdb.com **** */
        /* ******************************* */
        // Create a variety of Variables: Forms, Input Elements, Buttons, Divs, a temporary storage for Comics, and the Database (both uninitialized)
        var $elFormSaveComic = $("#formSaveComic"),
            $elDivShowComicsTable = $("#divShowComicsTable"),
            $elBtnDeleteCollection = $("#btnDeleteCollection"),
            $elBtnSaveBarcode = $("#btnSaveBarcode"),
            $elBtnSavePhoto = $("#btnSavePhoto"),
            $elBtnDeleteComic = $("#btnDeleteComic"),
            $elBtnEditComicPrep = $("#btnEditComicPrep"),
            $elBtnEditComicCancel = $("#btnEditComicCancel"),
            $elFormEditComicInfo = $("#formEditComicInfo"),
            tmpComicToDelete,
            db; // Set up Database Variable don't "connect" w/ PouchDB, yet.

        // Function to Initialize the Database whenever we need it.
        function initDB() {
            // Create a variable for the current Database, based on who logged in
            var currentDB = localStorage.getItem("isLoggedIn");
            // Create a new instance of the PouchDB Object (database).
            db = new PouchDB(currentDB);
            // Return the Object to the Global Scope.
            return db;
        } // END initDB()

        // Function to get the first word of the Title of the Comic
        function fnGetFirstWord(str) {
            if (str.indexOf(" ") === -1) {
                // Check if the comic only has a one word Title
                // And then just return it, unprocessed
                return str;
            } else {
                // Or else, it then has multiple words in Title
                // Create a new string (substring), where we remove
                // everything after the first word
                return str.substr(0, str.indexOf(" "));
            }
        } // END fnGetFirstWord()

        // Function to get the data from the fields and prepare it to be saved to PouchDB.
        function fnPrepComic() {
            // Gather the Values of the Input Fields, in Local Scope (temporary) Variables
            var $valInTitle = $("#inTitle").val(),
                $valInNumber = $("#inNumber").val(),
                $valInYear = $("#inYear").val(),
                $valInPublisher = $("#inPublisher").val(),
                $valInComment = $("#inComment").val(),
                $valInBarcode = $("#inBarcode").val(),
                $valInPhoto = $("#inPhoto").val();

            // Temporary versions of the Comic Title
            var tmpID1 = fnGetFirstWord($valInTitle).toUpperCase(),
                tmpID2 = $valInTitle.toUpperCase(),
                tmpID3 = "";

            // Switch Statement to check known possibilities of words to ignore when alphabetizing
            switch (tmpID1) {
                case "THE":
                    //console.log("The comic had THE");
                    // 1st. Strip out "THE" from Title
                    tmpID3 = tmpID2.replace("THE ", "");
                    // 2nd. Only select the first 3 letters of Title
                    tmpID3 = tmpID3.substr(0, 3);
                    break;
                case "A":
                    //console.log("The comic had A");
                    tmpID3 = tmpID2.replace("A ", "");
                    tmpID3 = tmpID3.substr(0, 3);
                    break;
                case "AN":
                    //console.log("The comid had AN");
                    tmpID3 = tmpID2.replace("AN ", "");
                    tmpID3 = tmpID3.substr(0, 3);
                    break;
                default:
                    //console.log("The comic had neither");
                    tmpID3 = tmpID2.substr(0, 3);
                    break;
            }

            // Bundle the data in JSON format for PouchDB, WE MUST HAVE AN _id Field
            // NO COMMENTS in the JSON data (between the {} brackets)
            var comic = {
                "_id":      tmpID3 + $valInNumber,
                "title":    $valInTitle,
                "number":   $valInNumber,
                "year":     $valInYear,
                "publisher":$valInPublisher,
                "comment":  $valInComment,
                "uniqueid": $valInTitle.replace(/\s/g, "").toUpperCase() + $valInNumber + $valInYear,
                "barcode":  $valInBarcode,
                "photo":    $valInPhoto
            };
            // .replace() searches through a String (/) for Whitespace (\s),
            // then replaces all instances (/g) with nothing ("")
            // "The Amazing Spider-Man"  ==> "TheAmazingSpider-Man"
            // Known as a RegEx  (Regular Expression) 

            return comic;
        } // END fnPrepComic()

        // Function to save a Comic to the Database
        function fnSaveComic(event) {
            event.preventDefault();

            // Create a variable of the currently-input Comic, after running fnPrepComic()
            var aComic = fnPrepComic();

            // Display various aspects of the Comic in the Console
            console.log(aComic);
            console.log(aComic._id);

            // PouchDB command (Method) to put the data in the DB
            // Two possiblities to handle in a Callback Function. In our case 'failure' and 'success'
            db.put(aComic, function(failure, success) {
                if (failure) {
                    // Switch statement to deal with possible types of errors in saving (using .put()) the Comic
                    switch (failure.status) {
                        case 409:
                            console.log("ID already exists");

                            // If a Comic's ID already exists, we have to check if it's only the same ID or it is actually the exact same comic
                            db.get(aComic._id, function (failure, success) {
                                if (failure) {
                                    console.log("Can't get the Comic to check if it's a duplicate: " + failure);
                                } else {
                                    console.log("Comic already in the DB: " + success.uniqueid);
                                    console.log("Comic trying to save to the DB: " + aComic.uniqueid);
                                    if (success.uniqueid === aComic.uniqueid) {
                                        // Exact same comic
                                        alert("You already saved this comic!");
                                    } else {
                                        // Different comic, but same ID. So add a Random number to it a the end
                                        var idTmp = aComic._id,
                                            idTmpRandom = Math.round(Math.random() * 99);
                                        aComic._id = idTmp + idTmpRandom;
                                        db.put(aComic);
                                        $("#popSavedComic").popup();
                                        $("#popSavedComic").popup("open", { "positionTo": "open", "transition": "flip" });
                                        $elFormSaveComic[0].reset();
                                        fnShowComicsPrep();
                                    } // END If...Else .put() new ID of conflicting Comic
                                } // END If...Else .get()
                            });
                            $elFormSaveComic[0].reset();
                            break;
                        case 412:
                            console.log("ID is empty");
                            alert("Title & Number CANNOT be empty!");
                            break;
                        default:
                            console.log(failure.status);
                            alert("Unknown error - Contact the developer: help@trashcan.xyz");
                            break;
                    }
                } else {
                    console.log("Comic saved: " + success.ok);
                    $("#popSavedComic").popup();
                    $("#popSavedComic").popup("open", {"positionTo" : "open", "transition" : "flip"});
                    $elFormSaveComic[0].reset();
                    fnShowComicsPrep();
                } // END of If..Else of .put() for saving a new Comic
            }); // END of .put()
        } // END fnSaveComic(event)

        // Function to get all the (raw) Comic data from the Database
        function fnShowComicsPrep() {
            // Get all the Docs (data) from the database (PouchDB)
            // With options (in JSON format) of including all the actual Doc data
            // And alphabetized, ascending (A-Z), too
            db.allDocs({ "include_docs": true, "ascending": true }, function (failure, success) {
                if (failure) {
                    console.log("Failed to get Docs" + failure);
                } else {
                    // Output the raw data from the Db
                    console.log(success.rows);
                    // Output the Title, of the current Doc (the 4th one)
                    //console.log(success.rows[3].doc.title);
                    // Pass the Docs to the function that will create a Table to display the Comics
                    fnShowComicsTable(success.rows);
                }
            });
        } // END fnShowComicsPrep()

        // Function to show the raw Comic data as a nice Table
        function fnShowComicsTable(data) {
            // Create a String that will have the Table markup, as well as the dynamically-loaded data from the Database
            // Note the use of '' (single-quotes) and "" (double quotes) in the String
            var str = "<p><table border='1'>";
            str += "<tr><th>Name</th><th>#</th><th>Info</th></tr>";
            for (var i = 0; i < data.length; i++) {
                /*
                    Create a row with a data-id of the _id of the Comic.
                    Display in a Cell the Title, and # of the Comic.
                    Also, display a "Read More" Icon (&#x1F4AC;).
                */
                str += "<tr data-id='" + data[i].doc._id +
                    "'><td>" + data[i].doc.title +
                    "</td><td>" + data[i].doc.number +
                    "</td><td class='btnShowComicsInfo'>&#x1F4AC;</td></tr>";
            }
            str += "</table></p>";
            $elDivShowComicsTable.html(str); // Write the String to the Div
        } // END fnShowComicsTable(data)

        // Function to display more info about the comic in its own screen (the Publisher, Comment, Photo, etc)
        function fnShowComicsInfo(thisComic) {
            // Store the _id of the Comic in question (which is based on $(this), the currently-clicked row)
            var tmpComic = thisComic.data("id");
            db.get(tmpComic, function (failure, success) {
                if (failure) {
                    console.log("Couldn't show comic info: " + failure);
                } else {
                    console.log("Showing comic info: " + success);
                    // jQuery selector to target the Parent Div (#divShowComicsInfo)
                    // AND the zeroth (1st) Paragraph, to write HTML into it
                    $("#divShowComicsInfo p:eq(0)").html("Name: " + success.title);
                    $("#divShowComicsInfo p:eq(1)").html("Number: " + success.number);
                    $("#divShowComicsInfo p:eq(2)").html("Year: " + success.year);
                    $("#divShowComicsInfo p:eq(3)").html("Publisher: " + success.publisher);
                    $("#divShowComicsInfo p:eq(4)").html("Comment: " + success.comment);
                    $("#divShowComicsInfo p:eq(5)").html("Barcode: " + success.barcode);
                    $("#divShowComicsInfo p:eq(6) img").attr("src", success.photo);

                    // After writing the data to the Div, show the jQuery Mobile screen via code (instead of a User's click)
                    $.mobile.changePage("#popViewComicInfo", {"role" : "dialog"});
                }
            });
            // Set the temporary Comic variable to the current Comic, so we can user it later (like for Editing or Deleting the Comic)
            tmpComicToDelete = tmpComic;
        } // END fnShowComicsInfo(thisComic)

        // Function to delete the current Database and start over
        function fnDeleteCollection() {
            // Using a Switch Statment to ask (using JS confirm() Method) the User's permission to delete the Database
            switch (confirm("You are about to delete your whole collection. \nConfirm?")) {
                case true:
                    // A double confirmation, in case the User didn't realize what they're about to do!
                    if (confirm("Are you sure..?")) {
                        db.destroy(function (failure, success) {
                            if (failure) {
                                console.log("Db deletion failure: " + failure);
                                alert("ERROR \nContact the developer!");
                            } else {
                                console.log("Db deletion SUCCESS: " + success.ok);
                                // After successful Database deletion, initialize a new one, and reset the Table of Comics
                                initDB();
                                fnShowComicsPrep();
                            }
                        });
                    } else {
                        console.log("User changed their mind");
                    }
                    break;
                case false:
                    console.log("User cancelled");
                    break;
                default:
                    console.log("Error - third option selected?");
                    break;
            }
        } // END fnDeleteCollection()

        // Function to scan barcodes via the PhoneGap plugin: https://github.com/phonegap/phonegap-plugin-barcodescanner
        function fnSaveBarcode() {
            // Syntax: .scan(Success callback Function, Failure callback Function, Options in JSON format)
            cordova.plugins.barcodeScanner.scan(
                function (success) {
                    /*alert("We got a barcode\n" +
                        "Success: " + success.text + "\n" +   // Returns the Text of the Barcode
                        "Format: " + success.format + "\n" + // Returns the Format (encoding type) of the Barcode
                        "Cancelled: " + success.cancelled);*/// Returns True/False if the User cancelled the scan
                    // Fill in the Barcode Input Field on-screen
                    $("#inBarcode").val(success.text);
                },
                function (failure) {
                    alert("Scanning failed: " + failure);
                },
                {
                    prompt: "Place a barcode inside the scan area", // Android text to display in the scan screen
                    resultDisplayDuration: 1000, // Android, display scanned text for X ms. 0 suppresses it entirely, default 500
                    orientation: "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
                    disableAnimations: true, // iOS
                    disableSuccessBeep: false // iOS and Android
                }
            );
        } // END fnSaveBarcode()

        // Function to take a photo of the Comic. Basic Cordova plugin: http://cordova.apache.org/docs/en/latest/reference/cordova-plugin-camera/index.html
        function fnSavePhoto() {
            // Syntax: .getPicture(Success callback Function, Failure callback Function, JSON-formated options)
            navigator.camera.getPicture(fnCameraSuccess, fnCameraFailure, {"quality":25, "saveToPhotoAlbum":true, "targetWidth":1024, "targetHeight":768});

            function fnCameraSuccess(data) {
                console.log("Success: " + data);
                // Write the PATH (not the raw photo data) to the photo, to the Input Field on-screen, to be saved to the Database
                $("#inPhoto").val(data);
            }

            function fnCameraFailure(failure) {
                console.log("FAILURE: " + failure);
            }
        } // END fnSavePhoto()

        // Function to delete a Comic
        function fnDeleteComic() {
            console.log("About to DELETE comic " + tmpComicToDelete);
            // First, check that the comic in question (based on tmpComicToDelete) exists
            db.get(tmpComicToDelete, function (failure, success) {
                if (failure) {
                    console.log("Error in trying to get an existing comic: " + failure);
                } else {
                    // Then ask to confirm its deletion
                    switch (confirm("About to delete comic. \nAre you sure?")) {
                        case true:
                            // If they confirm, .remove() it from the Database
                            db.remove(success, function (failure, success) {
                                if (failure) {
                                    console.log("An error in trying to DELETE comic: " + failure);
                                } else {
                                    console.log("Success in deleting comic: " + success.ok);
                                    fnShowComicsPrep(); // Redraw the Table of Comics, with one less Comic
                                    $("#popViewComicInfo").dialog("close"); // Through jQuery, close the current (Delete) Popup screen
                                }
                            }); // END .remove()
                            break;
                        case false:
                            console.log("User changed their mind");
                            break;
                        default:
                            console.log("Third choice error?");
                            break;
                    }
                }
            }); // END .get()
        } // END fnDeleteComic()

        // Function to prepare to edit the Comic in question
        function fnEditComicPrep() {
            console.log("About to edit comic: " + tmpComicToDelete);
            // First, check if the Comic in question (based on tmpComicToDelete) exists
            db.get(tmpComicToDelete, function (failure, success) {
                if (failure) {
                    console.log("Failed to prep Comic Edit: " + failure);
                } else {
                    // Then populate the on-screen Input Fields so the User has a chance to edit them
                    $("#inTitleEdit").val(success.title);
                    $("#inNumberEdit").val(success.number);
                    $("#inYearEdit").val(success.year);
                    $("#inPublisherEdit").val(success.publisher);
                    $("#inCommentEdit").val(success.comment);
                    $("#inBarcodeEdit").val(success.barcode);
                }
            });

            // Then display via jQuery, the Popup screen with the items to edit
            $.mobile.changePage("#popEditComicInfo", { "role": "dialog" });
        } // fnEditComicPrep()

        // Function to close the Popup screen if the User decides to not edit the Comic, after all
        function fnEditComicCancel() {
            $("#popEditComicInfo").dialog("close");
        } // END fnEditComicPrepCancel()

        // Function to edit the Comic, based on the Input Fields in the Popup screen
        function fnEditComicInfo(event) {
            event.preventDefault();

            console.log("Ready to edit: " + tmpComicToDelete);

            // Local Scope Variables of the edited Comic Fields
            var $valInTitleEdit     = $("#inTitleEdit").val(),
                $valInNumberEdit    = $("#inNumberEdit").val(),
                $valInYearEdit      = $("#inYearEdit").val(),
                $valInPublisherEdit = $("#inPublisherEdit").val(),
                $valInCommentEdit   = $("#inCommentEdit").val(),
                $valInBarcodeEdit   = $("#inBarcodeEdit").val();

            // First, check if the Comic in question (based on tmpComicToDelete) exists
            db.get(tmpComicToDelete, function (failure, success) {
                if (failure) {
                    console.log("Failure in getting comic to update: " + failure);
                } else {
                    // If it exists, re-populate the Fields in the Database, in JSON format
                    // NOTE the _rev Field is NECESSARY for updating the Doc
                    db.put({
                        "_id":      success._id,
                        "title":    $valInTitleEdit,
                        "number":   $valInNumberEdit,
                        "year":     $valInYearEdit,
                        "publisher":$valInPublisherEdit,
                        "comment":  $valInCommentEdit,
                        "barcode":  $valInBarcodeEdit,
                        "_rev":     success._rev
                    }, function (failure, success) {
                        if (failure) {
                            console.log("Failure in updating Comic: " + failure);
                        } else {
                            console.log("Success in updating Comic: " + success.ok);

                            // Update the Fields in the Comic info Popup screen
                            $("#divShowComicsInfo p:eq(0)").html("Name: " + $valInTitleEdit);
                            $("#divShowComicsInfo p:eq(1)").html("Number: " + $valInNumberEdit);
                            $("#divShowComicsInfo p:eq(2)").html("Year: " + $valInYearEdit);
                            $("#divShowComicsInfo p:eq(3)").html("Publisher: " + $valInPublisherEdit);
                            $("#divShowComicsInfo p:eq(4)").html("Comment: " + $valInCommentEdit);
                            $("#divShowComicsInfo p:eq(5)").html("Barcode: " + $valInBarcodeEdit);

                            // Close the Edit Comic Popup screen
                            $("#popEditComicInfo").dialog("close");

                            // Redraw the Table of Comics, with changes
                            fnShowComicsPrep();
                        }
                    }); // END .put()
                } // END .get()
            });
        } // END fnEditComicInfo(event)

        /* *** A variety of PouchDB-related Event Handlers *** */
        /* *********************************************** *** */
        // Event Handler for Form submittal, and captures the Event (to prevent default), passed into the function.
        $elFormSaveComic.submit(function (event) { fnSaveComic(event); });

        // Target an HTML element that exists at runtime ($elDivShowComicsTable), 
        // then a dynamic element (.btnShowComicsInfo), to listen for a click
        // then run a function (fnShowComicsInfo), which
        // we pass into it, the jQ object $(this) [literally, THIS object we clicked]
        // refined to the Parent element (the <tr>) with jQ .parent()
        $elDivShowComicsTable.on("click", ".btnShowComicsInfo", function() { fnShowComicsInfo($(this).parent()); });

        // Simpler way to access a Function if it doesn't need a Parameter (no Parentheses). All use the generic "click" Event
        $elBtnDeleteCollection.on("click", fnDeleteCollection);
        $elBtnSaveBarcode.on("click", fnSaveBarcode);
        $elBtnSavePhoto.on("click", fnSavePhoto);
        $elBtnDeleteComic.on("click", fnDeleteComic);
        $elBtnEditComicPrep.on("click", fnEditComicPrep);
        $elBtnEditComicCancel.on("click", fnEditComicCancel);

        // Note the "submit" Event, which we need to capture to .preventDefault()
        $elFormEditComicInfo.on("submit", function (event) { fnEditComicInfo(event); });
        /* **** PouchDB Section END **** */
    } // END onDeviceReady()

    // Function to deal with the User switching apps (away from CBDb)
    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    }

    // Function to deal with the User returning to CBDb, while it's still in memory. Has no effect with the User force-quits the app and returns
    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    }

    // Function to prevent the Android Back Button from working. We only want to user to navigate via our on-screen buttons
    function onBackKeyDown(event) {
        console.log("Back Key was prevented!");
        event.preventDefault();
    }
})();

/*
    Nam:        Victor Campos < vcampos@sdccd.edu>
    Date:       2017-08-20
    Project:    CBDb
    Version:    1.0
    Description:A comic book storing app.Save Title, Number, Year, Barcode, Photo and more.
*/