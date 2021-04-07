var selected;
var shapes=[];
var map;
var drawingManager;

function addSearchBox()
{
  
  const input = document.getElementById("pac-input");
  const searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  // Bias the SearchBox results towards current map's viewport.
  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });
  let markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener("places_changed", () => {
    const places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }
    markers = [];
    // For each place, get the icon, name and location.
    const bounds = new google.maps.LatLngBounds();
    places.forEach((place) => {
      if (!place.geometry || !place.geometry.location) {
        console.log("Returned place contains no geometry");
        return;
      }
      // Create a marker for each place.
      markers.push(
        new google.maps.Marker({
          map,
          title: place.name,
          position: place.geometry.location,
        })
      );

	selected=place.geometry.location;
      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
	bounds_=new google.maps.LatLngBounds();
  });
}
function initMap() {
  document.getElementById("right-panel").style.display = "none";

  alert('Please select a center location by typing the name in the textbox');
  document.getElementById("pac-input").focus();

	map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    mapTypeId: "roadmap",
  });
  addSearchBox();
}
/*
Button 1 function
*/
function RandomLocation()
{
  document.getElementById("right-panel").style.display = "none";
  map.setZoom(7);
	var random = new google.maps.LatLng( (Math.random()*(85*2)-85), (Math.random()*(180*2)-180) );
	marker = new google.maps.Marker({
		map: map,
		position:random,	
		animation:google.maps.Animation.DROP,
		icon: {
		  url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
		}
	});
	
    marker.setVisible(true);
	map.setCenter(random);
  marker.addListener("click", () => {
	var random2=google.maps.geometry.spherical.computeOffset(random,200000,45);
	
	mk = new google.maps.Marker({
		map: map,
		position:random2,	
		animation:google.maps.Animation.DROP,
		icon: {
		  url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
		}
	});
	map.setCenter(mk.getPosition());
  });
 
}

/*
Button 2 function
*/
function DrawCircles()
{
  document.getElementById("right-panel").style.display = "none";
  if(!selected)
  {
    alert('Please select a center location by typing the name in the searchbox, then click the Button2 again');
    document.getElementById("pac-input").focus();
    return;
  }  
  while(shapes[0])
  {
    shapes.pop().setMap(null);
  }
	var donut = new google.maps.Polygon({
                 paths: [circlePath(selected,200000,360),
                         circlePath(selected, 100000,360).reverse()],
                 strokeColor: "#0000FF",
                 strokeOpacity: 0.8,
                 strokeWeight: 1,
                 fillColor: "#008000",
                 fillOpacity: 0.30
     });
  donut.setMap(map);
  shapes.push(donut); 
	const outCircle = new google.maps.Circle({
       fillOpacity: 0.0,strokeOpacity: 0.0,
      map,
      center:selected,
      radius: 200000,
    });
	const inCircle = new google.maps.Circle({
       fillOpacity: 0.0,strokeOpacity: 0.0,
      map,
      center: selected,
      radius: 100000,
    });
     var sw = outCircle.getBounds().getSouthWest();
  var ne = outCircle.getBounds().getNorthEast();
  var PointFound=false;
  while(!PointFound) {
    var ptLat = Math.random() * (ne.lat() - sw.lat()) + sw.lat();
    var ptLng = Math.random() * (ne.lng() - sw.lng()) + sw.lng();
    var point = new google.maps.LatLng(ptLat, ptLng);
    var distance2Point=google.maps.geometry.spherical.computeDistanceBetween(point, outCircle.getCenter());
    
    PointFound=(distance2Point < outCircle.getRadius() && distance2Point > inCircle.getRadius());
    if(PointFound)
    {
      var mark_=new google.maps.Marker({
        position: point,
        map: map
      });
      shapes.push(mark_);
    }
  }
	 
	map.setCenter(selected);
	 map.setZoom(7);
}


function circlePath(center,radius,points)
{
        var a=[],p=360/points,d=0;	
        for(var i=0;i<points;++i,d+=p){
            a.push(google.maps.geometry.spherical.computeOffset(center,radius,d));
        }
        return a;
}

