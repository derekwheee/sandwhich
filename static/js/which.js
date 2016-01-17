var Which = function () {

    var controller = $('body').data('controller');

    this.$template = $('.main > .template');

    this[controller]();

};

Which.prototype.home = function () {

    var _this = this;

    $('form').submit(function () {

        _this.replaceTemplate(templates.geocoding);

        _this.geoLocate($(this).serializeArray(), function (lat, lng) {

            _this.replaceTemplate(templates.gettingVenues);

            $.get('/which', { latitude : lat, longitude : lng }, function (data) {
                var parsed = _.compact(_.map(JSON.parse(data).venues, function (venue) {
                    if ('menus' in venue) return venue;
                }));

                _this.getWhich(parsed);
            });

        });

        return false;

    });

};

Which.prototype.replaceTemplate = function (template, context) {

    this.$template
        .fadeOut(function () {
            $(this).html(template(context))
                .fadeIn();
        });

};

Which.prototype.geoLocate = function (data, cb) {

    var geocoder = new google.maps.Geocoder();

    var options = {
        address : getAddressPart(data, 'address') +
            getAddressPart(data, 'city') +
            getAddressPart(data, 'state') +
            getAddressPart(data, 'zip')
    };

    geocoder.geocode(options, function (results, status) {

        if (results && results.length) {
            cb(results[0].geometry.location.lat(), results[0].geometry.location.lng());
        }

    });

    function getAddressPart(array, part) {
        return array.filter(function(obj) {
            return obj.name == part;
        })[0].value;
    }

};

Which.prototype.getWhich = function (parsed) {

    this.replaceTemplate(templates.which, { venues : parsed });

};

$(function () {

    which = new Which();

});
