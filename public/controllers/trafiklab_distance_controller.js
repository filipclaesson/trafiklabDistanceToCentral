myApp.controller('TrafiklabDistanceController', ['$scope', '$http', function($scope, $http) {
    console.log("Hello World from trafiklab controller");


$scope.query_in = 'select * from apartments limit 10'


$scope.getRealtimeTraffic = function(){
	console.log('getTrafik is running');
	$http.get('/get_realtime_traffic').success(function(response){
		//error handling
		if (response.success){
			var tripList = response.data.tripList
			console.log(response.data)
			allSubTrips = []
			$scope.Trips = tripList
			
			for (var i in tripList){
				for (var j in tripList[i].subTrips){
					allSubTrips.push(tripList[i].subTrips[j])
				}
			}
			
			$scope.subTrips = allSubTrips
			$scope.positionVariables = response.data.variables

		}else{
			console.log(response)
		}
	});	
};




}])


