function createHierarchicalChart(data, areas, titleByUUID, ndata)
{
	// initialize square matrix for plan and assign faculty unique ids
	
	//add the div
	$( "#textWindow" ).hide(); //hide the text window
	var plans = [], faculty = {};
	for(var i = 0; i < data.length; i++) {
		plans[i] = [];
		// stash a unique integer for each faculty member
		faculty[data[i].id] = i; 
		for (var j = 0; j < data.length; j++) {
			plans[i][j] = 0;
		}
	}
	// populate the plan matrix
	data.forEach(function(facultyMember) {
		facultyMember.plans.forEach(function(destination) {
			plans[faculty[facultyMember.id]][faculty[destination.id]] = 1;
		});
	});

	// initialize square matrix for areas and stash the unique id for each area 
	var areaMatrix = [];
	for(var i = 0; i < areas.length; i++) {
		areaMatrix[i] = [];
		areaIds[areas[i].id] = i;
		for (var j = 0; j < areas.length; j++) {
			areaMatrix[i][j] = 0;
		}
	}
	// populate the areas matrix
	areas.forEach(function(area) {
		data.forEach(function(facultyMember) {
			facultyMember.plans.forEach(function(destination) {
				areaMatrix[areaIds[facultyMember.area]][areaIds[data[faculty[destination.id]].area]] += 1; 
			});
		});
	});

			//console.log(areaMatrix);

	var width = 500, height = 500, outerRadius = Math.min(width, height) / 2 - 20, innerRadius = outerRadius - 20, colorIncrement = 0.07, currentColorIncrement = 0, currentArea = 0;
			    
	var areasArc = d3.svg.arc()
					.innerRadius(innerRadius)
			    .outerRadius(outerRadius);

	var areasLayout = d3.layout.chord()
					.padding(0.04);
					
	var facultyArc = d3.svg.arc()
			    .innerRadius(innerRadius - 24)
			    .outerRadius(outerRadius - 24);

	var facultyLayout = d3.layout.chord()
			    .padding(0.04);

	var chord = d3.svg.chord()
			    .radius(innerRadius - 24);

	// The color scale, for different categories of "worrisome" risk.
	/*
	var fill = d3.scale.ordinal()
			    .domain([0, 1, 2])
			    .range(["#DB704D", "#D2D0C6", "#ECD08D", "#F8EDD3"]);*/
			    
	// attach svg object to the content well
	var svg = d3.select("#lowerContentHierarchyChart").selectAll("div")
				.data([plans])
				.enter()
					.append("div")
					.style("width", width + "px")
			    .style("height", height + "px")
					.append("svg:svg")
			    .attr("width", width)
			    .attr("height", height)
			  	.append("svg:g")
			    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	svg.each(function(matrix, j) {
		var svg = d3.select(this);
		facultyLayout.matrix(plans);
		areasLayout.matrix(areaMatrix);

		// Add faculty groups
		var facultyGroups = svg.selectAll("g.faculty-group")
			.data(facultyLayout.groups)
			.enter()
			.append("svg:g")
			.attr("class", "faculty-group");

		// Add the faculty group arc
		facultyGroups.append("svg:path")
			.style("fill", function(d, i) {
				return areas[areaIds[data[i].area]].color;
			})
		.attr("id", function(d, i) { 
			return "faculty-group" + d.index + "-" + j; 
		})
		.attr("d", facultyArc)
		.append("svg:title")
			.text(function(d, i) {
				var planCount = 0;
				data[i].plans.forEach(function(plan) {
				planCount += 1;
			});
			return data[i].entity + ' (' + planCount + ')';
		});
	
		// add area groups
		var areaGroups = svg.selectAll("g.area-group")
				.data(areasLayout.groups)
				.enter()
				.append("svg:g")
				.attr("class", "area-group");

						
		// Add the area group arc
		areaGroups.append("svg:path")
				.style("fill", function(d, i) { 
						return areas[i].color;
					})
				.attr("id", function(d, i) { 
						return "area-group" + d.index + "-" + j; 
					})
				.attr("d", areasArc)
				.append("svg:title")
				.text(function(d, i) { 
						return areas[i].area; 
					});
		// add area names
		areaGroups.append("svg:text")
			.attr("dx", function(d) { 
				var used_angle = d.endAngle - d.startAngle ;
				var length = innerRadius  * used_angle;
				
				var clength = ((innerRadius ) * used_angle) / 2; //obtain the length of an arc and use it to centre the text
				
				var offset = 10;
				if( length < 400 )
				{
					return 0; 				
				}
				return (clength - offset); 
			})
			.attr("dy", 15)
			.style("font-size","18px")
			.append("svg:textPath")
			.attr("xlink:href", function(d) { 
				return "#area-group" + d.index + "-" + j; 
			})
			.text(function(d, i) { 
				return areas[i].area; 
			});
				
		// Add chords between faculty
		var chords = svg.selectAll("path.chord")
				.data(facultyLayout.chords)
				.enter()
				.append("svg:path")
				.attr("class", "chord")
				.attr("idd", function(d) { 
					curID = data[d.source.index].id;
					//return "id-"+curID;
					return curID;
				})
				.style("fill", function(d, i) { 
					return areas[areaIds[data[d.source.index].area]].color;
				})
				.style("stroke", function(d) { 
					return d3.rgb(areas[areaIds[data[d.source.index].area]].color).darker(); 
				})
				.attr("d", chord)
				.on("mouseover", mouseover)
				.on("mouseout", mouseout)
				.on("click", buttonClick);
						
		chords.append("svg:title")		
			.text(function(d) { 
				//console.log(data[d.source.index].id);
				var curID = data[d.source.index].id;
				var entities = data[d.source.index].entity + ',' + data[d.target.index].entity;
				var entities_array = entities.split(","); 
				entities_array = _.uniq(entities_array);
				entities_array.toString(); 
				var result = "Entities: " + entities_array + "\n";
				if (curID)
				{
					if (titleByUUID.hasOwnProperty(curID))
					{
						result = result + "Title: " + titleByUUID[curID];
					}
				}
				
				return result;
				});
							
		function mouseover(d) 
		{
			var isource=d.source.index; 
			var itar=d.target.index;         
			chords.classed("fade", function(p) {
				return (p.source.index != isource && p.target.index != itar) ;
			});	
			
			var entity_list =new Array ('topic', 'person', 'organization');
			var curID = data[d.source.index].id;
			for (var index = 0; index < entity_list.length; index++) 
			{
				var current_entity = entity_list[index];			
				addTermInteraction(current_entity, ndata, curID);
			}

		}
			    
		function mouseout(d) 
		{
			chords.classed("fade", false);
			var entity_list =new Array ('topic', 'person', 'organization');
			var curID = data[d.source.index].id;
			for (var index = 0; index < entity_list.length; index++) 
			{
				var current_entity = entity_list[index];
				removeTermInteraction(current_entity, ndata, curID);
			}
		}
		
		function  buttonClick(d)
		{
			var curID = data[d.source.index].id;	
		}
	});
}

