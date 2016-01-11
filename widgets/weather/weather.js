var icons = {
  'clear-day': 'day-sunny',
  'clear-night': 'night-clear',
  'rain': 'rain',
  'snow': 'snow',
  'sleet': 'sleet',
  'wind': 'strong-wind',
  'fog': 'fog',
  'cloudy': 'cloudy',
  'partly-cloudy-day': 'day-cloudy',
  'partly-cloudy-night': 'night-cloudy',
  'hail': 'hail',
  'thunderstorm': 'thunderstorm',
  'tornado': 'tornado'
};

/**
 * Collections.
 */

Loc = new Mongo.Collection("location");
Weather = new Mongo.Collection("weather");

/**
 * Client.
 */

if (Meteor.isClient) {

  // Grab lat and lng from client, only once upon load.
  Tracker.autorun(function(computation) {
    if (Geolocation.latLng()) {
      computation.stop();
      Loc.insert(Geolocation.latLng());
      Meteor.call('weatherStart');
    }
  });

  // When Weather updates, send update to template.
  Template.weather.helpers({
    min: function() {
      return Weather.findOne().minTemp;
    },
    max: function() {
      return Weather.findOne().maxTemp;
    },
    icon: function() {
      return icons[Weather.findOne().icon];

    },
    summary: function() {
      return Weather.findOne().summary;
    },
    temp: function() {
      return Weather.findOne().temp;
    }

  });
}

/**
 * Server.
 */

if (Meteor.isServer) {

  Meteor.startup(function() {
    Loc.remove({});
  });

  Meteor.methods({
    weatherStart: function() {
      forecast();
      SyncedCron.start();
    }
  });
}

// Every hour, ping forecast, save it.
function forecast() {
  var location = Loc.find().fetch()[0];
  var apiKey = '05013bdb0c1a01f538109d2bd5aebf8d';
  var get = Meteor.wrapAsync(HTTP.get);
  var res = get('https://api.forecast.io/forecast/' + apiKey + '/' + location.lat + ',' + location.lng + '?units=si');
  var content = JSON.parse(res.content);

  // Parse the result.
  var weather = {
    icon: content.hourly.data[0].icon,
    minTemp: Math.round(content.daily.data[0].temperatureMin),
    maxTemp: Math.round(content.daily.data[0].temperatureMax),
    summary: content.daily.data[0].summary,
    temp: Math.round(content.hourly.data[0].temperature)
  };

  // Save to Collection.
  Weather.remove({});
  Weather.insert(weather);
}

/**
 * Cronjob.
 */

SyncedCron.add({
  name: 'Get forecast',
  schedule: function(parser) {
    return parser.cron('0 0/1 1/1 * ? *');
  },
  job: forecast
});
