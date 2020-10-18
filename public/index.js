// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
var config = {
    apiKey: "IzaSyCjNesqizt2nf9a_h9noNk-xWSSC1JfH8c",
    authDomain: "coro-navi-b6efa.firebaseapp.com",
    databaseURL: "https://coro-navi-b6efa.firebaseio.com",
    storageBucket: "coro-navi-b6efa.appspot.com"
};

firebase.initializeApp(config);

function initMap() {

    // Get a reference to the database service
    const map = new google.maps.Map(document.getElementById("map"), {
        center: {
            lat: 47.762354,
            lng: -122.187730
        },
        zoom: 13,
        mapTypeControl: false,
        fullscreenControl: false,
    });


    // const origin = document.getElementById("origin");
    // const destination = document.getElementById("destination");

    /*
    const destAutocomplete = new google.maps.places.Autocomplete(destination);
    const originAutocomplete = new google.maps.places.Autocomplete(origin);

    // Bind the map's bounds (viewport) property to the autocomplete object,
    // so that the autocomplete requests use the current map bounds for the
    // bounds option in the request.
    destAutocomplete.bindTo("bounds", map);
    // Set the data fields to return when the user selects a place.
    destAutocomplete.setFields(["address_components", "geometry", "icon", "name"]);
    originAutocomplete.setFields(["address_components", "geometry", "icon", "name"]);

    const infowindow = new google.maps.InfoWindow();
    const infowindowContent = document.getElementById("infowindow-content");
    infowindow.setContent(infowindowContent);
    const marker = new google.maps.Marker({
      map,
      anchorPoint: new google.maps.Point(0, -29),
    });

    destAutocomplete.addListener("place_changed", () => {
      infowindow.close();
      marker.setVisible(false);
      const place = destAutocomplete.getPlace();

      if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }

      displayInfoTab(destination.value);

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17); // Why 17? Because it looks good.
      }
      marker.setPosition(place.geometry.location);
      marker.setVisible(true);
      let address = "";

      if (place.address_components) {
        address = [
          (place.address_components[0] &&
            place.address_components[0].short_name) ||
            "",
          (place.address_components[1] &&
            place.address_components[1].short_name) ||
            "",
          (place.address_components[2] &&
            place.address_components[2].short_name) ||
            "",
        ].join(" ");
      }
      infowindowContent.children["place-icon"].src = place.icon;
      infowindowContent.children["place-name"].textContent = place.name;
      infowindowContent.children["place-address"].textContent = address;
      infowindow.open(map, marker);

    });*/
    new AutoCompleteDirectionsHandler(map);
}

class AutoCompleteDirectionsHandler {

    constructor(map) {
        this.map = map;
        this.originPlaceId = "";
        this.destinationPlaceId = "";
        this.travelMode = google.maps.TravelMode.DRIVING;
        this.directionsService = new google.maps.DirectionsService();
        this.directionsRenderer = new google.maps.DirectionsRenderer();
        this.directionsRenderer.setMap(map);
        const originInput = document.getElementById("origin");
        const destinationInput = document.getElementById("destination");
        const originAutocomplete = new google.maps.places.Autocomplete(originInput);

        // Specify just the place data fields that you need.
        originAutocomplete.setFields(["place_id"]);
        const destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput);
        destinationAutocomplete.setFields(["place_id"])
        this.setupPlaceChangedListener(originAutocomplete, "ORIG");

        this.setupPlaceChangedListener(destinationAutocomplete, "DEST");

        const card = document.getElementById("pac-card");

        map.controls[google.maps.ControlPosition.TOP_CENTER].push(card);
    }

    setupPlaceChangedListener(autocomplete, mode) {
        autocomplete.bindTo("bounds", this.map);
        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();

            if (!place.place_id) {
                window.alert("Please select an option from the dropdown list.");
                return;
            }

            if (mode === "ORIG") {
                this.originPlaceId = place.place_id;
            } else {
                this.destinationPlaceId = place.place_id;
            }
            this.route();
        });
    }
    route() {
        if (!this.originPlaceId || !this.destinationPlaceId) {
            return;
        }
        const me = this;
        this.directionsService.route({
                origin: {
                    placeId: this.originPlaceId
                },
                destination: {
                    placeId: this.destinationPlaceId
                },
                travelMode: this.travelMode,
            },
            (response, status) => {
                if (status === "OK") {
                    me.directionsRenderer.setDirections(response);
                    displayInfoTab(document.getElementById("destination").value);
                } else {
                    window.alert("Directions request failed due to " + status);
                }
            }
        );
    }

}

function displayInfoTab(address) {
    var address_components = address.split(",")
    var city = String(address_components[1])
    var state = String(address_components[2]).trim();
    console.log("State:" + state);

    firebase.database().ref('/states/' + state).once('value').then(function(snapshot) {
        // var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
        // ...
        console.log("Snapshot" + snapshot.val());
        console.log(Object.keys(snapshot.val()));

        const cityHeader = document.getElementById("state-identifier").innerHTML = city + ", " + state;
        var info = snapshot.val()["Quarantine"];
        var info_list = info.split(",");
        console.log(info_list);

        var quarantineList = document.createElement('ul');
        quarantineList.id = "quarantine-ul";
        info_list.forEach(function(content) {
            console.log("Adding elem");
            var li = document.createElement('li');
            li.textContent = content;
            quarantineList.appendChild(li);
        })
        const quarantineSection = document.getElementById("quarantine-info")
        quarantineSection.appendChild(quarantineList);
        const textContainer = document.getElementById("text-container");
        textContainer.style.display = "block";
        console.log(textContainer.style.display);

        var testingCenters = snapshot.val()["TestingCenters"];
        var testingCentersList = testingCenters.split(",");
        const testingHeader = document.createElement("h4");
        testingHeader.innerHTML = "Closest Test Centers";
        quarantineSection.appendChild(testingHeader);
        var testingList = document.createElement('ul');
        testingCentersList.forEach(function(content) {
            console.log("Adding elem");
            var li = document.createElement('li');
            li.textContent = content;
            testingList.appendChild(li);
        });
        quarantineSection.appendChild(testingList);
    });

    fetchText();
}

async function fetchText() {
    let response = await fetch('https://covid-19-testing.github.io/locations/new-york/complete.json?fbclid=IwAR1TgM3cW2Asq6279wq5Zk7XcxNAHf32fAaUEdfwie0CU08DYhF1Peq7UWs');
    let data = await response.text();
    console.log(data);
}

document.getElementById("close-button").addEventListener("click", function() {
    document.getElementById("text-container").style.display = 'none';
    document.getElementById("quarantine-ul").remove();
});