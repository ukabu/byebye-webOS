var path = require('path');
var fs = require('fs');

var MILE = 1.6093;//44; 4 digit precision is what I found to yield the proper conversion from Mileage Monitor.
var US_GALLON = 3.78541178;

var defaultCallback = function(err) {
	if (err) return console.error(err);
}

var recordToCsv = function(record) {
	if (record.length === 1) {
		return record[0];
	}
	return record.map(function (field) {
		function pad(n) {
			return n < 10 ? "0"+n : ""+n;
		};
		if (field instanceof Date) {
			return '"'+field.getFullYear()+"-"+pad(field.getMonth()+1)+"-"+pad(field.getDate())+'"';
		}
		return('"'+field+'"');
	}).join(',');
};

var Converter = function(sourcePath) {
	this.sourcePath = sourcePath;
}

Converter.prototype.parseJSON = function(jsonData) {
	return JSON.parse(jsonData);
};

Converter.prototype.convert = function(data, callback) {
	var self = this;
	var destPath = self.sourcePath + "-fuellog.csv";

	var csvData = [];
	self.convertVehicles(data, csvData);
	self.convertFillups(data, csvData);

	fs.writeFile(destPath, csvData.map(recordToCsv).join('\n'));
};

Converter.prototype.convertVehicles = function(sourceData, destData) {
	var self = this;
	destData.push(["## vehicles"]);
	destData.push(["make","model","note","distance","volume","consumption"]);
	sourceData.vehiclesMap = [];
	sourceData.vehicles.forEach(function vehiclesIterator(vehicle) {
		self.convertVehicle(vehicle, destData);
		sourceData.vehiclesMap[vehicle.vehId] = vehicle;
	});
};

Converter.prototype.convertVehicle = function(vehicle, dest) {
	var makeModel = vehicle.name.split(" ");
	vehicle.make = makeModel.shift();
	vehicle.model = makeModel.join(" ");

	dest.push([
		vehicle.make,
		vehicle.model,
		"",
		vehicle.odometerUnit === "km" ? 1 : 2,
		1, // Liters. Must be changed to 2 for gal (us), 3 for gal (uk)
		1, // l/100km, Must be changed to 2 for mpg (us), 3 for mpg (uk), ...
	]);
};

Converter.prototype.convertFillups = function(data, destData) {
	var self = this;
	destData.push(["## fillups"]);
	destData.push(["make","model","date","mileage","fuel","price","partial","note"]);
	data.tanks.forEach(function tanksIterator(tank) {
		self.convertFillup(data.vehiclesMap, tank, destData);
	});
};

Converter.prototype.convertFillup = function(vehicles, tank, destData) {
	var vehicle = vehicles[tank.vehId];
	destData.push([
		vehicle.make,
		vehicle.model,
		new Date(tank.date),
		Math.round(tank.mileage * MILE), // should put this in a function(tank.mileage, vehicle.odometerUnit) to cover different target units
		Math.round(tank.volume * US_GALLON * 1000) / 1000, // should put this in a function(tank.volume, targetUnit) to cover different target units
		tank.price / tank.volume / US_GALLON,
		tank.filled === 'Yes' ? 0 : 1,
		""
	]);
};

Converter.prototype.run = function(callback) {
	var self = this;
	callback = callback || defaultCallback;
	fs.readFile(self.sourcePath, function sourceFileRead(err, data) {
		if (err) return callback(err);
		var mmData = self.parseJSON(data);
		self.convert(mmData, function dataConverted(err, destPath) {
			callback(null, destPath);
		});
	});
};

if (!process.argv[2]) {
	console.error("No source file specified");
	process.exit(1);
}

var converter = new Converter(process.argv[2]);
converter.run();