function addTermInteraction(current_entity, ndata, curID)
{
	var sparklineData = ndata[ current_entity ];					
	var term_list = _.pluck(sparklineData, "term");
	
	for (var offset = 0; offset < term_list.length; offset++) 
	{
		var term = term_list[offset];
		var currentSparklineObject = _.filter(sparklineData, function(obj){ return obj.term == term; });
		var sparklineTimeSeries = _.pluck(currentSparklineObject, "sparkline");
		var newsTimeSeries = _.pluck(sparklineTimeSeries[0], "newsid");
		newsTimeSeries = _.compact(newsTimeSeries);
		var newsIDsArray = _.flatten(newsTimeSeries); 
		var curIDArray = curID.split(',');
		var nset = _.intersection(curIDArray, newsIDsArray);
		if (nset.length > 0)
		{
			var currentTermID = term.split(' ').join('_');  
			var nclass = '#'+currentTermID;					
			$(nclass).addClass("termDiv");
		}		
	}
}


function removeTermInteraction(current_entity, ndata, curID)
{
	var sparklineData = ndata[ current_entity ];					
	var term_list = _.pluck(sparklineData, "term");
	
	for (var offset = 0; offset < term_list.length; offset++) 
	{
		var term = term_list[offset];
		var currentSparklineObject = _.filter(sparklineData, function(obj){ return obj.term == term; });
		var sparklineTimeSeries = _.pluck(currentSparklineObject, "sparkline");
		var newsTimeSeries = _.pluck(sparklineTimeSeries[0], "newsid");
		newsTimeSeries = _.compact(newsTimeSeries);
		var newsIDsArray = _.flatten(newsTimeSeries); 	
		var curIDArray = curID.split(',');
		var nset = _.intersection(curIDArray, newsIDsArray);
		if (nset.length > 0)
		{
			var currentTermID = term.split(' ').join('_');  
			var nclass = '#'+currentTermID;					
			$(nclass).removeClass("termDiv");
		}		
	}
}


