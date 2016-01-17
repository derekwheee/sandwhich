var Which = function () {

    var controller = $('body').data('controller');

    this.$template = $('.main > .template');

    this[controller]();

};

Which.prototype.home = function () {

    var _this = this;

    if ("geolocation" in navigator) {
        this.geoLocate();
    }

    if (window.location.hash) {
        this.searchVenues(window.location.hash.substring(1).split(','));
    }

    $('form').submit(function () {

        _this.replaceTemplate(templates.geocoding);

        _this.geocode($(this).serializeArray(), function (lat, lng) {

            _this.searchVenues([lat, lng]);

        });

        return false;

    });

};

Which.prototype.searchVenues = function (latlng) {

    var _this = this;
    var options;
    var radius;

    if (!latlng) {
        this.replaceTemplate(templates.nope);
        return false;
    }

    if (latlng.length === 3) {
        radius = latlng[2];
    } else {
        radius = !$('form').length ? 200 : $('form').serializeArray().filter(function(obj) {
            return obj.name == 'radius';
        })[0].value;
    }

    options = {
        latitude : latlng[0],
        longitude : latlng[1],
        radius : radius
    };

    this.replaceTemplate(templates.gettingVenues);

    window.location.hash = options.latitude + ',' + options.longitude + ',' + options.radius;

    $.get('/which', options, function (data) {

        var parsed = _.compact(_.map(JSON.parse(data).venues, function (venue) {
            if ('menus' in venue) return venue;
        }));

        _this.getWhich(parsed);
    });

};

Which.prototype.replaceTemplate = function (template, context) {

    this.$template
        .fadeOut(function () {
            $(this).html(template(context))
                .fadeIn();
        });

};

Which.prototype.geoLocate = function () {

    var $form = $('.search-form');
    var geocoder = new google.maps.Geocoder();

    navigator.geolocation.getCurrentPosition(function(position) {

        var options = {
            location : {
                lat : position.coords.latitude,
                lng : position.coords.longitude
            }
        };

        geocoder.geocode(options, function (results, status) {

            var address = results[0].address_components;

            if ($form.find('#address').val()) return;

            $form.find('#address').val(address[0].long_name + ' ' + address[1].long_name);
            $form.find('#city').val(address[2].long_name);
            $form.find('#state').val(address[6].short_name);

        });

    });

};

Which.prototype.geocode = function (data, cb) {

    var geocoder = new google.maps.Geocoder();

    var options = {
        address : getAddressPart(data, 'address') + ' ' +
            getAddressPart(data, 'city') + ' ' +
            getAddressPart(data, 'state')
    };

    geocoder.geocode(options, function (results, status) {

        if (results && results.length) {
            cb(results[0].geometry.location.lat(), results[0].geometry.location.lng());
        } else {
            cb();
        }

    });

    function getAddressPart(array, part) {
        return array.filter(function(obj) {
            return obj.name == part;
        })[0].value;
    }

};

Which.prototype.getWhich = function (parsed) {

    if (!parsed || !parsed.length) {
        this.replaceTemplate(templates.nope);
        return;
    }

    try {
        var context = getRandomMenuItem();
        this.replaceTemplate(templates.which, context);
    } catch (err) {
        this.replaceTemplate(templates.nope);
    }

    function getRandomMenuItem (attempt) {

        if (attempt && attempt > 10) {
            throw new Error('Could\'t find anything to eat');
        }

        var venueIndex = Math.floor(Math.random() * (parsed.length - 1));
        var menuIndex = Math.floor(Math.random() * (parsed[venueIndex].menus.length - 1));
        var sectionIndex = Math.floor(Math.random() * (parsed[venueIndex].menus[menuIndex].sections.length - 1));
        var subSectionIndex = Math.floor(Math.random() * (parsed[venueIndex].menus[menuIndex].sections[sectionIndex].subsections.length - 1));
        var contents = _.compact(_.map(parsed[venueIndex].menus[menuIndex].sections[sectionIndex].subsections[subSectionIndex].contents), function (content) {
            if ('name' in content) return content;
        });
        var contentsIndex = Math.floor(Math.random() * (contents.length - 1));

        attempt = attempt || 1;

        if (!contents[contentsIndex].name) {
            return getRandomMenuItem(attempt + 1);
        }

        return {
            venue: parsed[venueIndex],
            which: contents[contentsIndex]
        };
    }

};

$(function () {

    which = new Which();

});
