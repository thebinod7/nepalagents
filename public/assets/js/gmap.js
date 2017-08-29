google.maps.event.addDomListener(window, 'load', function () {
    var places = new google.maps.places.Autocomplete(document.getElementById('location'));
    google.maps.event.addListener(places, 'place_changed', function () {
        var place = places.getPlace();
     //   var address = place.formatted_address;
        var latitude = place.geometry.location.lat();
        var longitude = place.geometry.location.lng();
        $('#lat').val(latitude);
        $('#long').val(longitude);
        console.log(latitude,longitude);
        var mapOptions = {
             center: new google.maps.LatLng(latitude, longitude),
             zoom: 20,
             mapTypeId: google.maps.MapTypeId.MAP
         }
       var map = new google.maps.Map(document.getElementById("googleMap"), mapOptions);
    });
});