function filterData(data)
{
	/*
		filter the data based on the bounding box
	*/
	var output = [];
	var format = d3.time.format("%Y-%m-%d %H:%M:%S");
	data.forEach(function(d) 
	{ 
		var data = {};
		data.x = format.parse(d.x);
		data.y = +d.y;
		output.push(data);
	});
	return output;
} 

function createSparklineChart(ndata, zscoreLimit)
{		
	var width = 100;
	var height = 25; 
	// Define the padding around the graph
	var padding = 3;
	var total_term_list = {};
	var total_zscore_list = {};

	var entity_list =new Array ('topic', 'person', 'organization');
	for (var index = 0; index < entity_list.length; index++) 
	{
		var current_entity = entity_list[index];
		var sparklineData = ndata[ current_entity ];

	
		var Groupparent	;
		var chart_group ;

		if (current_entity == 'topic')
		{
			Groupparent	= document.getElementById("contentTopicsSparklines");
			chart_group = document.createElement("div");
		}
		
		else if (current_entity ==  'person')
		{
			Groupparent	= document.getElementById("contentPersonsSparklines");
			chart_group = document.createElement("div");
		}
		
		else
		{
			Groupparent	= document.getElementById("contentOrganizationsSparklines");
			chart_group = document.createElement("div");
		}

					
		var term_list = _.pluck(sparklineData, "term");
		var zscore_list = _.pluck(sparklineData, "zscore");
		var sparklineData_list = _.pluck(sparklineData, "sparkline");
		
		//save terms with entity in array
		total_term_list[current_entity] = term_list;
		total_zscore_list[current_entity] = zscore_list;
		
		for (var offset = 0; offset < term_list.length; offset++) 
		{	
			var current_zscore = zscore_list[offset];
			
			if (current_zscore > 0)
			{		
				var currentTerm = term_list[offset];
				var dataset = sparklineData_list[offset];
				chart_group.id 	= "chart_group_" + current_entity.toString() + offset.toString();
				chart_group.className 	= "chart_group";
				Groupparent.appendChild(chart_group);  
	
				var svg = d3.select("#chart_group_" + current_entity.toString() + offset.toString()) 
						.append("svg")
						.attr("width", width)             
						.attr("height", height); 
								  
	
	
				// Set the scales
	
				var data = filterData(dataset);
				var minDate = d3.min(data, function(d) { return d.x; });
				var maxDate = d3.max(data, function(d) { return d.x; });
				
				var xScale = d3.time.scale()
					.domain([minDate, maxDate])
					.range([padding, width - padding]);
					
				var yScale = d3.scale.linear().range([(height-padding), padding]); 
							
				yScale.domain(d3.extent(data, function(d) { return d.y; }));
				
				var format = d3.time.format("");
				var xAxis = d3.svg.axis()
					.scale(xScale)
					.orient("bottom")
					.tickFormat(format)
					.ticks(d3.time.days, 1);
	
				svg.append("g")
					.attr("class", "axis x-axis")
					.attr("transform", "translate(0," + ( height-padding ) + ")")
					.call(xAxis);
								
	
				// y-axis
				var yAxis = d3.svg.axis()
						.scale(yScale)
						.orient("left")
						.ticks(5); // set rough # of ticks
	
				svg.append("g")
						.attr("class", "axis y-axis")
						.attr("transform", "translate(" + padding+ ",0)")
						.call(yAxis);
	
				// draw line graph
							
				var line = d3.svg.line()
						.x(function(d) { 
							return xScale(d.x); 
						})
						.y(function(d) { 
							return yScale(d.y); 
						});
								
				colour_stroke = "rgb(95, 95, 95)";
	
				svg.append("svg:path").attr("d", line(data))
													.style("stroke", colour_stroke);
	
				// plot circles
				svg.selectAll("circle")
					.data(data)
					.enter()
					.append("circle")
					.attr("class", "data-point")
					.attr("cx", function(d) {
						return xScale(d.x);
					})
					.attr("cy", function(d) {
						return yScale(d.y);
					})
					.attr("r", 0.5); 
			}
		}
	
	}
				
	//build table for the labels
	var div = d3.select("body").append("div")   
	    .attr("class", "tooltip")               
	    .style("opacity", 0);
	
	for (var index = 0; index < entity_list.length; index++) 
	{			
		var tablestr = "<table><tbody>";
		var current_entity = entity_list[index];
		
		var term_list = total_term_list[current_entity];
		var zcore_list = total_zscore_list[current_entity];

		for (var i = 0; i < term_list.length; i++) {
			var curZscore = zcore_list[i]; 
			if (curZscore > 0)
			{
				var curVal = term_list[i];
				fmtVal = curVal.split(' ').join('_');
				tablestr += "<tr><td id="+ fmtVal+" >" + curVal + "</td></tr>";
			}
					
		}

		tablestr += "</tbody></table>";
		
		if (current_entity == 'topic')
		{
			var labelDiv	= document.getElementById("contentTopicsTerms");
			labelDiv.innerHTML = tablestr;
			
			addTooltipToLabels("#contentTopicsTerms", 'topic', total_term_list, ndata, div );
			getIDFromLabels("#contentTopicsTerms", 'topic', total_term_list, ndata );

		}
		else if (current_entity ==  'person')
		{
			var labelDiv	= document.getElementById("contentPersonsTerms");
			labelDiv.innerHTML = tablestr;
			
			addTooltipToLabels("#contentPersonsTerms", 'person', total_term_list, ndata, div  );
			getIDFromLabels("#contentPersonsTerms", 'person', total_term_list, ndata );
		}
		else 
		{
			var labelDiv	= document.getElementById("contentOrganizationsTerms");
			labelDiv.innerHTML = tablestr;

			addTooltipToLabels("#contentOrganizationsTerms", 'organization', total_term_list, ndata, div  );
			getIDFromLabels("#contentOrganizationsTerms", 'organization', total_term_list, ndata );
		}
	}
	
	//add blinking lights
	//var myGlow = glow("myGlow").rgb("#0f0").stdDeviation(4);
	//'topic', 'person', 'organization'
	var zscore_limit = zscoreLimit;
	var myGlow = glow("myGlow").rgb("#0f0").stdDeviation(4);
	
	addBlinkingLights('#contentTopicsNotifications', total_zscore_list, zscore_limit, myGlow, "topic", 6000);
	addBlinkingLights('#contentPersonsNotifications', total_zscore_list, zscore_limit, myGlow, 'person', 6000);
	addBlinkingLights('#contentOrganizationsNotifications', total_zscore_list, zscore_limit, myGlow, 'organization', 6000);
	  


} 

