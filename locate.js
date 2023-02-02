// Load the Sentinel-1 ImageCollection.
var sentinel1 = ee.ImageCollection('COPERNICUS/S1_GRD');

// Define date range.
var range = 30; // Days
var start_date = ee.Date('2022-02-');
var end_date = start_date.advance(range, 'day');

// Filter by date.
var s1 = sentinel1.filterDate(start_date, end_date);


// Filter by metadata properties.
var vh = s1
  // Filter to get images with VV and VH dual polarization.
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV')) // VV
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH')) // VH
  // Filter to get images collected in interferometric wide swath mode.
  .filter(ee.Filter.eq('instrumentMode', 'IW')); 

// Filter to get images from different look angles.
var vhAscending = vh.filter(ee.Filter.eq('orbitProperties_pass', 'ASCENDING'));
var vhDescending = vh.filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'));

// Create a composite from means at different polarizations and look angles.
var composite = ee.Image.cat([
  vhAscending.select('VH').max(),
  vhDescending.select('VH').max(), 
  ee.ImageCollection(vhAscending.select('VV').merge(vhDescending.select('VV'))).max(),
  ]).focal_median(); 

// Display as a composite of polarization and backscattering characteristics.
Map.addLayer(composite, {min: [-25, -20, -25], max: [0, 10, 0]}, 'composite');

// User Interface
var places = {
  "Kyiv, Ukraine": [50.44922, 30.52091],
  "Belarus Russian Northern Front": [52.21361, 30.10801],
  "Sumy Oblast Region, Russian Northern Occupied Ukranian Territory as of Invasion": [51.78589, 34.25391],
  "Crimea, Russian Southern Front": [45.33325, 34.40880],
  "Donbas, Previous pro-Russian seperatist contact Line": [49.744770, 40.910041],
  "Donbas Region, Ukraine": [40.1032, 38.5921],
  "Donetsk Oblast, Ukraine": [47.99537, 37.81094],
  "Luhansk Oblast, Ukraine": [48.55837, 39.32156],
  Qatar: [51.336665, 25.111551],
  Kuwait: [47.505979, 29.364472],
  Sweden: [17.413448, 57.618322],
  USA: [-106.483039,32.383017],
  Germany: [10.011072,54.435274],
  Jordan: [36.760603,31.807710]
};

var select = ui.Select({
  items: Object.keys(places),
  onChange: function(key) {
    Map.setCenter(places[key][0], places[key][1]);
  }
});

select.setPlaceholder('Choose a location...');
// date selector
var labelStart = ui.Label ('Start date: ', {fontSize: '12px', padding: '1px', color: 'gray', fontWeight:'bold', margin: '10px 10px 0 15px'});
var labelEnd = ui.Label ('End date: ', {fontSize: '12px', padding: '1px', color: 'gray', fontWeight:'bold', margin: '10px 10px 0 15px'});

var textboxStart = ui.Textbox({
  placeholder: '2020-01-01',
  onChange: function(startD) {
    var Ddate = ee.Date.parse('YYYY-mm-dd', startD)
    buffer(Ddate,0,'null',panel);
  },
  style: {margin: '0px 0px 4px 10px', padding: '1px'}
});

var textboxEnd = ui.Textbox({
  placeholder: '2020-06-30',
  onChange: function(endD) {
    var Ddate = ee.Date.parse('YYYY-mm-dd', endD)
    buffer(0,Ddate,'null',panel);
  },
  style: {margin: '0px 0px 4px 10px', padding: '1px'}
});
//date selector

var panel = ui.Panel({
  widgets: [labelStart,textboxStart,labelEnd,textboxEnd,select],
  layout: ui.Panel.Layout.flow('vertical'),
  style: {
    width: '200px',
    position: 'top-left',
    padding: '7px',
    shown: true
  }
});

Map.add(panel);

/*
Description

Sentinel 1 Multi-Temporal analysis shows
converging interferences over ground based
transmission sources such as NPQ-53 phased
array radars.

*/
