	$(document).ready(function(){
		//getIpAdd();
		showRegionList();

		//Default Region Data
		getUserRegionData();

		//LoadBarChart();

		LoadPieChart();
	});

	// function selTest(){
	// 	console.log("it works");
	// }

	// GET USER IP ADDRESS
  	// function getIpAdd(){
  	// 	let API_IPv4 = 'https://api.ipify.org?format=json';
  	// 	let API_IPv6 = 'https://api6.ipify.org?format=json';
  	// 	$.get(API_IPv4, (response, status)=>{
  	// 		//console.log(response);
  			
  	// 		document.getElementById("show-ip").innerHTML = response.ip;
  	// 		//getRegionFromIP(response.ip);
  	// 	});
  	// }

  	// API TO GET COUNTRY FLAG BASED ON COUNTRY NAME
  	function getCountryFlag(country_name){
  		//source: "https://restcountries.eu/#api-endpoints-code"
  		const country_API = `https://restcountries.eu/rest/v2/name/${country_name}?fullText=true`;
  		//console.log(country_API);
  		let flag = $.get(country_API);

  		flag.then((response)=>{
  			const flag_link = response[0].flag;
  			document.getElementById('country-flag-span').innerHTML = `<img src="${flag_link}" id="country-flag" />`
  		});
  		flag.catch((status)=>{
  			console.log('something went wrong in country flag promise.');
  			console.log(status);
  		});
  	}

  	// GET USER REGION + REGION DATA
  	function getUserRegionData(){
  		const AccsessToken = '82bcb8efa1a4b5';
  		let region_API = `https://ipinfo.io?token=${AccsessToken}`;
  		//let region_API = `https://ipinfo.io/${IP_ADD}/json`;

  		//console.log(region_API);
		let regionProm = $.get(region_API);

		regionProm.then( (response)=>{
			const countryCode = response.country;

			//LOADING USER REGION DATA BY DEFAULT
			let regionDataProm = $.get(`https://api.quarantine.country/api/v1/regions`);
			regionDataProm.then((regResponse)=>{

				let regionName = regResponse.data.filter((regionArr)=>{
					if(regionArr.iso3166a2 == countryCode){
						return regionArr;
					}
				});
				regionName = regionName[0].name;
				//console.log(regionName);
				
				//GET SPECIFIC USER REGION DATA
				getRegionData(regionName);
			})
			.catch(()=>{
				console.log(`something went wrong inside DEFAULT Region Data (Name) API`);
			});

		})
		.catch((status)=>{
			console.log(`Something went wrong in IP API`);
			//${status.responseText}
		});
  	}
   
  	//GET SELECTED REGION DATA
	function getSelectedRegionData(){
		let ser_bar = document.getElementById("select-region").value;
		getRegionData(ser_bar);
	}

	// FETCH REGION DATA BASED ON REGION NAME
	function getRegionData(region_name){
		const region_API = `https://api.quarantine.country/api/v1/summary/region?region=${region_name}`;

		let region_promise = $.get(region_API);

		region_promise.then((response)=>{
			//console.log(response.data.summary);
			let respObj = response.data.summary;
			let retData = `<div class="row">
					<div class="col-md-12">
						<h3 class="country-name-flag">${region_name.toUpperCase()}
							<span id="country-flag-span"></span>
						</h3>
					</div>
					
					<div class="col-md-4 case-block"><small class="text-muted">Cases</small> 
						<p class="case-count font-size-30"><b>${respObj.total_cases}</b></p>
					</div>

					<div class="col-md-4 recovered-block"><small class="text-muted">Recovered</small> 
						<p class="recovered-count font-size-30"><b>${respObj.recovered}</b></p>
					</div>

					<div class="col-md-4 deaths-block"><small class="text-muted">Deaths</small> 
						<p class="death-count font-size-30"><b>${respObj.deaths}</b></p>
					</div>
				</div>`;
			document.getElementById("specific-region").innerHTML = retData;
		})
		.then(()=>{
			//Display Country Flag
			getCountryFlag(region_name);
		})
		.catch(()=>{
			console.log(`something went wrong in getRegionData function`);
		});

		//Set Data to show BAR/PIE CHART
		region_promise.then((response)=>{
			let respObj = response.data.summary;
			let chartData = {
				label: ['Cases', 'Recovered', 'Deaths', 'Critical', 'Active'],
				data: [respObj.total_cases, respObj.recovered, respObj.deaths, respObj.critical, respObj.active_cases]
			};
			//LoadBarChart(chartData);
			console.log(`critical: ${respObj.critical}`);
			LoadPieChart(chartData);
		})
		.catch(()=>{
			console.log(`Something went wrong in calling Charts from regionData`);
		});
	}

	//FUNCTION TO GET REGION-WISE LATEST DATA SUMMARY (TABLE FORMAT)
	function latestData(){
		document.getElementById("show-latest").style["display"] = "block";

		$.ajax({
			url: 'https://api.quarantine.country/api/v1/summary/latest',
			type: 'GET',
	      // data: formData,
	      dataType: 'JSON',
	      encoding: true,
	      success: function(response){

	      	let countryObj = response.data.regions;
	      	let retData = '';
	      	for(const key in countryObj){
								//console.log(countryObj[key].name);
								let countryData = countryObj[key];
								retData += `<tr><td>${countryData.name}</td>
								<td style="text-align:center;">${countryData.total_cases}</td>
								<td style="text-align:center;">${countryData.active_cases}</td>
								<td style="text-align:center;">${countryData.critical}</td>
								<td style="text-align:center;">${countryData.deaths}</td>
								<td style="text-align:center;">${countryData.recovered}</td>
								<td style="text-align:center;">${countryData.tested}</td></tr>`;
								// console.log(countryData);
							}
							document.getElementById('show-region-data').innerHTML = retData;

							// console.log(response);
	      				//let countryArr = Object.entries(response.data.regions);
	      			}
	      		});
	}

   // FUNCTION TO LIST ALL REGIONS
   function allRegions(){
   	$.ajax({
   		url: 'https://api.quarantine.country/api/v1/regions',
   		type: 'GET',
	      // data: formData,
	      dataType: 'JSON',
	      encoding: true,
	      success: function(response){

	      	let list = response.data.map((dataObj)=>{
	      		return '<li class="list-group-item">'+dataObj.name+'</li>';
	      	}).join("");

	      	console.log(list);
	      	const retData = `
	      		<div class="card">
	      			<ul class="list-group list-group-flush">${list}</ul>
	      		</div>`;

	      	document.getElementById("show-all-region").innerHTML = retData;
	      }
	   }); 
   }

   //SELECT TAG OPTIONS
   function showRegionList(){
   	$.ajax({
   		url: 'https://api.quarantine.country/api/v1/regions',
   		type: 'GET',
	      // data: formData,
	      dataType: 'JSON',
	      encoding: true,
	      success: function(response){
	      	
	      	let retData = response.data.map((dataObj, index)=>{
	      		let selected = '';
	      		return `<option value="${dataObj.name}" ${selected}>${dataObj.name}</option>`; 
	      	});
	      	document.getElementById("opt-region").insertAdjacentHTML("afterend", retData);
	      	
	      	//console.log(response);

	      	//More details on insertAdjacentHTML(): "https://www.w3schools.com/JSREF/met_node_insertadjacenthtml.asp"
	      }
	   }); 
   }

   StateWiseData();

   //STATE WISE COVID DATA
   function StateWiseData(){
   	//*note: only for INDIAN STATES
   	//SOURCE: "https://covid-india-api.firebaseapp.com/#statewise-cases"
		state_API = `https://covid-india-cases.herokuapp.com/states/`;

		let state_promise = $.get(state_API);

		state_promise.then((response)=>{
			//console.log(response);
			//response = JSON.parse(response);
			let stateData = response.map((dataObj)=>{
				return `<tr>
					<td>${dataObj.state}</td>
					<td>${dataObj.noOfCases}</td>
					<td>${dataObj.active}</td>
					<td>${dataObj.cured}</td>
					<td>${dataObj.deaths}</td>
				</tr>`;
			}).join("");

			// let stateDataRow = `<td colspan="5">
			// 	<div style="overflow-x: auto; height:250px;">
			// 		<table>
			//          ${stateData}
			//       </table>
			// 	</div>
			// </td>`;

			document.getElementById('state-data').innerHTML = stateData;
		})
		.catch(()=>{
			console.log(`Something went wrong in STATE PROMISE`);
		});
   }

   //DISTRICT WISE COVID DATA
 //   function districtWiseData(){
 //   	//*note: only for INDIAN CITIES
	// 	district_API = `https://documenter.getpostman.com/view/10724784/SzYXXKmA?version=latest`;
	// }


	// Show BAR Chart Data
	function LoadBarChart(chartData){

		var ctx = document.getElementById('covid-chart').getContext('2d');
		var myChart = new Chart(ctx, {
		    type: 'bar',
		    data: {
		        labels: [...chartData.label],
		        datasets: [{
		            label: 'COVID-19 GRAPH',
		            data: [...chartData.data],
		            backgroundColor: [
		                'purple',
		                'green',
		                'red',
		                'rgba(75, 192, 192, 0.2)',
		                'rgba(255, 159, 64, 0.2)'
		            ],
		            borderColor: [
		                'rgba(255, 206, 86, 1)',
		                'rgba(54, 162, 235, 1)',
		                'rgba(255, 99, 132, 1)',
		                'rgba(75, 192, 192, 1)',
		                'rgba(255, 159, 64, 1)'
		            ],
		            borderWidth: 1
		        }]
		    },
		    options: {
		        scales: {
		            yAxes: [{
		                ticks: {
		                    beginAtZero: true
		                }
		            }]
		        }
		    }
		});
	}

	// Show Pie Chart Data (Not dynamic yet)
	function LoadPieChart(chartData){
		var ctx = document.getElementById('covid-pie-chart').getContext('2d');
		var myChart = new Chart(ctx, {
		    type: 'doughnut',
		    data: {
		    	  labels: [...chartData.label],
		        datasets: [{
		            data: [...chartData.data],
		            backgroundColor: [
		                'purple',
		                'green',
		                'red',
		                'rgba(75, 192, 192, 0.2)',
		                'orange'		                
		            ],

		            hoverBorderWidth: 4,
		            hoverBorderColor: `white`,
		            
		            hoverBackgroundColor: [
		                'purple',
		                'green',
		                'red',
		                'rgba(75, 192, 192, 0.2)',
		                'orange'	                
		            ]
		            // borderWidth: 1
		        }],

		    },
		    options: {
		      cutoutPercentage: 35, //50 - for doughnut, 0 - for pie
		      animation:{
		      	animateRotate: true, //will animate in with a rotation animation.
		        	animateScale: true, //will animate scaling the chart from the center outwards.
		      }
		    }
		});
	}
   