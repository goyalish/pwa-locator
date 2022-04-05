var map;
let token = "pk.eyJ1IjoicmFiaWE2MjEiLCJhIjoiY2wxa2NyNXFvMHplajNlcGJpN2RndDE1YyJ9.JPZwuNdbIXFa8Ct94EmZ7w";
let markers = [];
let markersDetails = [];
const onMapClick = (e) => {
  showPrompt(e);
}

const saveState = async () => {
  console.log('saving state:', markersDetails);

  try {
    await localforage.setItem('state', markersDetails);
  } catch (e) {
    return console.log('error', e);
  }

  console.log('saveState success');
}

const loadState = async () => {
  console.log('loading state');

  try {
    const newState = await localforage.getItem('state');
    if (newState && Object.keys(newState).length !== 0) {
      markersDetails = [...newState];
    }
    markersDetails.forEach(element => {

      var marker = L.marker([element.lat, element.lng])
      var popup = L.popup()
        .setContent(`<p>${element.title}<br/> <button onclick="deleteMarker('${element.lat}', '${element.lng}')">Delete</button> </p>`)

      marker.addTo(map)
      marker.bindPopup(popup)
      marker.openPopup();
      markers.push(marker);
    });
    console.log("" + JSON.stringify(markersDetails));
    console.log('loadState success');
  } catch (e) {
    console.log('error loading state', e);
  }
}


document.addEventListener("init", (e) => {
  if (e.target.id === "home") {
    map = L.map('map').setView([51.505, -0.09], 13);

    let token = "pk.eyJ1Ijoibml0ZXNoMjA2MCIsImEiOiJjbDFrYmttY3gyYzNjM2NwY3M3dTM4bTR5In0.EyJwBiNZuOFs_YSR18umGQ";
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + token, {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: token
    }).addTo(map);

    map.on('click', onMapClick);

    document.querySelector('#locateMe').addEventListener('click', (e) => {
      map.locate({ setView: true, maxZoom: 16 });
    });

    document.querySelector('#removeMarkers').addEventListener('click', (e) => {
      markers.forEach(element => {
        map.removeLayer(element);
      });
      markers = [];
      markersDetails = [];
      saveState();
    });
  }
  loadState();
});

function deleteMarker(lat, lng) {
  console.log("deleteMarker:   " + lat + " " + lng);
  let matchedMarker = markers.find(element => element._latlng.lat == lat && element._latlng.lng == lng);
  if (matchedMarker) {
    map.removeLayer(matchedMarker);
    let index = markers.indexOf(matchedMarker)
    if (index > -1) {
      markers.splice(index, 1);
    }
  }

  let markerObj = markersDetails.find(element => element.lat == lat && element.lng == lng);
  if (markerObj) {
    let index = markersDetails.indexOf(markerObj)
    if (index > -1) {
      markersDetails.splice(index, 1);
    }
  }
  saveState();
}

var showPrompt = function (mapClick) {
  ons.notification.prompt('Prompt!')
    .then(function (input) {
      if (input) {
        var marker = L.marker([mapClick.latlng.lat, mapClick.latlng.lng])
        var popup = L.popup()
          .setContent(`<p>${input}<br/> <button onclick="deleteMarker('${mapClick.latlng.lat}', '${mapClick.latlng.lng}')">Delete</button> </p>`)

        marker.addTo(map)
        marker.bindPopup(popup)
        marker.openPopup();
        markers.push(marker);

        var markerObj = {
          lat: mapClick.latlng.lat,
          lng: mapClick.latlng.lng,
          title: input
        };

        markersDetails.push(markerObj);
        saveState();
      }
    });
};



const popPage = () => navigator.popPage();
// Padd the history with an extra page so that we don't exit right away
window.addEventListener('load', () => window.history.pushState({}, ''));
// When the browser goes back a page, if our navigator has more than one page we pop the page and prevent the back event by adding a new page
// Otherwise we trigger a second back event, because we padded the history we need to go back twice to exit the app.
window.addEventListener('popstate', () => {
  const { pages } = navigator;
  if (pages && pages.length > 1) {
    popPage();
    window.history.pushState({}, '');
  } else {
    window.history.back();
  }
});
