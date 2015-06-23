var GooglePlaces = require('googleplaces');
var chalk = require('chalk');

require('dotenv').load();

var googlePlaces = new GooglePlaces(process.env.GOOGLE_PLACES_API_KEY, process.env.GOOGLE_PLACES_OUTPUT_FORMAT);
var parameters;

parameters = {
    location: [43.6576410,-70.2542480],
    radius: 100,
    openNow: true,
    minPriceLevel: 0,
    maxPriceLevel: 4,
    types: ['bar', 'restaurant', 'cafe', 'food', 'meal_delivery', 'meal_takeaway']
};
googlePlaces.placeSearch(parameters, function (error, response) {
    if (error) {
        console.log(chalk.red.bold(error));
    }
    response.results.forEach(function (el) {
        googlePlaces.placeDetailsRequest({reference: el.reference}, function (error, response) {
            if (error) throw error;
            console.log(chalk.green(response.result.name));
            console.log(chalk.cyan(response.result.website));
        });
    });
});