/*
Button 3 function
*/
function drawCountry()
{
  document.getElementById("right-panel").style.display = "none";
  map.data.setStyle({
    fillColor: 'green',
    fillOpacity:0.1,
    strokeWeight: 1
  });
  var maxLonPoint,maxLatPoint,minLonPoint,minLatPoint;
  var maxLon=-180;
  var minLon=180;
  var maxLat=-85;
  var minLat=85;
  map.data.loadGeoJson("custom.geo.json", null, function () {
    var egyptbounds = new google.maps.LatLngBounds();
    map.data.forEach(function(feature) {
        var geo = feature.getGeometry();
        geo.forEachLatLng(function(LatLng) {
          egyptbounds.extend(LatLng);
          if(LatLng.lat()>maxLat)
          {
            maxLat=LatLng.lat();
            maxLatPoint=LatLng;
          }
          if(LatLng.lat()<minLat)
          {
            minLat=LatLng.lat();
            minLatPoint=LatLng;
          }
          if(LatLng.lng()>maxLon)
          {
            maxLon=LatLng.lng();
            maxLonPoint=LatLng;
          }
          if(LatLng.lng()<minLon)
          {
            minLon=LatLng.lng();
            minLonPoint=LatLng;
          }

        });

    });
    // fit data to bounds
    map.fitBounds(egyptbounds);

    new google.maps.Marker({
      position: maxLatPoint,
      map: map,
      animation:google.maps.Animation.DROP,
      title:'Maximum latitude point in Egypt ('+maxLat+')'
    });
    new google.maps.Marker({
      position: minLatPoint,
      map: map,
      animation:google.maps.Animation.DROP,
      title:'Minimum latitude point in Egypt ('+minLat+')'
    });
    
    new google.maps.Marker({
      position: maxLonPoint,
      map: map,
      animation:google.maps.Animation.DROP,
      title:'Maximum longitude point in Egypt ('+maxLon+')'
    });
    new google.maps.Marker({
      position: minLonPoint,
      map: map,
      animation:google.maps.Animation.DROP,
      title:'Minimum longitude point in Egypt ('+minLon+')'
    });
    


});
 
}


/*
Button 4 function
*/
function RandomLocation1()
{  
  document.getElementById("right-panel").style.display = "none";
	var random = new google.maps.LatLng( (Math.random()*(85*2)-84), (Math.random()*(180*2)-189) );
  var title="";
  var markers1=[];
  var iWins=[];
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({ location: random }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
          title=results[0].formatted_address;
          var markerr=new google.maps.Marker({
            map: map,
            position:random,	
            animation:google.maps.Animation.DROP,
            title:title
          });
          markerr.setVisible(true);                  
          markerr.addListener("click", () => {
            infowindow.open(map, markerr);
          });
          var infowindow = new google.maps.InfoWindow({
            content: getInfoWin(title),
          });
          infowindow.open(map, markerr);
          for(var i=1;i<8;i++)
          {
            var d=i>4?(i*90*Math.random()):i*90;
            var ico=i>4?'orange-dot':'blue-dot';
            var cardinals=google.maps.geometry.spherical.computeOffset(random,50000,d);
            //;    
            markers1.push(new google.maps.Marker({
              map: map,
              position:cardinals,	
              animation:google.maps.Animation.DROP,
              icon: {url: "http://maps.google.com/mapfiles/ms/icons/"+ico+".png"}
            }));
            iWins.push(new google.maps.InfoWindow({
                content: getInfoWin(""),
            }));                              
            markers1[i-1].addListener("click", () => {
              iWins[i-1].open(map, markers1[i-1]);
            });
            iWins[i-1].open(map, markers1[i-1]);

          }
          var cir=new google.maps.Circle({
            fillOpacity: 0.0,strokeOpacity: 0.35,
           map,
           center: random,
           radius: 50000,
         });

      }
      else
      RandomLocation1();//alert('The random location selected location can not be geocoded' );
  });  
  
	map.setCenter(random);
	map.setZoom(9);
 
 
}
function getInfoWin(location)
{
  var country="",place="",contentString="";
  var notLand=location.indexOf(",")<1;
  if(!notLand)
  {
    var p=location.split(',');
    country=p.pop();
    place=p.join(',');
  }
  else
  {
    place=location;
    country=location;
  }
  if(location.length<1)
  {
    contentString =
    '<div id="content">' +
    '<div id="siteNotice">' +
    "</div>" +
    '<h1 id="firstHeading" class="firstHeading">Random Location</h1>' +
    '<div id="bodyContent">' +
    "<p>This is a randomly selected<br/> location that has been <br/>added to the circle!.</p>" +
    "</div>" +
    "</div>";
  
  }
  else
  contentString =
    '<div id="content">' +
    '<div id="siteNotice">' +
    "</div>" +
    '<h1 id="firstHeading" class="firstHeading">'+country+'</h1>' +
    '<div id="bodyContent">' +
    "<p>This is a randomly selected location called "+ place +".</p>" +
    "</div>" +
    "</div>";
  
    return contentString;
}


