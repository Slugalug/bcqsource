
function GeocoderApi() {

}

GeocoderApi.prototype = {
    
    sales_export: false,
    payment_type_totals: false,
    store_id: null,
    start_date: null,
    end_date: null,
    selected_customer_name: null,
    customer_names: [],
    username: null,

    getLatLongFromAddress: function(address, callback) {

        var geocoder = new google.maps.Geocoder();
        geocoder.geocode( { 'address': address}, function(results, status) {

            if (status == google.maps.GeocoderStatus.OK) {
                var lat = results[0].geometry.location.lat();
                var lng = results[0].geometry.location.lng();
                callback(lat, lng);
            }
        });
    },

    getIpAndLocation: function(callback) {

        $.ajax({
            url: '//freegeoip.net/json/',
            type: 'POST',
            dataType: 'jsonp',
            success: function(location) {

                callback(location);
            }
        });
    }
};



