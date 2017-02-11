
myApp.controller('AptsController', ['$scope', '$http', function($scope, $http) {
    console.log("Hello World from  apts controller");

// Detta är ett get request till urlen /contacts och serverns kommer 
// skicka tillbaka ett response
/*$http.get('/contacts').success(function(response){
	console.log("i got the data");
	$scope.contacts = response;
});*/

$scope.seletVars = ''
$scope.lastRunQuery = ''
$scope.orderOptions = ''




$scope.manual_query = 'select * from apartments limit 10'

$scope.getApartments = function(){
    console.log('getApartments is running: ');
    console.log('query_in: ' + $scope.manual_query);

    reqData = {
        query: $scope.manual_query
    }

    $http.get('/get_apartments', {params: reqData}).success(function(response){
        //error handling
        console.log('inne i get http svaret');
        response.data

        if (response.success){
            console.log(response.data);
            $scope.query_data = response.data;
            $scope.query_keys = Object.keys(response.data[0]);
        }else{
            console.log(response.data)
        }
    }); 

    /*
    $http({url:'/getData', 
        method: "GET",
        params: {test: $scope.test}}).success(*/
};

$scope.getAutoQuery = function(query){
    
    //building up query

    query_in = 'select ';
    for (var i in $scope.selectVars){
        query_in = query_in + $scope.selectVars[i].marker+ ',';
    }
    for (var i in $scope.analysisVars){
        query_in = query_in + $scope.analysisVars[i].marker+ ',';
    }
    query_in = query_in.slice(0,-1)
    query_in = query_in + ' from apartments'

    //where
    var datum = Date($scope.slider.value)
    console.log($scope.slider.value.getFullYear())
    var year = $scope.slider.value.getFullYear();
    var month = $scope.slider.value.getMonth()+1;
    query_in = query_in + " where date::date > '" + year + "-" + month+"-01'"

    //group by
    query_in = query_in + ' group by ';
    for (var i in $scope.selectVars){
        index = parseInt(i)+1
        query_in = query_in + index + ',';
    }
    query_in = query_in.slice(0,-1)


    //order by
    console.log($scope.orderBy.length)


    if ($scope.orderBy.length != 0){
        if ($scope.orderBy[0].marker != 'choose'){
            query_in = query_in + ' order by ';

            for (var i in $scope.orderBy){
                console.log(i)
                console.log($scope.orderBy[i])
                query_in = query_in + $scope.orderBy[i].marker.split(' as ')[0] + ',';
            }
            query_in = query_in.slice(0,-1)
            console.log(query_in)
            
        }
        
    }
    reqData = {
                query: query_in//'Select date, address, sqm, floor, listprice, soldprice from apartments limit 100',
            }


    // updating values on screen
    var both = $scope.analysisVars.concat($scope.selectVars)
    $scope.orderOptions = both


    $scope.lastRunQuery = query_in;
    $scope.manual_query = query_in; //updateing text box with manual query
    $http.get('/get_apartments', {params: reqData}).success(function(response){

        if (response.success){
            console.log(response)
            data = response.data
            // console.log(data);
            $scope.query_data = data;
            $scope.query_keys = Object.keys(data[0]);
        }
    }); 

    /*
    $http({url:'/getData', 
        method: "GET",
        params: {test: $scope.test}}).success(*/
};

$scope.getTestApartments = function(query){
    
    query_in = 'select substr(date::text,0,11) as date, address, sqm, floor, listprice, soldprice, round(lon::numeric,7) as lon, round(lat::numeric,7) as lat from apartments limit 2'
    reqData = {
        query: query_in//'Select date, address, sqm, floor, listprice, soldprice from apartments limit 100',
    }
    $http.get('/get_apartments', {params: reqData}).success(function(response){

        if (response.success){
            console.log(response)
            data = response.data
            // console.log(data);
            $scope.query_data = data;
            $scope.query_keys = Object.keys(data[0]);
        }
    }); 

    /*
    $http({url:'/getData', 
        method: "GET",
        params: {test: $scope.test}}).success(*/
};

$scope.initiateApp = function(){
    console.log('inne i initation')
    
};

$scope.updateOrderBy = function(query){
    var both = $scope.analysisVars.concat($scope.selectVars)
    $scope.orderOptions = both
}

// dates for slider
var dates = [];
for (var year = 2010; year < 2017; year++){
    for (var month = 1; month <= 13; month++) {
        dates.push(new Date(year, month, 1));
    }
}
$scope.slider = {
  value: dates[0], // or new Date(2016, 7, 10) is you want to use different instances
  options: {
    stepsArray: dates,
    translate: function(date) {
      if (date != null)
        return date.toDateString();
      return '';
    }
  }
};




//options for multiselects etc
$scope.variables = [
{name: 'year'               ,marker: "substr(date_trunc('year', date)::text,0,5) as year"   ,ticked:true},
{name: 'month'              ,marker: "date_trunc('month', date)::date::text as month"       ,ticked:false},
{name: 'metro'              ,marker: 'metro'                                                ,ticked:true},
{name: 'subarea'            ,marker: 'subarea'                                              ,ticked:false},
{name: 'area'               ,marker: 'area'                                                 ,ticked:false},
{name: 'date'               ,marker: 'date::date::text'                                     ,ticked:false},
{name: 'address'            ,marker: 'address'                                              ,ticked:false},
{name: 'room'               ,marker: 'room'                                                 ,ticked:false},
{name: 'sqm'                ,marker: 'sqm'                                                  ,ticked:false},
{name: 'floor'              ,marker: 'floor'                                                ,ticked:false},
{name: 'objecttype'         ,marker: 'objecttype'                                           ,ticked:false},
{name: 'constructionyear'   ,marker: 'constructionyear'                                     ,ticked:false},
{name: 'listprice'          ,marker: 'listprice'                                            ,ticked:false},
{name: 'priceup'            ,marker: 'priceup'                                              ,ticked:false},
{name: 'soldprice'          ,marker: 'soldprice'                                            ,ticked:false},
{name: 'rent'               ,marker: 'rent'                                                 ,ticked:false},
{name: 'broker'             ,marker: 'broker'                                               ,ticked:false},
{name: 'lon'                ,marker: 'lon'                                                  ,ticked:false},
{name: 'lat'                ,marker: 'lat'                                                  ,ticked:false},
{name: 'distancetometro'    ,marker: 'distancetometro'                                      ,ticked:false}
];                  



$scope.where = angular.copy($scope.variables)

$scope.analysis = [
{name: 'number of purchases'   ,marker: 'count(*) as number_of_purchases'                               ,ticked:false},
{name: 'average sqm price'     ,marker: 'round(avg(soldprice/nullif(sqm,0))) as price_per_sqm'                       ,ticked:true},
]


$scope.whereOptions = [
{name: 'greater'   ,marker: '>'                               ,ticked:false},
{name: 'less'     ,marker: '<'                       ,ticked:true}
]

$scope.orderOptions = [
{name: 'Choose'   ,marker: 'choose'                               ,ticked:true}
]

$scope.metroOption = 
[{name:"Abrahamsberg",          marker:"Abrahamsberg",          ticked:false},
{name:"Akeshov",                marker:"Akeshov",               ticked:false},
{name:"Alby",                   marker:"Alby",                  ticked:false},
{name:"Alvik",                  marker:"Alvik",                 ticked:false},
{name:"Angbyplan",              marker:"Angbyplan",             ticked:false},
{name:"Aspudden",               marker:"Aspudden",              ticked:false},
{name:"Axelsberg",              marker:"Axelsberg",             ticked:false},
{name:"Bagarmossen",            marker:"Bagarmossen",           ticked:false},
{name:"Bandhagen",              marker:"Bandhagen",             ticked:false},
{name:"Bergshamra",             marker:"Bergshamra",            ticked:false},
{name:"Bjarkhagen",             marker:"Bjarkhagen",            ticked:false},
{name:"Blackeberg",             marker:"Blackeberg",            ticked:false},
{name:"Blasut",                 marker:"Blasut",                ticked:false},
{name:"Bredang",                marker:"Bredang",               ticked:false},
{name:"Brommaplan",             marker:"Brommaplan",            ticked:false},
{name:"Duvbo",                  marker:"Duvbo",                 ticked:false},
{name:"Enskede gard",           marker:"Enskede gard",          ticked:false},
{name:"Fittja",                 marker:"Fittja",                ticked:false},
{name:"Fridhemsplan",           marker:"Fridhemsplan",          ticked:false},
{name:"Fruangen",               marker:"Fruangen",              ticked:false},
{name:"Gamla stan",             marker:"Gamla stan",            ticked:false},
{name:"Globen",                 marker:"Globen",                ticked:false},
{name:"Gubbangen",              marker:"Gubbangen",             ticked:false},
{name:"Gullmarsplan",           marker:"Gullmarsplan",          ticked:false},
{name:"Hagdalen",               marker:"Hagdalen",              ticked:false},
{name:"Hagerstensasen",         marker:"Hagerstensasen",        ticked:false},
{name:"Hagsatra",               marker:"Hagsatra",              ticked:false},
{name:"Hallonbergen",           marker:"Hallonbergen",          ticked:false},
{name:"Hammarbyhajden",         marker:"Hammarbyhajden",        ticked:false},
{name:"Hornstull",              marker:"Hornstull",             ticked:false},
{name:"Hotorget",               marker:"Hotorget",              ticked:false},
{name:"Husby",                  marker:"Husby",                 ticked:false},
{name:"Huvudsta",               marker:"Huvudsta",              ticked:false},
{name:"Islandstorget",          marker:"Islandstorget",         ticked:false},
{name:"Johannelund",            marker:"Johannelund",           ticked:false},
{name:"Karlaplan",              marker:"Karlaplan",             ticked:false},
{name:"Karrtorp",               marker:"Karrtorp",              ticked:false},
{name:"Kista",                  marker:"Kista",                 ticked:false},
{name:"Kristineberg",           marker:"Kristineberg",          ticked:false},
{name:"Kungstradgarden",        marker:"Kungstradgarden",       ticked:false},
{name:"Liljeholmen",            marker:"Liljeholmen",           ticked:false},
{name:"Malarhajden",            marker:"Malarhajden",           ticked:false},
{name:"Mariatorget",            marker:"Mariatorget",           ticked:false},
{name:"Medborgarplatsen",       marker:"Medborgarplatsen",      ticked:false},
{name:"Midsommarkransen",       marker:"Midsommarkransen",      ticked:false},
{name:"Nackrosen",              marker:"Nackrosen",             ticked:false},
{name:"Norsborg",               marker:"Norsborg",              ticked:false},
{name:"Odenplan",               marker:"Odenplan",              ticked:false},
{name:"Ornsberg",               marker:"Ornsberg",              ticked:false},
{name:"Ostermalmstorg",         marker:"Ostermalmstorg",        ticked:false},
{name:"Racksta",                marker:"Racksta",               ticked:false},
{name:"Radhuset",               marker:"Radhuset",              ticked:false},
{name:"Radmansgatan",           marker:"Radmansgatan",          ticked:false},
{name:"Ragsved",                marker:"Ragsved",               ticked:false},
{name:"Rinkeby",                marker:"Rinkeby",               ticked:false},
{name:"Rissne",                 marker:"Rissne",                ticked:false},
{name:"Sandsborg",              marker:"Sandsborg",             ticked:false},
{name:"Sankt Eriksplan",        marker:"Sankt Eriksplan",       ticked:false},
{name:"Satra",                  marker:"Satra",                 ticked:false},
{name:"Skanstull",              marker:"Skanstull",             ticked:false},
{name:"Skarholmen",             marker:"Skarholmen",            ticked:false},
{name:"Skarmarbrink",           marker:"Skarmarbrink",          ticked:false},
{name:"Skarpnack",              marker:"Skarpnack",             ticked:false},
{name:"Skogskyrkogarden",       marker:"Skogskyrkogarden",      ticked:false},
{name:"Slussen",                marker:"Slussen",               ticked:false},
{name:"Sockenplan",             marker:"Sockenplan",            ticked:false},
{name:"Solna centrum",          marker:"Solna centrum",         ticked:false},
{name:"Solna strand",           marker:"Solna strand",          ticked:false},
{name:"Stadion",                marker:"Stadion",               ticked:false},
{name:"Stadshagen",             marker:"Stadshagen",            ticked:false},
{name:"Stora mossen",           marker:"Stora mossen",          ticked:false},
{name:"Stureby",                marker:"Stureby",               ticked:false},
{name:"Sundbybergs centrum",    marker:"Sundbybergs centrum",   ticked:false},
{name:"Svedmyra",               marker:"Svedmyra",              ticked:false},
{name:"T-Centralen",            marker:"T-Centralen",           ticked:false},
{name:"Tallkrogen",             marker:"Tallkrogen",            ticked:false},
{name:"Tekniska hagskolan",     marker:"Tekniska hagskolan",    ticked:false},
{name:"Telefonplan",            marker:"Telefonplan",           ticked:false},
{name:"Thorildsplan",           marker:"Thorildsplan",          ticked:false},
{name:"Vallingby",              marker:"Vallingby",             ticked:false},
{name:"Varberg",                marker:"Varberg",               ticked:false},
{name:"Varby gard",             marker:"Varby gard",            ticked:false},
{name:"Vastertorp",             marker:"Vastertorp",            ticked:false},
{name:"Vastra skogen",          marker:"Vastra skogen",         ticked:false},
{name:"Zinkensdamm",            marker:"Zinkensdamm",           ticked:false}]
/*
$scope.initiateLeaflet = function(){
	var mymap = L.map('map').setView([51.505, -0.09], 13);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		    //working key but not for L.map:   https://api.mapbox.com/styles/v1/mrliffa/citses8bt00062ipelfijao0j/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibXJsaWZmYSIsImEiOiJjaXRzZWk2NDYwMDFoMm5tcmdobXVwMmgzIn0.I-e4EO_ZN-gC27258NMZNQ
		    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
		    maxZoom: 18,
		    id: 'mrliffa/citses8bt00062ipelfijao0j/tiles/256',
		    accessToken: 'pk.eyJ1IjoibXJsaWZmYSIsImEiOiJjaXRzZWk2NDYwMDFoMm5tcmdobXVwMmgzIn0.I-e4EO_ZN-gC27258NMZNQ'
		}).addTo(mymap);	

			L.marker([51.5, -0.09]).addTo(mymap)
			    .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
			    .openPopup();
}
*/





}])