function addTooltipToLabels(nDiv, entity, total_term_list, ndata, placeDiv )
{
	var termSelection = d3.select(nDiv).selectAll("tbody td");
	termSelection.on("mouseover", function (d)
	{
		var currentid = d3.select(this).attr("id");
		var fmtCurrentid = currentid.split('_').join(' '); 
		term_list = total_term_list[entity];
		
		
		var index = term_list.indexOf(fmtCurrentid); //get index of array
		var sparklineData = ndata[ entity ];
		var currentSparklineObject = _.filter(sparklineData, function(obj){ return obj.term == fmtCurrentid; });
		var sparklineTimeSeries = _.pluck(currentSparklineObject, "sparkline");
		
		
		var newsTimeSeries = _.pluck(sparklineTimeSeries[0], "newsid");
		newsTimeSeries = _.compact(newsTimeSeries);
		var newsIDsArray = _.flatten(newsTimeSeries); 	
		
		var yTimeSeries = _.pluck(sparklineTimeSeries[0], "y");
		var sumOfNews = _.reduce(yTimeSeries, function(memo, num){ return memo + num; }, 0);
		
		placeDiv.transition()        
        	.duration(200)      
        	.style("opacity", .9); 
        
		placeDiv.html("News count: "  +sumOfNews)  
        	.style("left", (d3.event.pageX) + "px")     
        	.style("top", (d3.event.pageY + 10) + "px");  
		
		
		//add interaction to hierarchical chart
		addInteractionFromSparklineToHierarchicalChart(newsIDsArray);

	})			
	.on("mouseout", function ()
	{
		placeDiv.transition()        
        	.duration(200)  
			.style("opacity", 0);

		var currentid = d3.select(this).attr("id");
		var fmtCurrentid = currentid.split('_').join(' '); 
		term_list = total_term_list[entity];
		
		
		var index = term_list.indexOf(fmtCurrentid); //get index of array
		var sparklineData = ndata[ entity ];
		var currentSparklineObject = _.filter(sparklineData, function(obj){ return obj.term == fmtCurrentid; });
		var sparklineTimeSeries = _.pluck(currentSparklineObject, "sparkline");
		
		
		var newsTimeSeries = _.pluck(sparklineTimeSeries[0], "newsid");
		newsTimeSeries = _.compact(newsTimeSeries);
		var newsIDsArray = _.flatten(newsTimeSeries); 	
		
		removeInteractionFromSparklineToHierarchicalChart(newsIDsArray);
	});	

}


