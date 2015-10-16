/* global ko */

ko.bindingHandlers.enterkey = {
    init: function(element, valueAccesor, allBindings, viewModel) {
        var callback = valueAccesor();
        $(element).keypress(function(event) {
            var keyCode = event.which;
            if (keyCode === 13) {
                callback.call(viewModel);
            }
        });
    }
};

$(function() {
    function WeatherData() {
        var self = this;

        self.city = ko.observable("");
        self.country = ko.observable("");
        self.currentTemperature = ko.observable(0);
        self.minTemperature = ko.observable(0);
        self.maxTemperature = ko.observable(0);
        self.windSpeed = ko.observable(0);
        self.pressure = ko.observable(0);
        self.humidity = ko.observable(0);
        self.cloudiness = ko.observable();
        self.latitude = ko.observable(0);
        self.longitude = ko.observable(0);
        self.description = ko.observable("");
        self.iconName = ko.observable("");

        self.formattedCurrentTemperature = ko.pureComputed(function() {
            return self.formatTemperature(self.currentTemperature());
        });

        self.formattedLocation = ko.pureComputed(function() {
            return self.city() + ", " + self.country();
        });

        self.formattedWeatherData = ko.pureComputed(function() {
            var temperatureRange = "min " + self.formatTemperature(self.minTemperature()) + " max " + self.formatTemperature(self.maxTemperature());
            var wind = "wind " + self.windSpeed() + "m/s";
            var cloudiness = "clouds " + self.cloudiness() + "%";
            var pressure = "pressure " + self.pressure() + " hpa";
            var humidity = "humidity " + self.humidity() + "%";

            return temperatureRange + ", " + wind + ", " + cloudiness + ", " + pressure + ", " + humidity;
        });

        self.formattedGeoCoords = ko.pureComputed(function() {
            return "[" + self.latitude() + ", " + self.longitude() + "]";
        });

        self.iconUrl = ko.pureComputed(function() {
            return "http://openweathermap.org/img/w/" + self.iconName() + ".png";
        });

        self.countryIconUrl = ko.pureComputed(function() {
            return "http://openweathermap.org/images/flags/" + self.country().toLowerCase() + ".png";
        });

        self.formatTemperature = function(temperature) {
            return temperature + "\xB0C";
        };
    }

    function WeatherViewModel() {
        var self = this;

        self.baseUrl = "http://api.openweathermap.org/data/2.5/weather";
        self.apiKey = "bd82977b86bf27fb59a04b61b657fb6f";
        self.weatherData = new WeatherData();
        self.showWeatherData = ko.observable(false);
        self.isLoadingWeatherData = ko.observable(false);
        self.errorMessage = ko.observable("");
        self.location = ko.observable("");

        self.updateCurrentWeather = function(weatherData) {
            if (weatherData.hasOwnProperty("sys")) {
                self.weatherData.city(weatherData.name);
                self.weatherData.country(weatherData.sys.country);
                self.weatherData.currentTemperature(weatherData.main.temp);
                self.weatherData.minTemperature(weatherData.main.temp_min);
                self.weatherData.maxTemperature(weatherData.main.temp_max);
                self.weatherData.windSpeed(weatherData.wind.speed);
                self.weatherData.pressure(weatherData.main.pressure);
                self.weatherData.humidity(weatherData.main.humidity);
                self.weatherData.cloudiness(weatherData.clouds.all);
                self.weatherData.latitude(weatherData.coord.lat);
                self.weatherData.longitude(weatherData.coord.lon);
                self.weatherData.description(weatherData.weather[0].description);
                self.weatherData.iconName(weatherData.weather[0].icon);

                self.location(self.weatherData.city() + ", " + self.weatherData.country());

                self.showWeatherData(true);
                self.errorMessage("");
            } else {
                self.errorMessage(weatherData.hasOwnProperty("message") ? weatherData.message : "Unknown error");
                self.showWeatherData(false);
            }
            self.isLoadingWeatherData(false);
        };

        self.getCurrentWeatherByLocation = function() {
            self.isLoadingWeatherData(true);
            self.errorMessage("");

            var url = self.buidUrlByLocation(self.location());
            $.get(url).done(self.updateCurrentWeather).error(self.onErrorGettingData);
        };

        self.getCurrentWeatherByCoords = function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(self.onGetCoordsOk);
            }
        };

        self.onGetCoordsOk = function(position) {
            self.isLoadingWeatherData(true);
            self.errorMessage("");

            var url = self.buidUrlByCoords(position);
            $.get(url).done(self.updateCurrentWeather).error(self.onErrorGettingData);
        };

        self.onErrorGettingData = function() {
            self.showWeatherData(false);
            self.errorMessage("Connection error");
            self.isLoadingWeatherData(false);
        };

        self.getGoogleMapUrl = function(latitude, longitude) {
            return "https://www.google.com/maps/@" + latitude + "," + longitude + ",12z";
        };

        self.buidUrlByLocation = function(location) {
            return self.baseUrl +
                "?q=" + location +
                "&units=metric" +
                "&appid=" + self.apiKey;
        };

        self.buidUrlByCoords = function(position) {
            return self.baseUrl +
                "?lat=" + position.coords.latitude +
                "&lon=" + position.coords.longitude +
                "&units=metric" +
                "&appid=" + self.apiKey;
        };
    }

    ko.applyBindings(new WeatherViewModel());
});