/*
Button 5 function
*/
function drawShapes()
{  
  document.getElementById("right-panel").style.display = "none";
  if(!drawingManager)
  {
    drawingManager = new google.maps.drawing.DrawingManager({
      drawingControlOptions: {    
        drawingModes: ['polygon']
      },
      polygonOptions: {
        fillColor: "#ffff00",
        fillOpacity: 0.35,
        strokeWeight: 2,
        strokeColor:"#ff0000",
      },
    });
    drawingManager.setMap(map);
    google.maps.event.addListener(drawingManager, 'overlaycomplete', function (e) {
      var newShape = e.overlay;      
      newShape.type = e.type;      
      if (e.type !== google.maps.drawing.OverlayType.MARKER) {
          // Switch back to non-drawing mode after drawing a shape.
          drawingManager.setDrawingMode(null);
  
          // Add an event listener that selects the newly-drawn shape when the user
          // mouses down on it.
          google.maps.event.addListener(newShape, 'mouseover', function () {
              newShape.set('fillColor', '#ff0000');
              newShape.set('strokeColor', '#ffff00');
              add10Markers(newShape.customBounds().getNorthEast(),newShape.customBounds().getSouthWest(),
              newShape,newShape.customBounds().getCenter());
          });
  
          google.maps.event.addListener(newShape, 'mouseout', function () {
            newShape.set('fillColor', '#ffff00');
            newShape.set('strokeColor', '#ff0000');
            
          });
      }
  
  
  
  });
    google.maps.Polygon.prototype.customBounds=function(){
      var b_ = new google.maps.LatLngBounds()
      this.getPath().forEach(function(element){b_.extend(element)})
      return b_
    }
  }// end of if statement....
}

function add10Markers(ne,sw,newShape,cc)
{
  var theangle=google.maps.geometry.spherical.computeDistanceBetween(ne, sw);
  for(var j=0;j<10;j++)
  {
    var PointFound=false;
    while(!PointFound) {
      var ptLat = Math.random() * (ne.lat() - sw.lat()) + sw.lat();
      var ptLng = Math.random() * (ne.lng() - sw.lng()) + sw.lng();
      var point = new google.maps.LatLng(ptLat, ptLng);
      if(google.maps.geometry.poly.containsLocation(point,newShape))continue;      
      PointFound=google.maps.geometry.spherical.computeDistanceBetween(cc, point)<theangle;
      if(PointFound)
      {
        var mark_=new google.maps.Marker({
          position: point,
          map: map
        });
      }
    }
  }
	
}

/*
Button 6 function
*/

function ViewDirections()
{
  document.getElementById("right-panel").style.display = "block";
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);
  document.getElementById("submit").addEventListener("click", () => {
    calculateAndDisplayRoute(directionsService, directionsRenderer);
  });

}


function calculateAndDisplayRoute(directionsService, directionsRenderer) {
  const waypts = [];
  const checkboxArray = document.getElementById("waypoints");

  for (let i = 0; i < checkboxArray.length; i++) {
    if (checkboxArray.options[i].selected) {
      waypts.push({
        location: checkboxArray[i].value,
        stopover: true,
      });
    }
  }
  directionsService.route(
    {
      origin: document.getElementById("start").value,
      destination: document.getElementById("end").value,
      waypoints: waypts,
  		provideRouteAlternatives: true,
      optimizeWaypoints: false,
      travelMode: google.maps.TravelMode.WALKING,
    },
    (response, status) => {
      if (status === "OK" && response) {
        directionsRenderer.setDirections(response);
        console.log(response.routes.length);
        const summaryPanel = document.getElementById("directions-panel");
        summaryPanel.innerHTML = "";
for (let j = 0; j < response.routes.length; j++) {
        // For each route, display summary information.
        const route = response.routes[j];
        for (let i = 0; i < route.legs.length; i++) {
          const routeSegment = i + 1+j;
          summaryPanel.innerHTML +=
            "<b>Route Segment: " + routeSegment + "</b><br>";
          summaryPanel.innerHTML += route.legs[i].start_address + " to ";
          summaryPanel.innerHTML += route.legs[i].end_address + "<br>";
          summaryPanel.innerHTML += route.legs[i].distance.text + "<br><br>";
        }
        }
      } else {
        window.alert("Directions request failed due to " + status);
      }
    }
  );
}



	