function addInteractionFromSparklineToHierarchicalChart(newsIDsArray)
{
	var hierarchicalSelection = d3.selectAll("path.chord");
	//class dot is not used
	hierarchicalSelection.classed("dot", function (d) 
	{ 
		var currentid = d3.select(this).attr("idd");
		currentid = currentid.split(","); 
		var nset = _.intersection(currentid, newsIDsArray);
		if (nset.length > 0)
		{
			//console.log("   the n.set > 0 so this true "+currentid); 
			d3.select(this).style("fill","red"); 
		}
		
	});
}


function removeInteractionFromSparklineToHierarchicalChart(newsIDsArray)
{
	var hierarchicalSelection = d3.selectAll("path.chord");	
	//class dot is not used
	hierarchicalSelection.classed("dot", function (d) 
	{ 

		var currentid = d3.select(this).attr("idd");
		currentid = currentid.split(","); 
		var nset = _.intersection(currentid, newsIDsArray);
		if (nset.length > 0)
		{
			
			 d3.select(this).style("fill",function(d, i) { 
					return areas[areaIds[hierarchicalData[d.source.index].area]].color;
				});
		}

	});
}


function addBlinkingLights(div, total_zscore_list, zscore_limit, myGlow, entity, duration)
{
	
	  zcore_list = total_zscore_list[entity];
	  matchingArray = _.filter(zcore_list, function(num){ return num > zscore_limit; });
	  svg = d3.select(div)
	  .append("svg")
	  .call(myGlow);
	  for (var i = 0; i < matchingArray.length; i++) 
	  {
		  var y_values = ( (i + 1) * 32) - 20;
		  svg.append("circle")
				.attr("cx", 12).attr("cy", y_values)
				.attr("r", 5)
				.attr("fill", "#ff0")
				.style("filter", "url(#myGlow)");
	  }
			
	  setInterval(function () {
			var circles=	d3.selectAll("circle");
			if( (circles.attr("fill")== "#ff0") )
			{
				circles.attr("fill", null);
			}
			else
			{
				circles.attr("fill","#ff0");
			}
		}, 600);
	
	  $(div).delay(duration).hide("slow");	
}
	

function getIDFromLabels(nDiv, entity, total_term_list, ndata )
{
	var termSelection = d3.select(nDiv).selectAll("tbody td");
	termSelection.on("click", function ()
	{
		var currentid = d3.select(this).attr("id");
		var fmtCurrentid = currentid.split('_').join(' '); 
		term_list = total_term_list[entity];
		
		var sparklineData = ndata[ entity ];
		var currentSparklineObject = _.filter(sparklineData, function(obj){ return obj.term == fmtCurrentid; });
		var sparklineTimeSeries = _.pluck(currentSparklineObject, "sparkline");
		var newsTimeSeries = _.pluck(sparklineTimeSeries[0], "newsid");
		newsTimeSeries = _.compact(newsTimeSeries);
		var newsIDsArray = _.flatten(newsTimeSeries); 

		xhr = new XMLHttpRequest();
		$( "#textWindow" ).hide(); //hide the text window
		
		xhr.onreadystatechange = function () 
		{
			if (xhr.readyState == 4 && xhr.status == 200) 
			{

				var news_html = xhr.responseText;
				if( news_html != null)
				{
					var news_window = document.getElementById("lowerContentTextWindow"); // get the compressed tweets DIV

					news_window.innerHTML = news_html; 
					$( "#textWindow" ).show();
					addInteractionFromTextWindow(newsIDsArray);
					addEntityHighlightingFromTextWindow(newsIDsArray);
				}	
			}
		}
		var newsIDarr = newsIDsArray.join(',');
		var param = "&newsid_strings=" + encodeURIComponent(newsIDarr);
		
		xhr.open("POST", "displayNews.php" , true);
	    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xhr.send(param);


	});

}


