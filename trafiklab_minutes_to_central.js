var http = require('http');

function calcDistVars(lon, lat, callbackToFrontend) {
	console.log("lon: " + lon + ", lat: " + lat);
    time = '08:00'
    date = '2017-03-06'
    maxWalkDist = '500'
    return http.get({
        host: 'api.sl.se',
        // path: 'http://api.sl.se/api2/TravelplannerV2/trip.json?key=0853354e0efc46e18c419cec9c393ada&originId=1595&destId=1002&searchForArrival=0'
        path: 'http://api.sl.se/api2/TravelplannerV2/trip.json?key=0853354e0efc46e18c419cec9c393ada&originCoordLat=' + lat + '&originCoordLong=' + lon + '&originCoordName='+ name + '&time=' + time + '&date=' + date + '&maxDist=' + maxWalkDist + '&maxJourneys=20' + '&destId=1002&searchForArrival=0' 
        //path: 'http://api.sl.se/api2/realtimedepartures.json?key=ded0143863474a28b315d3289f70fa32&siteid=' + query.siteId + '&timewindow='+ query.timeWindow
    }, function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        //console.log("body:" + body)
        response.on('end', function() {
            // Data recevied, do whatever with it!
            var parsed = JSON.parse(body);
            //console.log(body)
            tripList = parsed.TripList.Trip
            // console.log(parsed.TripList.Trip)

            createStructuredObjects(tripList, callbackToFrontend);
        });
    });
}

/*
 * Creates a structured 
 * @param {Number} raw_trip - a unformated trip from a trafiklab http response
 */
function createStructuredObjects(tripList, callbackToFrontend){
	trips_with_metrics = []
	allSubTrips = []
	for (var tripIndex in tripList){
		trip = getTripObject(tripList[tripIndex]) // create structured trip object
		trip_with_metrics = calcTripMetrics(trip) // calc metrics for each trip
		trips_with_metrics.push(trip_with_metrics)

		for (var i in trip.subTrips){
			//console.log(trip.subTrips[i])
			allSubTrips.push(trip.subTrips[i])
		}
	}

	variables = calcPositionVarables(trips_with_metrics, callbackToFrontend)
	
	console.log(variables)
	console.log(trips_with_metrics)
}

function calcPositionVarables(tripList, callbackToFrontend){
	avgTime = 0;
	avgWalkDist = 0;
	arrivingTravelMethods=[]
	//avg loop
	for (i in tripList){
		trip = tripList[i]
		avgTime = avgTime + parseInt(trip.duration)
		avgWalkDist = avgWalkDist + parseInt(trip.totWalkDist)
	}
	departuresPerHour = tripList.length/((Math.abs(tripList[tripList.length-1].subTrips[tripList[tripList.length-1].subTrips.length-1].destTime)-Math.abs(tripList[0].subTrips[tripList[0].subTrips.length-1].destTime))/(60*60*1000))
	avgTime = avgTime/tripList.length
	avgWalkDist = avgWalkDist/tripList.length
	// Math.abs(tripList[0].subTrips[tripList[0].subTrips.length-1].destTime)
	// Math.abs(tripList[tripList.length-1].subTrips[tripList[tripList.length-1].subTrips.length-1].destTime)
	console.log(tripList[0].subTrips[tripList[0].subTrips.length-1].destTime)
	console.log(tripList[tripList.length-1].subTrips[tripList[tripList.length-1].subTrips.length-1].destTime)

	positionVariables = [{
		position: 'Årgångsgatan',
		avgTime: Math.round(avgTime*10000)/10000,
		avgWalkingDistance: avgWalkDist,
		departuresPerHour: departuresPerHour
	}]
	console.log(positionVariables)
	response = {
		tripList: tripList,
		variables: positionVariables
	}
	callbackToFrontend(response)
}

module.exports = {
  calcDistVars: calcDistVars
};

/*
 * Creates a structured object of a trip
 * @param {Number} raw_trip - a unformated trip from a trafiklab http response
 */
function getTripObject(raw_trip){ // Takes in an unformated trip and returns a structured trip with attributes
	subTrips = []
	var tripItem = raw_trip.LegList.Leg // trip to Central
	var duration = raw_trip.dur
	var totWalkDist = 0;
	// var nbrOfSubTrips;
	// iterate over every subtrip
	for (var subTrip in tripItem){ // sub trip ex sjövikstorget to liljeholmen
		// travelMethods.push(tripItem[subTrip].type)

		if (tripItem[subTrip].type == 'WALK'){
			//console.log(tripItem[subTrip].dist)
			var walkDist = parseInt(tripItem[subTrip].dist)
			totWalkDist = parseInt(totWalkDist) + parseInt(tripItem[subTrip].dist)
		}else{
			var walkDist = 0
		}

		oriTime  = new Date(2000, 0, 1, parseInt((tripItem[subTrip].Origin.time).substr(0,2)),  parseInt((tripItem[subTrip].Origin.time).substr(3,5)), 0, 0);
		destTime  = new Date(2000, 0, 1, parseInt((tripItem[subTrip].Destination.time).substr(0,2)), parseInt((tripItem[subTrip].Destination.time).substr(3,5)), 0, 0);
		subDur = (Math.abs(destTime) - Math.abs(oriTime))/60000
		var subTripItem = {
			nr: 		tripItem[subTrip].idx,
			type: 		tripItem[subTrip].type,
			name: 		tripItem[subTrip].name,
			walkDist:   walkDist,
			line: 		tripItem[subTrip].line,
			oriName:    tripItem[subTrip].Origin.name,
			oriTime:    oriTime,
			destName: 	tripItem[subTrip].Destination.name,
			destTime: 	destTime,
			duration:   subDur //tripItem[subTrip].Destination.time-tripItem[subTrip].Origin.time
		}
		subTrips.push(subTripItem)
	}
	var trip = {
		duration: duration,
		subTrips: subTrips
	}
	return trip
}

function calcTripMetrics(tripObject){
	tot_walk_dist = 0;
	num_travel_methods = 0;
	transport_methods = []
	for (i in tripObject.subTrips){
		subTrip = tripObject.subTrips[i]
		//walk dist
		if (subTrip.type == 'WALK'){
			tot_walk_dist = tot_walk_dist + subTrip.walkDist
		}
		//number of changes and transport_methods
		if (subTrip.type != 'WALK'){
			num_travel_methods = num_travel_methods + 1
			transport_methods.push(subTrip.type)
		}
	}
	var trip = {
		duration: tripObject.duration,
		subTrips: tripObject.subTrips,
		totWalkDist: tot_walk_dist,
		numChanges: num_travel_methods-1,
		travelMethods: transport_methods
	}
	return trip
}



