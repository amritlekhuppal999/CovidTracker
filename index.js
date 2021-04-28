	$(document).ready(function(){
		//Show Region List
		ShowRegionList();

		//Get Users Region/Country Data 
		GetUserRegionData();

		//Get data for indian states
		//StateWiseData();

		//fetch all the covid data on set interval
		ReloadResults();
	});

	//function to fetch all the covid data on set interval
	function ReloadResults(){
		//that many seconds
		let durration = 300;
		
		setTimeout(()=>{
			
			GetSelectedRegionData();
			//StateWiseData();

			ReloadResults();
			
		}, 1000*durration);
	}

	// API TO GET COUNTRY FLAG BASED ON COUNTRY NAME
  	function getCountryFlag(country_name){
  		//source: "https://restcountries.eu/#api-endpoints-code"
  		const country_API = `https://restcountries.eu/rest/v2/name/${country_name}?fullText=true`;
  		//console.log(country_API);
  		let flag = $.get(country_API);

  		flag.then((response)=>{
  			const flag_link = response[0].flag;
  			document.getElementById('country-flag-span').innerHTML = `<img src="${flag_link}" id="country-flag"/>`
  		});
  		flag.catch((status)=>{
  			console.log('something went wrong in country flag promise.');
  			console.log(status);
  		});
  	}

  	// GET USER REGION + REGION DATA
  	function GetUserRegionData(){
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
				document.getElementById('region-name').value = regionName;
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

			document.getElementById('specific-region').innerHTML = '<i>Unable to detect your region, please select your region from the region list to see the status.</i>';
			//${status.responseText}
		});
  	}
   	
   	//GET SELECTED REGION DATA
	function GetSelectedRegionData(){
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
					<!-- <div class="col-md-12">
						<h3 class="country-name-flag">${region_name.toUpperCase()}
							<span id="country-flag-span"></span>
						</h3>
					</div> -->
					
					<div class="col-md-4 case-block"><small class="text-muted">Cases</small> 
						<p class="case-count font-size-30"><b>${NumToWord(respObj.total_cases)}</b></p>
					</div>

					<div class="col-md-4 recovered-block"><small class="text-muted">Recovered</small> 
						<p class="recovered-count font-size-30"><b>${NumToWord(respObj.recovered)}</b></p>
					</div>

					<div class="col-md-4 deaths-block"><small class="text-muted">Deaths</small> 
						<p class="death-count font-size-30"><b>${NumToWord(respObj.deaths)}</b></p>
					</div>
				</div>`;
			document.getElementById("specific-region").innerHTML = retData;

			//show Region State Data
			if(region_name == "India"){
				StateWiseData();
			}else{
				document.getElementById('state-sec').style.display = "none";
			}

			// document.getElementById("region-name").innerHTML = region_name.toUpperCase();
		})
		.then(()=>{
			//Display Country Flag
			getCountryFlag(region_name);
			
			//Load Global data summary
			GlobalDataSummary();
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
	function GlobalDataSummary(){
		document.getElementById("show-latest").style.display = "block";

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
								<td style="text-align:center;">${NumToWord(countryData.total_cases)}</td>
								<td style="text-align:center;">${NumToWord(countryData.active_cases)}</td>
								<td style="text-align:center;">${NumToWord(countryData.critical)}</td>
								<td style="text-align:center;">${NumToWord(countryData.deaths)}</td>
								<td style="text-align:center;">${NumToWord(countryData.recovered)}</td>
								<td style="text-align:center;">${NumToWord(countryData.tested)}</td></tr>`;
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
    function ShowRegionList(){
	   	$.ajax({
	   		url: 'https://api.quarantine.country/api/v1/regions',
	   		type: 'GET',
			// data: formData,
			dataType: 'JSON',
			encoding: true,
			success: function(response){
				
				let retData = response.data.map((dataObj, index)=>{
					
					return `<option value="${dataObj.name}" data-code="${dataObj.iso3166a2}">${dataObj.name}</option>`; 
				}).sort();
				document.getElementById("opt-region").insertAdjacentHTML("afterend", retData);
				SetRegionList();
				//console.log(response);

				//More details on insertAdjacentHTML(): "https://www.w3schools.com/JSREF/met_node_insertadjacenthtml.asp"
			},

			error: function(error){
				console.log('Something went wrong in "Listing region"');
			}
	    }); 
    }
    //function to set the value of Region list to the user's country 
  	function SetRegionList(){
  		const AccsessToken = '82bcb8efa1a4b5';
  		let region_API = `https://ipinfo.io?token=${AccsessToken}`;
  		
  		//let countryCode = '';
  		let regionProm = $.get(region_API);
		regionProm.then((response)=>{
			let countryCode = response.country;

			regionList = document.getElementById("select-region");
			for(let i=0; i<regionList.length; i++){
				if(regionList[i].dataset.code == countryCode){
					regionList.selectedIndex = i;
					
				}
			}

		})
		.catch((error)=>{
			console.log('Unable to set User\'s Country');
		});
  	}

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
					<td>${NumToWord(dataObj.noOfCases)}</td>
					<td>${NumToWord(dataObj.active)}</td>
					<td>${NumToWord(dataObj.cured)}</td>
					<td>${NumToWord(dataObj.deaths)}</td>
				</tr>`;
			}).join("");

			document.getElementById('state-sec').style.display = "block";
			document.getElementById('state-data').innerHTML = stateData;
		})
		.catch(()=>{
			console.log(`Something went wrong in STATE PROMISE`);
		});
    }

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
		document.getElementById('load-pi-canvas').innerHTML = '<canvas id="covid-pie-chart"></canvas>';
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


	//function to convert number count to words
	function NumToWord(num){

		let retVal = '0';
		let dp = 2;

		//Over or equal to 1B
		if(num >= 1000000000){
			if(num == 1000000000){
				retVal = '1B';
			}

			else if(num > 1000000000){
				retVal = (num/1000000000).toFixed(dp)+'B';
				//retVal = retVal.toFixed(2);
			}
		}

		//Over or equal to 1M
		else if(num >= 1000000){
			if(num == 1000000){
				retVal = '1M';
			}

			else if(num > 1000000){
				retVal = (num/1000000).toFixed(dp)+'M';
				//retVal = retVal.toFixed(2);
			}
		}

		//Over or equal to 1K
		else if(num >= 1000){
			if(num == 1000){
				retVal = '1K';
			}

			else if(num > 1000){
				retVal = (num/1000).toFixed(dp)+'K';
				//retVal = retVal.toFixed(1);
			}
		}

		//just return num
		else{ retVal = num; }
		
		return retVal;
	}


	/*//DISTRICT WISE COVID DATA
	 	function districtWiseData(){
	 	  	//*note: only for INDIAN CITIES
			district_API = `https://documenter.getpostman.com/view/10724784/SzYXXKmA?version=latest`;
		}
	*/

	/*// GET USER IP ADDRESS
	  	function getIpAdd(){
	  		let API_IPv4 = 'https://api.ipify.org?format=json';
	  		let API_IPv6 = 'https://api6.ipify.org?format=json';
	  		$.get(API_IPv4, (response, status)=>{
	  			//console.log(response);
	  			
	  			document.getElementById("show-ip").innerHTML = response.ip;
	  			//getRegionFromIP(response.ip);
	  		});
	  	}
	*/
   