function addNewsLabelFromHierarchicalChart()
{
	var hierarchicalSelection = d3.selectAll("path.chord");
	hierarchicalSelection.on("click", function () 
	{ 
		var currentid = d3.select(this).attr("idd");
		var newsIDsArray = currentid.split(",");
		xhr = new XMLHttpRequest();
		$( "#textWindow" ).hide(); //hide the text window
		
		xhr.onreadystatechange = function () 
		{
			if (xhr.readyState == 4 && xhr.status == 200) 
			{

				var news_html = xhr.responseText;
				if( news_html != null)
				{
					var news_window = document.getElementById("lowerContentTextWindow"); // get the compressed tweets DIV

					news_window.innerHTML = news_html; 
					$( "#textWindow" ).show();
					addInteractionFromTextWindow(newsIDsArray);
					addEntityHighlightingFromTextWindow(newsIDsArray);
				}	
			}
		}


		var param = "&newsid_strings=" + encodeURIComponent(currentid);
		
		xhr.open("POST", "displayNews.php" , true);
	    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xhr.send(param);
		
	});
}

function addInteractionFromTextWindow(newsIDarray)
{
	
	for (var i = 0; i < newsIDarray.length; i++) 
	{
		var currentID = newsIDarray[i];
		var cssID = "#"+currentID;
		var pTextSection = d3.select("#lowerContentTextWindow").select(cssID).select(".newsText");
		pTextSection.on("mouseover", function (d)
		{
			addInteractionFromSparklineToHierarchicalChart(newsIDarray);
			
			//add interaction from text window to sparkline terms
			
			var entity_list =new Array ('topic', 'person', 'organization');
			for (var ind = 0; ind < newsIDarray.length; ind++) 
			{
				var curID = newsIDarray[ind];
				for (var index = 0; index < entity_list.length; index++) 
				{
					var current_entity = entity_list[index];			
					addTermInteraction(current_entity, sparkline_data, curID); //sparkline_data from global variable
				}
			}
		});
		pTextSection.on("mouseout", function (d)
		{
			removeInteractionFromSparklineToHierarchicalChart(newsIDarray);
			
			//remove interaction from text window to sparkline terms
			
			var entity_list =new Array ('topic', 'person', 'organization');
			for (var ind = 0; ind < newsIDarray.length; ind++) 
			{
				var curID = newsIDarray[ind];
				for (var index = 0; index < entity_list.length; index++) 
				{
					var current_entity = entity_list[index];			
					removeTermInteraction(current_entity, sparkline_data, curID); //sparkline_data from global variable
				}
			}
		});
	  
	}

}

function addEntityHighlightingFromTextWindow(newsIDarray)
{
	for (var i = 0; i < newsIDarray.length; i++) 
	{
		var currentID = newsIDarray[i];
		var cssID = "#"+currentID;
		var selectedID = cssID+ " " + ".newsText p";
		var entityArr = entityByUUID[currentID];
		for (var ind = 0; ind < entityArr.length; ind++) 
		{
			var curEntity = entityArr[ind];
			$(selectedID).highlight(curEntity);
		}
	}

}



//add button to close the news window
function init() {    
    var button = document.getElementById("close");
    button.onclick = buttonClick;    
}
window.onload = init;

function buttonClick() {        
    var imageSource = document.getElementById("close").value;
    if (imageSource == "") {
        alert("Please enter the source for an image.");
    }
    else {
    	$("#textWindow").hide();
    }
} 





