MileageMonitor2FuelLog
======================

I love webOS. However, the fact is that, right now, one can do more with Android than with webOS. I run CM9 on my Touchpad and the quirks of my Pre 2 are irritating. I'm switching to a Galaxy Nexus and need to convert data for some apps.

byebye-webOS is a collection of scripts to convert data from webOS application to Android alternatives. Feel free to reuse these script if you're switching phone/tablet to Android. Be aware that you will, most certainly, have to modify them to suit your needs. Fork away!

MileageMonitor2FuelLog
----------------------
This script enables you to convert data from Mileage Monitor webOS app to Fuel Log Pro (you'll need the Pro key to be able to import your data).

The code assumes that your target units are in the metric system (liters, l/100KM).

Mileage Monitor data is exported to JSON format. The data is always stored in US gallons and miles. So some calculations are made to convert these to the metric system used in Canada. The precision of the US gallons to liters as been adjusted to match the precision used in Mileage Monitor.

If you need help with the Fuel Log csv import format, you can load the app, tap the menu icon, Export/Import, Importing fill-up data and tap the Info button followed by Export sample. It will output all the info you need to adapt this script to your needs.

Usage
-----

[Install Node.JS](http://nodejs.org/#download)

Run :

  node convert.js [mileage-monitor-export.json]

The csv file for Fuel Log import will have the same name as the input file with ".csv" at the end.