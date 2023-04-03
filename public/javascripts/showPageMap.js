mapboxgl.accessToken = mapToken;
// mapToken should be your access token from mapbox.
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v12', // style URL
  center: campground.geometry.coordinates, // starting position [lng, lat]
  zoom: 9, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker({ color: 'red' })
  .setLngLat(campground.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h4>${campground.title}</h4><p style='font-size:0.9rem;'>${campground.location}</p>`
    )
  )
  .addTo(map);
