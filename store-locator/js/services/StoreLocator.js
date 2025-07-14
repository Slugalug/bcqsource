
function StoreLocator() {

}

StoreLocator.prototype = {
    
    getStoresByLatLng: function(store_id, lat, lng, radius, callback) {

        $.blockUI({});
        $.getJSON("/public/api/storelocator.service.php?storeid=" + store_id + "&radius=" + radius + "&lat=" + lat + "&lng=" + lng)
        .done(function( data ) {

            callback(data.stores);
            $.unblockUI({});
        })
        .fail(function() {
            $.unblockUI();
        })
        .always(function() {
            $.unblockUI();
        });
    },

    getAllStores: function(store_id, callback) {

        $.blockUI({});
        $.getJSON("/public/api/storelocator.service.php?storeid=" + store_id + "&all=1")
        .done(function( data ) {

            callback(data.stores);
            $.unblockUI({});
        })
        .fail(function() {
            $.unblockUI();
        })
        .always(function() {
            $.unblockUI();
        });
    }
};



