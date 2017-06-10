




var MINVAL = 10;
var MAXVAL = 100000;

var shutDownStatus = false;

var aggregationLevelType;
var searchEntityTerm;
var streamObj = new DataStream();

var remoteTermIndexArr = [];
var tableRowObjArr= [];


var currentTermList;

//default setting
var param = "topic";

var highlightedEntity = [];
var unhighlightedEntity = [];

var highlightedHeatmap = [];
var currentTermLabel ; // current clicked item label

var wordCount = 30;


var latestNewsArr = [];

	      
//var sessionObj = {
//	    "Months_vs_Weeks": {
//	        "window-size" : (12 * 24 * 31 * 3600), //specify as number of months in timestamp
//	        "step": (24 * 31 * 3600)
//	    },
//	    "Weeks_vs_Days":   {
//	        "window-size" : (24 * 155 * 3600), //specify as number of weeks in timestamp
//	        "step": (24 * 7 * 3600)
//	    },
//	    "Days_vs_Hours":  {
//	        "window-size": (24 * 31 * 3600), //specify as number of weeks in timestamp
//	    	"step": (24 * 1 * 3600)
//	    },
//	        
//	     "Hours_vs_Minutes" :{
//	         "window-size" : ( 24 * 1 * 3600), //specify as number of days in timestamp
//	     	"step": (1 * 3600)
//	     }
//	};


var sessionObj = {
	    "Months_vs_Weeks": {
	        "window-size" : (12 * 24 * 31 * 3600), //specify as number of months in timestamp
	        "step": (24 * 7 * 3600) //1 week
	    },
	    "Weeks_vs_Days":   {
	        "window-size" : (24 * 155 * 3600), //specify as number of weeks in timestamp
	        "step": (24 * 1 * 3600) //1 day
	    },
	    "Days_vs_Hours":  {
	        "window-size": (24 * 31 * 3600), //specify as number of weeks in timestamp
	    	"step": (1 * 1 * 3600) //1 hour

	    },
	        
	     "Hours_vs_Minutes" :{
	         "window-size" : ( 24 * 1 * 3600), //specify as number of days in timestamp
	     	"step": (1 * 60) //1 minute
	     }
	};

/**
Aggregation code
 */
var aggregationArray = [
                "Months vs Weeks",
                "Weeks vs Days",
                "Days vs Hours",
                "Hours vs Minutes"
                ];


function getRandomInt(min, max) 
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function formatAggregationType(str) 
{
	/**
	 * format the aggregation type received from the slider
	 */
	var arr = str.split(" ");
	var arrString = arr.join("_");
	return arrString;
}


function getInputFromTextbox()
{

	var typingTimer;                //timer identifier
	var doneTypingInterval = 5000;  //time in ms, 5 second for example	        

	$("input[name='SearchBox']").keyup(function()
	{
		clearTimeout(typingTimer);
		if ($("input[name='SearchBox']").val) 
		{
			typingTimer = setTimeout(doneTyping, doneTypingInterval);
		}
	});
		
	$("input[name='SearchBox']").keydown(function(){
		clearTimeout(typingTimer);
	});



	//user is "finished typing," do something
	function doneTyping () 
	{
	    var txt=$('input:text[name=SearchBox]').val();
	    //get the user input and use it to fire an ajax call for the user event and use this to search

		if (typeof txt !== 'undefined')
		{
			searchEntityTerm = txt;
		}

	    setCurrentSessionObject( txt ); // set the textbox to update the session object
	}
	
	
}


/**
 * Perform some function overloading
 * 
 */


function setCurrentSessionObject()
{   
    if (arguments.length == 1)         
    {
        // One-parameters available.
        return setCurrentSessionObjectWithOneParams( arguments[0] ) ;
    }
	else if (arguments.length == 2)
    {
        // Two-parameters avialble.
        return setCurrentSessionObjectWithTwoParams(arguments[0],  arguments[1]);
    } 
}


function setCurrentSessionObjectWithOneParams( term )
{
	var ajax = new Array();
	var processID = getRandomInt( MINVAL, MAXVAL );
	var ajaxindex = processID;
	
	ajax[ ajaxindex] = new XMLHttpRequest();
	ajax[ ajaxindex].id=ajaxindex; 

	ajax[ ajaxindex].onreadystatechange = function () 
	{
		if (ajax[ ajaxindex].readyState == 4 && ajax[ ajaxindex].status == 200) 
		{
			console.log("set current value for session object");
		}
	}

	var param = "term=" + encodeURIComponent(term);

	ajax[ ajaxindex].open("POST", "setCurrentSession.php" , true);
	ajax[ ajaxindex].setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	ajax[ ajaxindex].send(param);
}



function setCurrentSessionObjectWithTwoParams(  aggregationType, param  )
{
	var ajax = new Array();
	var processID = getRandomInt( MINVAL, MAXVAL );
	var ajaxindex = processID;
	
	ajax[ ajaxindex] = new XMLHttpRequest();
	ajax[ ajaxindex].id=ajaxindex; 

	ajax[ ajaxindex].onreadystatechange = function () 
	{
		if (ajax[ ajaxindex].readyState == 4 && ajax[ ajaxindex].status == 200) 
		{
			console.log("set current value for session object");
		}
	}

	var param = "aggregationType=" + encodeURIComponent(aggregationType)+ "&param=" + encodeURIComponent(param);

	ajax[ ajaxindex].open("POST", "setCurrentSession.php" , true);
	ajax[ ajaxindex].setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	ajax[ ajaxindex].send(param);
}



//streamObj.shutstream()
function formalAllAggregationType( arr)
{
	var output = [];
	for (i = 0; i < arr.length; i++) 
	{ 
		var curVal = formatAggregationType(arr[i]) ;
		output.push(curVal);
	}
	return output;
}



function getInputFromRadioButton()
{
	//streamObj  = new DataStream();
	var totalAgg = formalAllAggregationType(aggregationArray);


	$( "#textWindow" ).hide(); //hide the text window
	var chosenIndex = 2;
	var aggregationType = aggregationArray[chosenIndex];


	$( "#slider-range-max-data" ).slider({
		range: "max",
		min: 0,
		max: 3,
		value: chosenIndex,
		slide: function( event, ui ) {
			var roundVal = Math.round(ui.value);	
			aggregationType = aggregationArray [roundVal]; 
			$( "#amount-data" ).val( aggregationType );

		},
		create: function(event, ui){	        
			console.log( aggregationType+"  -----  "+param) ;	
			//call the default method of visualization using the default aggregation and default type of initial setting

			var aggregType = formatAggregationType(aggregationType);
			if ( (typeof aggregType !== 'undefined') && (!shutDownStatus) )
			{
				aggregationLevelType = aggregType;
				streamObj.streamOutput(aggregationLevelType);	
				var curAgg = [aggregationLevelType];
				var shutAgg = _.difference(totalAgg, curAgg);
				for (i = 0; i < shutAgg.length; i++) 
				{ 
					var curAgg = shutAgg[i] ;
					streamObj.shutstream(curAgg);

				}
			}
			setCurrentSessionObject(  aggregType, param  );
			//getInputFromRadioTimeWatch();



		},
		stop : function(event, ui){
			aggregationType = aggregationArray [ui.value];
			console.log( aggregationType+"  -----  "+param) ;
			//call the dvisualization using the altered aggregation and  initial setting
			var aggregType = formatAggregationType(aggregationType);
			if ( (typeof aggregType !== 'undefined') && (!shutDownStatus) )
			{
				aggregationLevelType = aggregType;
				streamObj.streamOutput(aggregationLevelType);	

				var curAgg = [aggregationLevelType];
				var shutAgg = _.difference(totalAgg, curAgg);
				for (i = 0; i < shutAgg.length; i++) 
				{ 
					var curAgg = shutAgg[i] ;
					streamObj.shutstream(curAgg);

				}
			}			
			setCurrentSessionObject(  aggregType, param  );
			//getInputFromRadioTimeWatch();

		}    
	});

	$( "#amount-data" ).val( aggregationType);

	$("#control3 input[name='type']").click(function()
	{
		/**
		 * disable all data streams
		 */
		for (i = 0; i < totalAgg.length; i++) 
		{ 
			var curAgg = totalAgg[i] ;
			streamObj.shutstream(curAgg);

		}		
		
		if($('input:radio[name=type]:checked').val() == "topic")
		{
			/**
			    		Topics
			 */
			param = $('input:radio[name=type]:checked').val();
			$( "#slider-range-max-data" ).slider({
				range: "max",
				min: 0,
				max: 3,
				//value: chosenIndex,
				slide: function( event, ui ) {
					var roundVal = Math.round(ui.value);	
					aggregationType = aggregationArray [roundVal]; 
					$( "#amount-data" ).val( aggregationType );
				},
				stop : function(event, ui){
					aggregationType = aggregationArray [ui.value];
					console.log( aggregationType+"  -----  "+param) ;	 
					//call the method of visualization using the current aggregation 

					var aggregType = formatAggregationType(aggregationType);
					//if (typeof aggregType !== 'undefined')
					if  ( (typeof aggregType !== 'undefined') && (!shutDownStatus) )
					{
						aggregationLevelType = aggregType;
						streamObj.streamOutput(aggregationLevelType);

						var curAgg = [aggregationLevelType];
						var shutAgg = _.difference(totalAgg, curAgg);
						for (i = 0; i < shutAgg.length; i++) 
						{ 
							var curAgg = shutAgg[i] ;
							streamObj.shutstream(curAgg);

						}
					}
					setCurrentSessionObject(  aggregType, param  );
					//getInputFromRadioTimeWatch();
					
				}
			});


			console.log( aggregationType+"  -----  "+param) ;
			//call the method of visualization using the current aggregation 
			var aggregType = formatAggregationType(aggregationType);
			//if (typeof aggregType !== 'undefined')
			if  ( (typeof aggregType !== 'undefined') && (!shutDownStatus) )
			{
				aggregationLevelType = aggregType;
				streamObj.streamOutput(aggregationLevelType);	

				var curAgg = [aggregationLevelType];
				var shutAgg = _.difference(totalAgg, curAgg);
				for (i = 0; i < shutAgg.length; i++) 
				{ 
					var curAgg = shutAgg[i] ;
					streamObj.shutstream(curAgg);

				}
			}
			setCurrentSessionObject(  aggregType, param  );
			//getInputFromRadioTimeWatch();

			$( "#amount-data" ).val( aggregationType);

		}

		if($('input:radio[name=type]:checked').val() == "person")
		{
			/**
				    	Person
			 */
			param = $('input:radio[name=type]:checked').val();

			$( "#slider-range-max-data" ).slider({
				range: "max",
				min: 0,
				max: 3,
				//value: chosenIndex,
				slide: function( event, ui ) {
					var roundVal = Math.round(ui.value);	
					aggregationType = aggregationArray [roundVal]; 
					$( "#amount-data" ).val( aggregationType );
				},
				stop : function(event, ui){
					aggregationType = aggregationArray [ui.value];  
					console.log( aggregationType+"  -----  "+param) ;	 
					//call the method of visualization using the current aggregation 

					var aggregType = formatAggregationType(aggregationType);
					//if (typeof aggregType !== 'undefined')
					if  ( (typeof aggregType !== 'undefined') && (!shutDownStatus) )
					{
						aggregationLevelType = aggregType;
						streamObj.streamOutput(aggregationLevelType);	

						var curAgg = [aggregationLevelType];
						var shutAgg = _.difference(totalAgg, curAgg);
						for (i = 0; i < shutAgg.length; i++) 
						{ 
							var curAgg = shutAgg[i] ;
							streamObj.shutstream(curAgg);

						}
					}	    			
					setCurrentSessionObject(  aggregType, param  );
					//getInputFromRadioTimeWatch();

				}
			});

			console.log( aggregationType+"  -----  "+param) ;	  
			//call the method of visualization using the current aggregation 

			var aggregType = formatAggregationType(aggregationType);
			//if (typeof aggregType !== 'undefined')
			if ( (typeof aggregType !== 'undefined') && (!shutDownStatus) )
			{
				aggregationLevelType = aggregType;
				streamObj.streamOutput(aggregationLevelType);	

				var curAgg = [aggregationLevelType];
				var shutAgg = _.difference(totalAgg, curAgg);
				for (i = 0; i < shutAgg.length; i++) 
				{ 
					var curAgg = shutAgg[i] ;
					streamObj.shutstream(curAgg);

				}
			}	    	
			setCurrentSessionObject(  aggregType, param  );
			//getInputFromRadioTimeWatch();

			$( "#amount-data" ).val( aggregationType);


		}

		if($('input:radio[name=type]:checked').val() == "organization")
		{
			/**
				    	Organization
			 */
			param = $('input:radio[name=type]:checked').val();

			$( "#slider-range-max-data" ).slider({
				range: "max",
				min: 0,
				max: 3,
				//value: chosenIndex,
				slide: function( event, ui ) {
					var roundVal = Math.round(ui.value);	
					aggregationType = aggregationArray [roundVal]; 
					$( "#amount-data" ).val( aggregationType );
				},
				stop : function(event, ui){
					aggregationType = aggregationArray [ui.value];
					console.log( aggregationType+"  -----  "+param) ;	 
					//call the method of visualization using the current aggregation 

					var aggregType = formatAggregationType(aggregationType);
					//if (typeof aggregType !== 'undefined')
					if  ( (typeof aggregType !== 'undefined') && (!shutDownStatus) )
					{
						aggregationLevelType = aggregType;
						streamObj.streamOutput(aggregationLevelType);

						var curAgg = [aggregationLevelType];
						var shutAgg = _.difference(totalAgg, curAgg);
						for (i = 0; i < shutAgg.length; i++) 
						{ 
							var curAgg = shutAgg[i] ;
							streamObj.shutstream(curAgg);

						}
					}
					setCurrentSessionObject(  aggregType, param  );
					//getInputFromRadioTimeWatch();

				}
			});

			console.log( aggregationType+"  -----  "+param) ;
			//call the method of visualization using the current aggregation 

			var aggregType = formatAggregationType(aggregationType);
			//if (typeof aggregType !== 'undefined')
			if  ( (typeof aggregType !== 'undefined') && (!shutDownStatus) )
			{
				aggregationLevelType = aggregType;
				streamObj.streamOutput(aggregationLevelType);	

				var curAgg = [aggregationLevelType];
				var shutAgg = _.difference(totalAgg, curAgg);
				for (i = 0; i < shutAgg.length; i++) 
				{ 
					var curAgg = shutAgg[i] ;
					streamObj.shutstream(curAgg);

				}
			}
			setCurrentSessionObject(  aggregType, param  );
			//getInputFromRadioTimeWatch();

			$( "#amount-data" ).val( aggregationType);
		}      

	});	


}



function getSumOfNewsColumnWise(curData)
{
  /**
  sum of news for the day
  */
	var output = {};
	var groupedByTimeStamp;
  
	if ( aggregationLevelType == "Months_vs_Weeks")
	{
		//"Months_vs_Weeks"
		groupedByTimeStamp = _.groupBy(curData, function(obj){ return obj.month; });
	}
	else if ( aggregationLevelType == "Weeks_vs_Days")
	{
		//"Weeks_vs_Days"
		groupedByTimeStamp = _.groupBy(curData, function(obj){ return obj.week; });

	}
	else if ( aggregationLevelType == "Days_vs_Hours")
	{
		//"Days_vs_Hours"
		groupedByTimeStamp = _.groupBy(curData, function(obj){ return obj.day; });
	}
	else
	{
		//"Hours_vs_Minutes"
		groupedByTimeStamp = _.groupBy(curData, function(obj){ return obj.hour; });
	}



  var timestampList = _.keys(groupedByTimeStamp);

  for (var ind = 0; ind < timestampList.length; ind ++) 
  {
      var currentTimeStamp = timestampList[ind] ;
      var currentDataList = groupedByTimeStamp[currentTimeStamp];
      var sum = 0;
      for (var indx = 0; indx < currentDataList.length; indx ++) 
      {
        var currentObject = currentDataList[indx];
        var numOfNews = currentObject['numofnews'];
        sum = sum + numOfNews;

      }
      output[currentTimeStamp] = sum;
  }
  return output;
}


function cssStyleID(str)
{
	/**
	 * convert string to css ID
	 */
    var output ;
    var str = removePunctuation(str);
    str = str.replace(/\s{2,}/g, ' ');
    var arr = str.split(" ");
    output = arr.join("-");
    return output;
}

//implement a trim function in javascript string
if(typeof(String.prototypec) === "undefined")
{
    String.prototype.trim = function() 
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

//moment().second(); // Number
//moment().minute(); // Number
//moment().hour(); // Number
//moment().format("D"); //day of the month
//
//moment().month(); // Number 0 to 11
//moment().year(); // Number


//function createlegendScale(totalData, colors )
//{
//	var colorScale;
//	var maxNumOfNews = d3.max(totalData, function (d) { return d.numofnews });
//	
//	if (maxNumOfNews <= 3 )
//	{
//
//		var beginningIndex = Math.round(maxNumOfNews / 2) ; 
//		var currentlist = _.range(0, beginningIndex, 1);
//	
//		var totallist = _.range(0, 11, 1);
//		
//		var usedlist = _.difference(totallist , currentlist);
//
//		for (var index = 0; index < usedlist.length ; index++) {
//			var currentIndex = usedlist[index];
//			colors.splice(currentIndex, 1);
//		}
//		
//		colorScale = d3.scale.quantile()
//		.domain([ 0, maxNumOfNews ])
//		.range(colors);	
//	
//	}
//	else 
//	if (maxNumOfNews > 3 && maxNumOfNews < 19)
//	{
//		var numOfColor = Math.round(maxNumOfNews / 2) + 1; 
//		var beginningIndex = Math.round(numOfColor / 2)  ;
//		
//		for (var index = beginningIndex; index < numOfColor ; index++) {
//			colors.splice(index, 1);
//		}
//		
//		colorScale = d3.scale.quantile()
//		.domain([ 0, maxNumOfNews ])
//		.range(colors);				
//	}	
//	else
//	{
//		colorScale = d3.scale.quantile()
//		.domain([ 0, maxNumOfNews ])
//		.range(colors);	
//	}
//	return colorScale;
//
//}



//function createlegendScale(totalData, colors )
//{
//	var colorScale;
//	var maxNumOfNews = d3.max(totalData, function (d) { return d.numofnews });
//	
//	
//	var tempColor ;
//	
//	//if (maxNumOfNews > 10 && maxNumOfNews < 19)
//	//if (maxNumOfNews > 6 && maxNumOfNews < 19)
//	if (maxNumOfNews >= 6)
//	{
//		var numOfColor = Math.round(maxNumOfNews / 2) + 1; 
//		var beginningIndex = Math.round(numOfColor / 2)  ;
//		
//		for (var index = beginningIndex; index < numOfColor ; index++) {
//			colors.splice(index, 1);
//		}
//		
//
//		colorScale = d3.scale.quantile()
//		.domain([ 0, maxNumOfNews ])
//		.range(colors);				
//	}
//	
//	else if ( maxNumOfNews < 6 )
//	{
//		
//		var numOfColors = 3;
//
//		var firstPartIndex = Math.round(numOfColors / 2 );
//		
//		var firstList = colors.slice(0, firstPartIndex); 
//        if (firstList.length == 0)
//        {
//            firstList = colors.slice(0, firstPartIndex+1); 
//        }
//		
//		var secondList = colors.slice(colors.length-firstPartIndex , colors.length); 
//        if (secondList.length == 0)
//        {
//            secondList = colors.slice(colors.length-firstPartIndex-1 , colors.length);
//        }		
//        tempColor = _.union(firstList, secondList);
//        tempColor = _.uniq(tempColor);
//        tempColor = tempColor.slice(0, numOfColors+1);
//        
//        if (maxNumOfNews < 3)
//        {
//        	maxNumOfNews = 2;
//        	tempColor = colors.slice(0, maxNumOfNews);
//        }
//        	
//		
//		colorScale = d3.scale.quantile()
//		.domain([ 0, maxNumOfNews ])
//		.range(tempColor);	
//	}
//	return colorScale;
//
//}



function getCurrentTime(data)
{
    var timestampArr=_.uniq(_.map(data,function (obj)
    {
        var timerange = obj.timerange;
        var endtimestamp = timerange.split("-");
        return parseInt (endtimestamp[1]); 	
    }) ); 
    
    var endTime = _.max(timestampArr);   
    return endTime;

}


function removeTooltip()
{
	$(".tooltip").remove();	
	//$("#summarytooltip").remove();	
	//$( ".mainwindow" ).remove();
	$(".mainwindow").remove(); 
	//d3.selectAll(".mainwindow").remove();
	
	$(".topicLabel").remove(); 
	$(".personLabel").remove(); 
	$(".organizationLabel").remove(); 
	
	
	$(".topic").remove(); 
	$(".person").remove(); 
	$(".organization").remove(); 

	
	$(".topic").empty();
	$(".person").empty();
	$(".organization").empty();
	
	
	$('.error').remove(); 
	$('.error').empty();
	
	
	$('.entityContainer').remove(); 
	$('.entityContainer').empty();
	

}



function addTitleTooltip(listOfTitles)
{
	listOfTitles = _.uniq(listOfTitles);

//	var text = "<div class='titleText'> <br/>"; 
	var text = "<div class='titleText'> "; 
	for (var i = 0; i < listOfTitles.length; i++) 
	{
		var tempStr = listOfTitles[i].replace(/\s+/g,' ').trim() ;
		tempStr = tempStr.replace(/(\r\n|\n|\r)/gm,"");
//	    text += tempStr + "<br/>";
		text += "<p class='tnormal' >" + tempStr + "</p>"; 
	}
	text += "</div>";
	return text;
}



// var personStr = output.person;
function createPersonEntityHTML(personStr)
{
	//var personStr = output.person;
    //var result = personStr.split('---,')
	var result = personStr.split(',')
	
	var ndata = getDataForHistogram( result ) ; // array list of entities

	
	result = dataForList(ndata);
	
 
//    result = _.compact( result ) //remove nulls
//    result = _.uniq(result); //remove duplicates
	
    
	var text = " <h4 class='personLabel'>Persons</h4> <div class='entityContainer'> <div class='personTable'></div> <hr> <div class='person'>"; 
	for (var i = 0; i < result.length; i++) 
	{
		var currentTerm = result[i].text;
		var currentCount = result[i].count;
		
	    //text += "<p>" + currentTerm + "</p>";
		currentTerm = currentTerm.replace(/ +(?= )/g,' ');
		if (currentTerm.length > 2)
		{
		
	//		var resID = currentTerm.split(" "); 
	//		resID = resID.join("_");
			
	//		resID = "person_"+resID;
			var resID = "person_"+cssStyleID(currentTerm);
			/**
			 * hard coding
			 */
			if (!checkSubString(resID, "Bloomberg") ) //remove unnecessary word
			{
				text += "<p class= 'normal'  count = "+currentCount  +" id="+ "'"+resID+"'"+ ">" + currentTerm + "</p>";			
	//			if (currentTerm.length < wordCount)
	//			{
	////				text += "<p class= 'normal' id="+ "'"+resID+"'"+ ">" + currentTerm + "  [" + currentCount + "]  " + "</p>";		
	//				text += "<p class= 'normal'  count = "+currentCount  +"  id="+ "'"+resID+"'"+ ">" + currentTerm +  "</p>";				
	////			text += "<div class = 'extend'> <p class= 'normal'  count = "+currentCount  +"  id="+ "'"+resID+"'"+ ">" + currentTerm + "</p></div> ";
	//			
	//			}
	//			else
	//			{
	////				text += "<br/> <p class= 'normal'  count = "+currentCount  +"  id="+ "'"+resID+"'"+ ">" + currentTerm + "</p><br/> ";
	//				text += " <p class= 'normal'  count = "+currentCount  +"  id="+ "'"+resID+"'"+ ">" + currentTerm + "</p> ";
	//
	//				/**
	//				 * add spacing to the text
	//				 */
	//				var cfield = "#"+resID;
	//
	//                $(cfield).css('height','15px');
	//                $(cfield).css('line-height','15px');
	//				
	////				text += "<div class = 'extend'> <p class= 'normal'  count = "+currentCount  +"  id="+ "'"+resID+"'"+ ">" + currentTerm + "</p></div> ";
	//			
	//			}
			}
		}

		
	}
	text += "</div></div>";
	
	
    return text;
}


function createTopicEntityHTML(topicStr)
{
	//var topicStr = output.topic;
    //var result = topicStr.split('---,')
	 var result = topicStr.split(',')
	 
	 var ndata = getDataForHistogram( result ) ; // array list of entities

	
	result = dataForList(ndata);
	
 
//    result = _.compact( result ) //remove nulls
//    result = _.uniq(result); //remove duplicates
    
    
	var text = " <h4 class='topicLabel'>Topics</h4> <div class='entityContainer'> <div class='topicTable'> </div><hr> <div class='topic'>"; 
	for (var i = 0; i < result.length; i++) 
	{
		var currentTerm = result[i].text;
		var currentCount = result[i].count;
		
		
	    //text += "<p>" + currentTerm + "</p>";
		currentTerm = currentTerm.replace(/ +(?= )/g,' ');
		if (currentTerm.length > 2)
		{

//		var resID = currentTerm.split(" "); 
//		resID = resID.join("_");
		
//		resID = "topic_"+resID;
		var resID = "topic_"+cssStyleID(currentTerm);
		text += "<p class= 'normal'  count = "+currentCount  +" id="+ "'"+resID+"'"+ ">" + currentTerm + "</p>";					
//		if (currentTerm.length < wordCount)
//		{
//			text += "<p class= 'normal'  count = "+currentCount  +"  id="+ "'"+resID+"'"+ ">" + currentTerm + "</p>";				
//		}
//		else
//		{
////			text += "<br/> <p class= 'normal'  count = "+currentCount  +"  id="+ "'"+resID+"'"+ ">" + currentTerm + "</p><br/> ";
//			text += " <p class= 'normal'  count = "+currentCount  +"  id="+ "'"+resID+"'"+ ">" + currentTerm + "</p> ";
//
//			/**
//			 * add spacing to the text
//			 */
//			var cfield = "#"+resID;
//
//            $(cfield).css('height','5px');
//            $(cfield).css('line-height','5px');
//		
//		}
		}
	}
	text += "</div></div>";
    return text;
}


function createOrganizationEntityHTML(organizationStr)
{
	//var organizationStr = output.organization;
    //var result = organizationStr.split('---,')
	var result = organizationStr.split(',')
	var ndata = getDataForHistogram( result ) ; // array list of entities

	
	result = dataForList(ndata);
 
//    result = _.compact( result ) //remove nulls
//    result = _.uniq(result); //remove duplicates
    
    
	var text = " <h4 class='organizationLabel'>Organizations</h4> <div class='entityContainer'> <div class='organizationTable'> </div> <hr><div class='organization'>"; 
	for (var i = 0; i < result.length; i++) 
	{
		var currentTerm = result[i].text;
		var currentCount = result[i].count;

//		var currentTerm = result[i];
	    //text += "<p>" + currentTerm + "</p>";
		currentTerm = currentTerm.replace(/ +(?= )/g,' ');

//		var resID = currentTerm.split(" "); 
//		resID = resID.join("_");
//		
//		resID = "organization_"+resID;

		if (currentTerm.length > 2)
		{
		var resID = "organization_"+cssStyleID(currentTerm);
		
		text += "<p class= 'normal'  count = "+currentCount  +" id="+ "'"+resID+"'"+ ">" + currentTerm + "</p>";					
//		if (!checkSubString(resID, "Apple Inc.") || (!checkSubString(resID, "&")) ) //remove unnecessary word
//		{
//			if (currentTerm.length < wordCount)
//			{
//				text += "<p class= 'normal'  count = "+currentCount  +" id="+ "'"+resID+"'"+ ">" + currentTerm + "</p>";				
//			}
//			else
//			{
////				text += "<br/> <p class= 'normal'  count = "+currentCount  +"  id="+ "'"+resID+"'"+ ">" + currentTerm + "</p><br/> ";
//				text += " <p class= 'normal'  count = "+currentCount  +"  id="+ "'"+resID+"'"+ ">" + currentTerm + "</p> ";
//				
//				/**
//				 * add spacing to the text
//				 */
//				var cfield = "#"+resID;
//
//	            $(cfield).css('height','5px');
//	            $(cfield).css('line-height','5px');
//			
//			}

//		}
		}
	}
	text += "</div></div>";
    return text;
}




function addSearchighlight(term)
{
	var pDiv = "#" + term;
	var termDiv = document.getElementById(term);

	if (termDiv.className == 'normal') 
	{
		//display the chart
		$(pDiv).addClass("searchhighlighted");
		//add element to highlightedlist
		highlightedEntity.push(term);
		
		//remove duplicates

		highlightedEntity = _.uniq(highlightedEntity);
		
		unhighlightedEntity = _.uniq(unhighlightedEntity);
		//remove from unhighlighted list

		if ( _.contains(unhighlightedEntity, term) )
		{
			index = unhighlightedEntity.indexOf(term);
			unhighlightedEntity.splice(index, 1);
			
		}
			
	} 
	else 
	{
		//hide the chart;  	
		$(pDiv).removeClass("searchhighlighted");
		
		//add to unhighlighted list
		unhighlightedEntity.push(term);
		//remove duplicates
		unhighlightedEntity = _.uniq(unhighlightedEntity);
		

		highlightedEntity = _.uniq(highlightedEntity);
		
		//remove from highlightedlist
		if ( _.contains(highlightedEntity, term) )
		{
			index = highlightedEntity.indexOf(term);
			highlightedEntity.splice(index, 1);
			
		}
		

	}
	
}


function addSearchighlightTable(term)
{

	/**
	 * for the table highlighting
	 */	
	var pDiv = "#" + term;
	var termDiv = document.getElementById(term);
	
	if (termDiv.className == 'rowformat') 
	{
		//display the chart
		$(pDiv).addClass("searchhighlighted");
		//add element to highlightedlist
		highlightedEntity.push(term);
		
		//remove duplicates
	
		highlightedEntity = _.uniq(highlightedEntity);
		
		unhighlightedEntity = _.uniq(unhighlightedEntity);
		//remove from unhighlighted list
	
		if ( _.contains(unhighlightedEntity, term) )
		{
			index = unhighlightedEntity.indexOf(term);
			unhighlightedEntity.splice(index, 1);
			
		}
			
	} 
	else 
	{
		//hide the chart;  	
		$(pDiv).removeClass("searchhighlighted");
		
		//add to unhighlighted list
		unhighlightedEntity.push(term);
		//remove duplicates
		unhighlightedEntity = _.uniq(unhighlightedEntity);
		
	
		highlightedEntity = _.uniq(highlightedEntity);
		
		//remove from highlightedlist
		if ( _.contains(highlightedEntity, term) )
		{
			index = highlightedEntity.indexOf(term);
			highlightedEntity.splice(index, 1);
			
		}
		
	
	}	

}







function persistTermHighlighting()
{
	/**
	 * allows for highlighting across frames
	 */
	//term highlighting
	for (i = 0; i < highlightedEntity.length; i++) 
	{
		var currentTerm = highlightedEntity[i];  
		var pDiv = "#" + currentTerm;
		$(pDiv).addClass("searchhighlighted");
	}
	
	//term unhighlighting
	for (i = 0; i < unhighlightedEntity.length; i++) 
	{
		var currentTerm = unhighlightedEntity[i];  
		var pDiv = "#" + currentTerm;
		$(pDiv).removeClass("searchhighlighted");
	}
	
}



function facetInteraction()
{

	$(".person > p").click(function(){
	    // if you need element's ID
	    var pdivID = this.id;
	    addSearchighlight(pdivID)
	});
	
	$(".topic > p").click(function(){
	    // if you need element's ID
	    var pdivID = this.id;
	    addSearchighlight(pdivID)
	});
	
	$(".organization > p").click(function(){
	    // if you need element's ID
	    var pdivID = this.id;
	    addSearchighlight(pdivID)
	});
	
//    $("table.entityTable td ").click(function(){
	$("table.entityTable td ").click(function(){
        // if you need element's ID
        var pdivID = this.id;
		var resID = pdivID.split("-"); 
		var word = resID[0];     
		if (word != "chart")
		{
			addSearchighlightTable(pdivID)
		}  
    });

}



function getSearchInputList()
{
	/**
	 * get all the terms to be search in json
	 */
	var output = {"person":[],"topic":[], "organization":[]  };
	for (i = 0; i < highlightedEntity.length; i++) 
	{
		var currentTerm = highlightedEntity[i];  
		var resID = currentTerm.split("_"); 
		var currentText =  $('#' + currentTerm).text()
		if (currentText !="")
		{
			var entity = resID[0];
			output[entity].push(currentText)			
		}

	}
	return output;
}



function createFacetDocument(facetData)
{
	
	$("#facet").empty();
	var entityList = _.keys(facetData);
	var text = "";
	var noElement = [];
	var errortext;
	for (i = 0; i < entityList.length; i++) 
	{
	    var currentKey = entityList[i];    
	    if (currentKey == "person")
	    {
	    	var personData = facetData.person;
	    	if (! _.isNull(personData) )
	    	{
	    		text += createPersonEntityHTML(personData);
	    	} 
	    	else
	    	{
	    		noElement.push( currentKey );
	    	}
	    }
	    
	    else if (currentKey == "topic")
	    {
	    	var topicData = facetData.topic;
	    	if (! _.isNull(topicData) )
	    	{
	    		text += createTopicEntityHTML(topicData);
	    	}
	    	else
	    	{
	    		noElement.push( currentKey );
	    	}
	    }
	    
	    else if (currentKey == "organization")
	    {
	    	var organizationData = facetData.organization;
	    	if (! _.isNull(organizationData) )
	    	{
	    		text += createOrganizationEntityHTML(organizationData)
	    	}	    	
	    	else
	    	{
	    		noElement.push( currentKey );
	    	}
	    }
	    
	}
	if (noElement.length == 0)
	{
		//don't add error message
		errortext = '';
	}
	else if (noElement.length == 1)
	{
		//write in singular tense

		errortext = "<p class = 'error'>There is no "+ noElement[0] + "</p>";
		
	}
	else 
	{
		//write in plural tense
		errortext = "<p class = 'error'>There are no "+ noElement.join(' ,and ') + "</p>";
		
	}
	
	text +=errortext
	
	$("#facet").append(text);
	
}



function createHistogramDocument(facetData)
{
	var entityList = _.keys(facetData);
	for (i = 0; i < entityList.length; i++) 
	{
	    var currentKey = entityList[i];    
	    if (currentKey == "person")
	    {
	    	var personData = facetData.person;
	    	if (! _.isNull(personData) )
	    	{
	    	    var result = personData.split(',')    
	    	    var ndata = getDataForHistogram( result ) ; // array list of entities
	    	    drawHistogram(ndata, currentKey); //
	    	} 
	    }
	    
	    else if (currentKey == "topic")
	    {
	    	var topicData = facetData.topic;
	    	if (! _.isNull(topicData) )
	    	{
	    	    var result = topicData.split(',')    
	    	    var ndata = getDataForHistogram( result ) ; // array list of entities
	    	    drawHistogram(ndata, currentKey); //
	    	}
	    }
	    
	    else if (currentKey == "organization")
	    {
	    	var organizationData = facetData.organization;
	    	if (! _.isNull(organizationData) )
	    	{
	    	    var result = organizationData.split(',')    
	    	    var ndata = getDataForHistogram( result ) ; // array list of entities
	    	    drawHistogram(ndata, currentKey); //
	    	}	    	
	    }
	    
	}
}


function getClickedObject( boundObject, currentVal ) 
{
	boundObject.classed("bounding-box",false); //remove a stroke on the rects
	boundObject.classed("bounding-box",true); //add a stroke on the rects


//	var currentVal = d;
	highlightedHeatmap.push( currentVal );
	highlightedHeatmap = _.uniq(highlightedHeatmap);
}





function highlighHeatmap()
{
	   var tableSelection = d3.select('#table-1').selectAll('tr');   
	   tableSelection.on("click", function(d, i)    
	   {        
	   		currentTermLabel = d.name;     
	   });
	
   		var index = currentTermList.indexOf(currentTermLabel );   

   		if (index != -1)
		{
   			var chartID = "#chart" + (index) ;    
   			d3.select(chartID).selectAll("rect").each( function(d, i)
   			{		
   				var currentVal = d;
   				var boundObject = d3.select(this);

   				var match =  _.findWhere( highlightedHeatmap, currentVal );
   				if(! _.isUndefined(match)  ) 
   				{
   					//item not present
   					//remove from unhighlighted list
   					if (highlightedHeatmap.length > 1)
   					{
   						highlightedHeatmap.shift();
   					}

   					boundObject.classed("bounding-box",true); //remove a stroke on the rects

   				}
   				else
   				{
   					//item present
   					//add element to highlighted heatmap
   					boundObject.classed("bounding-box",false); //add a stroke on the rects
   				}
   			}); 
		}
}


function preventOverlappingLabel(nndata)
{
	/**
	 * prevent overlapping text on the topmost x-axis label
	 */
	  var numOfElem = 4;
	  var currentVal = nndata.slice(0,numOfElem );
	  var count = _.size( _.countBy( currentVal ) ); //get the number of uniq elem in the list
	  var lastElemIndex = numOfElem-1;
	  var match = _.has(currentVal, lastElemIndex );


	  if( (match) && (count > 1) )
	  {
	  	var lastElem = nndata[lastElemIndex];
	  	var labelDiv = "#top"+lastElem;

	  	$(labelDiv).empty();
	  	//$(labelDiv).val(upDateStr);
	  }

}



function createHeatMapChart(vdata)
{
	
	
	console.log("creating from days vs hours .... "); 
	/**
	 *  Days vs hours
	 */

	
	$( "#datatable" ).empty();
	var gridSize;
	var hourScale;
	
	var div = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);	
	
	
	var widthOffset = 440;
	
	
	var cdata = vdata["heat_map"];
	var ylabelCountList = vdata["topic_count"];
	var listOfTitles = vdata["titleData"];
	
	var facetData = vdata[ "facets"];
	createFacetDocument(facetData)
	
	
	//console.log( JSON.stringify( _.keys(facetData) ) )
	//facetData.person, facetData.organization, facetData.topic

	var term_list = _.keys(cdata) ;
	term_list.unshift(""); //add empty element ot he beginning of the array
	
	//remove the delete term

	var removeTerm = [];
	
	for (var i = 0; i < remoteTermIndexArr.length; i++) {
	    var termindex  = remoteTermIndexArr[i];
	    var term = term_list[termindex];
	    removeTerm.push(term);
	}
	removeTerm = _.uniq(removeTerm) ;
	
	term_list = _.difference(term_list, removeTerm) ;
	
	currentTermList = term_list;

	var rows = []

	var labels = [];
	for (var i = 0; i < term_list.length ; i++) {
		var temp = {};
		temp["name"] = term_list[i].trim();
		rows.push(temp );
	}	

	var offset = 48;
	var margin = { top: 50, right: 0, bottom: 100, left: 30 }
	width = (960 - margin.left - margin.right- offset),
	height = (700 - margin.top - margin.bottom);
	gridSize = Math.floor(width / (24*3));
	legendElementWidth = gridSize*2;
	buckets = 10;

//	var colors = ["#FFFFFF", "#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"]; 

	var colors = ["#FFFFFF",  "#deebf7",  "#9ecae1", "#4292c6",  "#08519c", "#08306b"]; 
	
	var days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	//var save = $('#control').detach();
	//$('#test').empty().append(save);
	
	$( "body svg" ).not('#control svg').remove(); //not the time clock
	var bodyDiv = d3.select("body");
	var bodySvg = bodyDiv.append("svg")
	.attr("class", "mainwindow")   
	.attr("width", width*2)
	.attr("height", height*2);

	var tooltip = bodyDiv.append("div")
	.style("position", "absolute")
	.style("visibility", "hidden");

	var table = d3.select("#datatable").append("table");
//	thead = table.append("thead");
	table.attr("id","table-1" )
	tbody = table.append("tbody");




	var tr = tbody.selectAll("tr")
	.data(rows)
	.enter()
	.append("tr");
	
	//tr.html('<td class="sorter"> <img src="images/drag.png" alt="Smiley face" height="30" width="30"> </td>');

	
	
    var buttonColumn = tr.append("tr");
    buttonColumn.append("div")
    .attr("id", function (d,i){
      return "button"+i; 
    })
    .attr("class", "removebutton")
    //.html('<img src="images/delete.png" alt="Smiley face" height="10" width="10">');
    .html('<img src="images/nndelete1.png" alt="Smiley face" height="10" width="10">');
    
	var td = buttonColumn.selectAll("td")
	.data(function(d) { return [d.name]; })
	.enter()
	.append("td")
	.text(function(d) { return d; }) 
	.attr("id", function (d,i){
		return "id_"+cssStyleID(d); 
		
	})
	;

	tr.append("td")
	.append("div")
	.attr("id", function (d,i){
		return "chart"+i; 
	})
	.attr("width", width + "px");

	/**
          add interaction on the rows of the table to highlight the row label
	 */

	tr.on("mouseover", function (d){
		/**
            add mouseover event on the row of the table.
		 */
		//var nID = "#id_"+d.name;		
		var nID = "#id_"+cssStyleID(d.name);
		var selection = d3.select( nID );
		selection.classed("text-highlight", true);
		
		
        if (d.name)
        {
            showTerm(term_list, d.name);
        }
	

	})
	.on("mouseout", function (d){
		/**
            add mouseover event on the row of the table.
		 */
		//var nID = "#id_"+d.name;		
		var nID = "#id_"+cssStyleID(d.name);
		var selection = d3.select( nID );
		selection.classed("text-highlight", false );
		
		
        if (d.name)
        {
            hideTerm(term_list, d.name);
        }

	});
	

	var totalData = _.values(cdata);
	totalData = _.flatten( totalData ) ;
	
	var end =  getCurrentTime(totalData);
	//drawClock(end) ; //draw clock on screen	

	
	if ( _.has(totalData[0], "day" ) && _.has(totalData[0], "hour" ) &&  (typeof totalData !== 'undefined') ) //prevent entry of wrong data format
	{			
	
		//console.log( JSON.stringify(totalData)  );

		
		var sumOfNewsByColumn = getSumOfNewsColumnWise(totalData); //key:timestamp, value: number of news
	
//		var colorScale = d3.scale.quantile()
//		.domain([0, buckets - 1, d3.max(totalData, function (d) { return d.numofnews })])
//		.range(colors);
		
		var maxNewsCount = 30;
		var colorScale = d3.scale.quantile()
		.domain([0, maxNewsCount])
		.range(colors);	
		
		//var colorScale = createlegendScale(totalData, colors );
		
		
		var minVal = d3.min(_.compact(totalData), function (d) { return d.day }); //remove nulls and find min
		var maxVal = d3.max(_.compact(totalData), function (d) { return d.day }); //remove nulls and find max
		
		stotalData = _.sortBy(_.compact(totalData) , function(obj)
		{ 
			return  obj.day;
		});
	
		for (i = 0; i < rows.length; i++) 
		{
			var labels = rows[i].name;
			if (_.contains(term_list, labels))
			{
				var index = i+1;
				//var index = i;
				var classLabel = "#chart"+index;
				

				$(classLabel).css('height', ''+((height + margin.top + margin.bottom)/13)+'px'); //set height
				
				var svg = d3.select(classLabel).append("svg")
				//.attr("width", (width + margin.left + margin.right))
				.attr("width", (width + margin.right - widthOffset ))
				.attr("height", (height + margin.top + margin.bottom)/13)
				.append("g")
				.attr("transform", "translate(" + ((margin.left/10) + 25) + "," + margin.top/12 + ")");
		
		
				var realLabel =  rows[index % rows.length].name;
				
				if (_.has(cdata, realLabel )) 
				{
		
					/**
					 * handle the case of occluding rectangles based on duplicate data
					 * This code remove the occluding data when a data with zero number of news overlaps the heatmap with news. 
					 * The mouseover events works on the topmost rects. Now we have eliminated the topmost rect
					 */
					var data = cdata[realLabel ];
		
					data = _.sortBy(data , function(obj)
					{ 
						return -1 * obj.numofnews;
					});
		
		
					data = _.uniq(data , function(obj)
					{ 
						return (obj.day +""+ obj.hour)   ; 
					});
					
					//sort by day to keep code in sync
					
					data = _.sortBy(data , function(obj)
					{ 
						return  obj.day;
					});
					
		
		
		
		
					hourScale = d3.scale.linear().domain([0,23]).range([0,3]);
					
		
					if (i == 0) 
					{ 
						//add label here
						var classLabel = "#chart"+i;
						var svgDiv = d3.select(classLabel).append("svg")
						.attr("width", (width + margin.left + margin.right - widthOffset ))
						.attr("height", (height + margin.top + margin.bottom)/14)
						.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
						
						mapdays=_.uniq(_.map(stotalData,function (d){
							return d.day; 		
						}) ); 
						
						var daysmap=svgDiv.selectAll(".daymap")
						.data(mapdays)
			            .enter()
			            .append("text")
			     		    
						.attr("class", "daymap")
						.attr("id", function(d) 
						{					
							var timestampInMsec = parseInt(d) * 1000;
							var day = moment(timestampInMsec).utc().format("D");  
							var month = moment(timestampInMsec).utc().month();  
							return "id-"+month+"-"+day;
						})
						.text(function(d) 
						{
							var timestampInMsec = parseInt(d) * 1000;
							var day = moment(timestampInMsec).utc().format("D");  
							return day;
						})
						//.attr("transform", "rotate(-90)")
						.attr("x", function(d, i) 
						{ 
		
							var xVal ;
							if ((d%10) < 10) //length is 1
							{
								xVal = ((d - minVal) * 30 * gridSize / (maxVal - minVal)) ;
							}
		
							if ((d/10) >= 1) //length is 2
							{
								xVal = ((d - minVal) * 30 * gridSize / (maxVal - minVal)) - 5;
							}
							
							return xVal;
						})
		
						.attr("y", function(d, i) 
						{ 
							var output = 0;
							if (i%2 == 0)
							{
								output = -10;
							}
							return output;
						}
						);	
						//add event on x labels
						daysmap.on("mouseover", function(d) 
						{
							d3.select(this).classed("text-hover",true);		
					        div.transition()        
						        .duration(200)      
						        .style("opacity", .9);  							
						});
						
						daysmap.on("mousemove", function(d) 
						{
		
							var newsCount = sumOfNewsByColumn[d];	
							if ( (!_.isUndefined(newsCount) ) || (!_.isNull(newsCount) ) )
							{
								div .html(newsCount + "  news")  
								.style("left", (d3.event.pageX) + "px")     
								 .style("top", (d3.event.pageY - 28) + "px");  								
							}

									
						});						
						daysmap.on("mouseout" , function(d) 
						{
							d3.select(this).classed("text-hover",false);
							
					        div.transition()        
					        .duration(500)      
					        .style("opacity", 0); 
					        
						});
						
						var monthlist = [];
						
						var monthsmap=svgDiv.selectAll(".monthmap")
						.data(mapdays)
			            .enter()
			            .append("text")
			            .attr("id",function(d, i) 
						{
							var timestampInMsec = parseInt(d) * 1000;
							var month = moment(timestampInMsec).utc().month();  
							return "top"+month;
						})
			     		    
						.attr("class", "monthmap")
						.text(function(d, i) 
						{
							var timestampInMsec = parseInt(d) * 1000;
							var month = moment(timestampInMsec).utc().month();  
							monthlist.push(month);
							return months[month];
						})
						.style("text-anchor", "middle")
						//.style("opacity", (monthlist[monthlist.length -2] === monthlist[monthlist.length -1]) ? 0:1)
						
						.style("opacity", function(d, i)
						{
							var output;
							if (i < monthlist.length )
							{					
								output = (monthlist[i] === monthlist[i-1]) ? 0:1;					
							}										
							return output;
						})
						.attr("x", function(d, i) { return (d - minVal) * 30 * gridSize / (maxVal - minVal);})
						.attr("y", -30);	
						
						//console.log(monthlist)
						//[1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
						
						preventOverlappingLabel(monthlist);
		
					}
					
		
					
		
					
					var heatMap = svg.selectAll(".hour")
					.data(data)
					.enter().append("rect")
					.attr("y", function(d) { return Math.round(hourScale(d.hour)) * gridSize ; })
					//.attr("x", function(d) { return (d.day - minVal) * gridSize * 5; })
					//.attr("x", function(d,i) { return ((xscale(d.day)- xscale(minVal)) * gridSize)  +  i ; })
		
					
					
					.attr("x", function(d) { return (d.day - minVal) * 30 * gridSize / (maxVal - minVal); })
		
		
					.attr("class", "hour bordered")
					.attr("timestamp", function(d) { return d.timerange; })
					.attr("identifier",  cssStyleID(realLabel))
					.attr("width", gridSize*0.7 )
					.attr("height", gridSize )
					//.style("opacity", 0.5) 
					.style("fill", colors[0]);
		
		
					var summarytooltip = d3.select("#summarytooltip"); //add tooltips
					svg.selectAll("rect")
					.on("mouseover", function(d, i) {
						d3.select(this).classed("cell-hover",true); //add a stroke on the rects
						/**
		                        add highlighting to the x axis label
						 */
						d3.selectAll(".daymap").classed("text-highlight",function(r,ri)
						{ 					
							if (r == d.day)
							{
								return true; 
							}
							else 
							{
								return false;
							}
						});
		
	
		
						//adding interaction to text window here
		//				if (!latest)
		//				{
							//addInteractionFromHeatMapToTextWindow();
		//				}
						var timeRangeStr = d.timerange;
						var ncurLabel = cssStyleID(realLabel);
						addInteractionFromHeatMapToTextWindow(ncurLabel, timeRangeStr);
		
					}) 
					
					.on("mousemove", function(d, i) {
						var timeRangeStr = d.timerange;
						var timeStampRange = timeRangeStr.split('-');
						var startTimeStamp = timeStampRange[0];
						var endTimeStamp = timeStampRange[1];
		
		//				var tz = jstz.determine(); // Determines the time zone of the browser client
		//				var timezone = tz.name(); //get timezone
						var startTimestampInMsec = parseInt(startTimeStamp) * 1000;
						var endTimestampInMsec = parseInt(endTimeStamp) * 1000;
		
		//				var startDate = moment(startTimestampInMsec).tz(timezone).format('lll'); ;  
		//				var endDate = moment(endTimestampInMsec).tz(timezone).format('lll'); ; 
						
						var startDate = moment(startTimestampInMsec).utc().format('lll'); ;  
						var endDate = moment(endTimestampInMsec).utc().format('lll'); ; 
						var numOfNews = d.numofnews;
		
						var pluralIndicator = (numOfNews > 1 ? "There are " : "");
						
						var currentTitleHTML = addTitleTooltip( listOfTitles[timeRangeStr] ); //get list of title based on time range
						
						var endTimeValue = moment(endTimestampInMsec - 1).utc().format("hh:mm A");
		
						summarytooltip
//		                .style("left", (d3.event.pageX - 120) + "px")     
//		                .style("top", (d3.event.pageY - 100) + "px")
//						.style("opacity", 1)
//						.select("#value")
//						.html( "The number of news between "+startDate + " and "+ endDate +  pluralIndicator + numOfNews + currentTitleHTML);					
		                .style("left", (d3.event.pageX - 180) + "px")     
		                .style("top", (d3.event.pageY + 20) + "px")
						.style("opacity", 1)
						.select("#value")
//						.html(  pluralIndicator   + numOfNews + " news between "+startDate + " and "+ endDate + currentTitleHTML);	
						
						.html(  pluralIndicator   + numOfNews + " news between "+startDate + " - "+ endTimeValue + currentTitleHTML);		
					})
					
					.on("mouseout", function(d, i) {
		
						d3.select(this).classed("cell-hover",false); //remove a stroke on the rects
						d3.selectAll(".daymap").classed("text-highlight",function(r,ri)
						{ 
							return false;
		
						});
						summarytooltip.style("opacity", 0);
		
						//removing interaction from text window here
		//				if (!latest)
		//				{
							removeInteractionFromHeatMapToTextWindow();
		//				}
					})
					.on("click", function(d) {
						var timeRangeStr = d.timerange;
						if (d.numofnews> 0)
						{
							var boundObject = d3.select(this);
							var currentVal = d;
							getClickedObject( boundObject, currentVal ) 
							getNewsOnClick( timeRangeStr, realLabel );
						}
		
						
					});
					
					highlighHeatmap();
		
					//heatMap.transition().duration(3000)
//					heatMap.transition().duration(3000).ease("elastic")
//					.style("fill", function(d) { return colorScale(d.numofnews); });
	
					heatMap
					.style("fill", function(d) { return colorScale(d.numofnews); });

					if (i == 0) 
					{
						//add legends after drawing the first chart
		               var svglegend=d3.select("#lowerContentlegend").append("svg")
		               
		               		.attr("width", 300)
				.attr("height", 55)
				//.attr("transform", "translate(" + ((margin.left/10) + 25) + "," + margin.top/10 + ")");
		        .attr("transform", "translate(" + (0) + "," + margin.top/10 + ")");
       
						//var legend = bodySvg.selectAll(".legend")
						var legend = svglegend.selectAll("g.legend")
						.data([0].concat(colorScale.quantiles()), function(d) { return d; }); 
						
						legend
						.enter()
						.append("g")
						.attr("class", "legend");
						var noffset = 10;
		
						legend.append("rect")
						.attr("x", function(d, i) { return 2*legendElementWidth * i + noffset; })
						.attr("y", (20))
						.attr("width", 2*legendElementWidth)
						.attr("height", gridSize)
						.style("fill", function(d, i) { return colors[i]; });
		
						legend.append("text")
						.attr("class", "mono")
						.text(function(d) { return "≥ " + Math.round(d); })
						//.text(function(d) { return "≥ " + 2 * Math.round(d / 2); }) // even number
						.attr("x", function(d, i) { return 2*legendElementWidth * i + noffset; })
						.attr("y", (1.5 * 20) + gridSize);
					}
					
					
					
				}				
			}

		}
		//add interaction from the text window to heatmap
	//	if (!latest)
	//	{
			//addInteractionFromTextWindowToHeatMap(rows);
			
			//add scrolling effect from the text window to heatmap
			addScrollingEffectsFromTextWindowToHeatMap(rows);		
	//	}
	
	
		addHighlightToRowLabel(ylabelCountList);
	}

	//$("#table-1").append('<tr><td> <img id="addbutton" src="images/addbutton.png" alt="Smiley face" height="30" width="30"> </img>  </td></tr>');
	//$( "#addbutton" ).hide();
	if (removeTerm.length)
	{
		$("#table-1").append('<tr class="icon"><td><img id="addbutton" src="images/addbutton.png" alt="Smiley face" height="30" width="30"></td></tr>');		
	}

//	$("#table-1 tr td:first-child").append('<img class="sorter" src="images/drag.png" alt="Smiley face" height="30" width="30">');
	//$("#table-1 td").append('<td class="sorter"> <img src="images/drag.png" alt="Smiley face" height="30" width="30"> </td>');

//	$("#table-1 .sorter:first img").hide()
//	removeMouseEventFromImag()
	
	
	//$("#table-1  tr:first td").prepend('<td> Group </td>');
	$("#table-1  td:first").prepend('<h4> Group </h4>');
	
	//$('<td> Group </td>').insertBefore("#table-1 tr:first");
	createHistogramDocument(facetData)

	facetInteraction();
	
	persistTermHighlighting(); //allows for term highlighting across frames
	
	addEntityTooltipForTable();
	
	
	
}


function createHeatMapChartHourvsMin(vdata)
{
	/**
	 *  hours vs minutes
	 */
	$("svg").remove();//remove all svg
	$( "#datatable" ).empty();
	
	var gridSize;
	var hourScale;
	
	var div = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);	
	
	var widthOffset = 440;
	
	var cdata = vdata["heat_map"];
	var ylabelCountList = vdata["topic_count"];
	var listOfTitles = vdata["titleData"];
	
	var facetData = vdata[ "facets"];
	createFacetDocument(facetData)

	var term_list = _.keys(cdata) ;
	term_list.unshift(""); //add empty element ot he beginning of the array
	
	//remove the delete term

	var removeTerm = [];
	
	for (var i = 0; i < remoteTermIndexArr.length; i++) {
	    var termindex  = remoteTermIndexArr[i];
	    var term = term_list[termindex];
	    removeTerm.push(term);
	}
	
	removeTerm = _.uniq(removeTerm) ;
	term_list = _.difference(term_list, removeTerm) ;
	
	
	currentTermList = term_list;

	var rows = []

	var labels = [];
	for (var i = 0; i < term_list.length ; i++) {
		var temp = {};
		temp["name"] = term_list[i].trim();
		rows.push(temp );
	}	

	var offset = 48;
	var margin = { top: 50, right: 0, bottom: 100, left: 30 }
	width = (960 - margin.left - margin.right- offset),
	height = (700 - margin.top - margin.bottom);
	gridSize = Math.floor(width / (24*3));
	legendElementWidth = gridSize*2;
	buckets = 10;


	//var colors = ["#FFFFFF", "#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"]; 
	var colors = ["#FFFFFF", "#c6dbef", "#4292c6", "#08306b"]; 

	var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


	$( "body svg" ).not('#control svg').remove(); //not the time clock
	var bodyDiv = d3.select("body");
	var bodySvg = bodyDiv.append("svg")
	.attr("class", "mainwindow") 
	.attr("width", width*2)
	.attr("height", height*2);

	var tooltip = bodyDiv.append("div")
	.style("position", "absolute")
	.style("visibility", "hidden");

	var table = d3.select("#datatable").append("table");
//	thead = table.append("thead");
	table.attr("id","table-1" )
	tbody = table.append("tbody");



	var tr = tbody.selectAll("tr")
	.data(rows)
	.enter()
	.append("tr");
	
	//tr.html('<td class="sorter"> <img src="images/drag.png" alt="Smiley face" height="30" width="30"> </td>');
	
    var buttonColumn = tr.append("tr");
    buttonColumn.append("div")
    .attr("id", function (d,i){
      return "button"+i; 
    })
    .attr("class", "removebutton")
    //.html('<img src="images/delete.png" alt="Smiley face" height="10" width="10">');
    .html('<img src="images/nndelete1.png" alt="Smiley face" height="10" width="10">');

	var td = buttonColumn.selectAll("td")
	.data(function(d) { return [d.name]; })
	.enter()
	.append("td")
	.text(function(d) { return d; }) 
	.attr("id", function (d,i){
		return "id_"+cssStyleID(d); 
		
	})
	;

	tr.append("td")
	.append("div")
	.attr("id", function (d,i){
		return "chart"+i; 
	})
	.attr("width", width + "px");

	/**
          add interaction on the rows of the table to highlight the row label
	 */

	tr.on("mouseover", function (d){
		/**
            add mouseover event on the row of the table.
		 */
		//var nID = "#id_"+d.name;		
		var nID = "#id_"+cssStyleID(d.name);
		var selection = d3.select( nID );
		selection.classed("text-highlight", true);

        if (d.name)
        {
            showTerm(term_list, d.name);
        }
	

	})
	.on("mouseout", function (d){
		/**
            add mouseover event on the row of the table.
		 */
		//var nID = "#id_"+d.name;		
		var nID = "#id_"+cssStyleID(d.name);
		var selection = d3.select( nID );
		selection.classed("text-highlight", false );
		
        if (d.name)
        {
            hideTerm(term_list, d.name);
        }

	});

	var totalData = _.values(cdata);
	totalData = _.flatten( totalData ) ;
	
	var end =  getCurrentTime(totalData);
	//drawClock(end) ; //draw clock on screen	
	
	if ( _.has(totalData[0], "hour" ) && _.has(totalData[0], "minute" ) && (typeof totalData !== 'undefined') )
	{
		
	
		var sumOfNewsByColumn = getSumOfNewsColumnWise(totalData); //key:timestamp, value: number of news
	
//		var colorScale = d3.scale.quantile()
//		.domain([0, buckets - 1, d3.max(totalData, function (d) { return d.numofnews })])
//		.range(colors);
	
//		var colorScale = d3.scale.quantile()
//		.domain([0, d3.max(totalData, function (d) { return d.numofnews })])
//		.range(colors);	
		
		var maxNewsCount = 4;
		var colorScale = d3.scale.quantile()
		.domain([0, maxNewsCount])
		.range(colors);	
		
//		var colorScale = createlegendScale(totalData, colors );
		
		var minVal = d3.min(_.compact(totalData), function (d) { return d.hour }); //remove nulls and find min
		var maxVal = d3.max(_.compact(totalData), function (d) { return d.hour }); //remove nulls and find max
		
		stotalData = _.sortBy(_.compact(totalData) , function(obj)
		{ 
			return  obj.hour;
		});
	
		for (i = 0; i < rows.length; i++) 
		{
			var labels = rows[i].name;
			if (_.contains(term_list, labels))
			{
				var index = i+1;
				//var index = i;
				var classLabel = "#chart"+index;
				var svg = d3.select(classLabel).append("svg")
				//.attr("width", (width + margin.left + margin.right))
				.attr("width", (width + margin.right - widthOffset ))
				.attr("height", (height + margin.top + margin.bottom)/10)
				.append("g")
				.attr("transform", "translate(" + ((margin.left/10) + 25) + "," + margin.top/10 + ")");
		
		
				var realLabel =  rows[index % rows.length].name;
				
				if (_.has(cdata, realLabel )) 
				{
		
					/**
					 * handle the case of occluding rectangles based on duplicate data
					 * This code remove the occluding data when a data with zero number of news overlaps the heatmap with news. 
					 * The mouseover events works on the topmost rects. Now we have eliminated the topmost rect
					 */
					var data = cdata[realLabel ];
		
					data = _.sortBy(data , function(obj)
					{ 
						return -1 * obj.numofnews;
					});
		
		
					data = _.uniq(data , function(obj)
					{ 
						return (obj.hour +""+ obj.minute)   ; 
					});
					
					//sort by hour to keep code in sync
					
					data = _.sortBy(data , function(obj)
					{ 
						return  obj.hour;
					});
					
					var minuteScale = d3.scale.linear().domain([0,59]).range([0,3]);
					
					if (i == 0) 
					{ 
						//add label here
						var classLabel = "#chart"+i;
						var svgDiv = d3.select(classLabel).append("svg")
						.attr("width", (width + margin.left + margin.right - widthOffset ))
						.attr("height", (height + margin.top + margin.bottom)/10)
						.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
						
						maphours=_.uniq(_.map(stotalData,function (d){
							return d.hour; 		
						}) ); 
						
						
						var daysmap=svgDiv.selectAll(".daymap")
						.data(maphours)
			            .enter()
			            .append("text")
			     		    
						.attr("class", "daymap")
						.attr("id", function(d) 
						{					
							var timestampInMsec = parseInt(d) * 1000;
							var day = moment(timestampInMsec).utc().format("D");  
							var hour = moment(timestampInMsec).utc().hour();  
							var valData = "id-"+day+"-"+hour
							return valData;
						})
						.text(function(d) 
						{
							var timestampInMsec = parseInt(d) * 1000;
							var hour = moment(timestampInMsec).utc().hour();   
							return hour;
						})
						//.attr("y", function(d) { return Math.round( minuteScale(d.minute)) * gridSize ; })
						//.attr("x", function(d) { return (d.hour - minVal) * 24 * gridSize / (maxVal - minVal); })
		
						.attr("x", function(d, i) 
						{ 
							var timestampInMsec = parseInt(d) * 1000;  
							var hour = moment(timestampInMsec).utc().hour();  
							var xVal ;
							if ((hour%10) < 10) //length is 1
							{
								xVal = ((d - minVal) * 24 * gridSize / (maxVal - minVal)) ;
							}
		
							if ((hour/10) >= 1) //length is 2
							{
								xVal = ((d - minVal) * 24 * gridSize / (maxVal - minVal)) - 5;
							}
							
							return xVal;
						})
		
						.attr("y", function(d, i) 
						{ 
							var output = 0;
							if (i%2 == 0)
							{
								output = -10;
							}
							return output;
						}
						);	
						//add event on x labels
						daysmap.on("mouseover", function(d) 
						{
							d3.select(this).classed("text-hover",true);		
					        div.transition()        
						        .duration(200)      
						        .style("opacity", .9);  							
						});
						
						daysmap.on("mousemove", function(d) 
						{
		
							var newsCount = sumOfNewsByColumn[d];			
							if ( (!_.isUndefined(newsCount) ) || (!_.isNull(newsCount) ) )
							{
								div .html(newsCount + "  news")  
								.style("left", (d3.event.pageX) + "px")     
								 .style("top", (d3.event.pageY - 28) + "px");  								
							}
									
						});						
						daysmap.on("mouseout" , function(d) 
						{
							d3.select(this).classed("text-hover",false);
							
					        div.transition()        
					        .duration(500)      
					        .style("opacity", 0); 
					        
						});
						
						var daylist = [];

								
						var monthsmap=svgDiv.selectAll(".monthmap")
						.data(maphours)
			            .enter()
			            .append("text")
			     		    
						.attr("class", "monthmap")
						.attr("id", function(d) 
						{					
							var timestampInMsec = parseInt(d) * 1000;
							var day = moment(timestampInMsec).utc().format("D");  

							var valData = "top"+day;
							return valData;
						})
						.text(function(d) 
						{
							var timestampInMsec = parseInt(d) * 1000;
							var day = moment(timestampInMsec).utc().day();  
							daylist.push(day);
							return days[day];
						})
						.style("text-anchor", "middle")
		
						.style("opacity", function(d, i)
						{
							var output;
							if (i < daylist.length )
							{					
								output = (daylist[i] === daylist[i-1]) ? 0:1;					
							}										
							return output;
						})
						.attr("x", function(d, i) { return (d - minVal) * 24 * gridSize / (maxVal - minVal);})
						.attr("y", -30);
						
						//preventOverlappingLabel(daylist)
		
					}			
		
					
					
					

					
					var heatMap = svg.selectAll(".hour")
					.data(data)
					.enter().append("rect")
		            .attr("y", function(d) { return Math.round( minuteScale(d.minute)) * gridSize ; })
		            .attr("x", function(d) { return (d.hour - minVal) * 24 * gridSize / (maxVal - minVal); })
		
					.attr("class", "hour bordered")
					.attr("timestamp", function(d) { return d.timerange; })
					.attr("identifier",  cssStyleID(realLabel))
					.attr("width", gridSize*0.7 )
					.attr("height", gridSize )
					.style("fill", colors[0]);
		
					
		
					var summarytooltip = d3.select("#summarytooltip"); //add tooltips
					svg.selectAll("rect")
					.on("mouseover", function(d, i) {
						d3.select(this).classed("cell-hover",true); //add a stroke on the rects
						/**
		                        add highlighting to the x axis label
						 */
						d3.selectAll(".daymap").classed("text-highlight",function(r,ri)
						{ 					
							if (r == d.hour)
							{
								return true; 
							}
							else 
							{
								return false;
							}
						});		
						//adding interaction to text window here
		
						//addInteractionFromHeatMapToTextWindow();
						var timeRangeStr = d.timerange;
						var ncurLabel = cssStyleID(realLabel);
						addInteractionFromHeatMapToTextWindow(ncurLabel, timeRangeStr);
		
					}) 
					
					.on("mousemove", function(d, i) {
						var timeRangeStr = d.timerange;
						var timeStampRange = timeRangeStr.split('-');
						var startTimeStamp = timeStampRange[0];
						var endTimeStamp = timeStampRange[1];
		
		//				var tz = jstz.determine(); // Determines the time zone of the browser client
		//				var timezone = tz.name(); //get timezone
						var startTimestampInMsec = parseInt(startTimeStamp) * 1000;
						var endTimestampInMsec = parseInt(endTimeStamp) * 1000;
		
		//				var startDate = moment(startTimestampInMsec).tz(timezone).format('lll'); ;  
		//				var endDate = moment(endTimestampInMsec).tz(timezone).format('lll'); ; 
						
						var startDate = moment(startTimestampInMsec).utc().format('lll'); ;  
						var endDate = moment(endTimestampInMsec).utc().format('lll'); ; 
						var numOfNews = d.numofnews;
		
						var pluralIndicator = (numOfNews > 1 ? "There are " : "");
						
						var currentTitleHTML = addTitleTooltip( listOfTitles[timeRangeStr] ); 
		
						summarytooltip
//						.style("left", ((width/2)+40) + "px")
//						.style("top", (margin.bottom) + "px")
		                .style("left", (d3.event.pageX - 180) + "px")     
		                .style("top", (d3.event.pageY + 20) + "px")
						.style("opacity", 1)
						.select("#value")
						.html(  pluralIndicator   + numOfNews + " news between "+startDate + " and "+ endDate + currentTitleHTML);		
					})
					
					.on("mouseout", function(d, i) {
		
						d3.select(this).classed("cell-hover",false); //remove a stroke on the rects
						d3.selectAll(".daymap").classed("text-highlight",function(r,ri)
								{ 
							return false;
		
								});
						summarytooltip.style("opacity", 0);
		
						//removing interaction from text window here
		//				if (!latest)
		//				{
							removeInteractionFromHeatMapToTextWindow();
		//				}
					})
					.on("click", function(d) {
						var timeRangeStr = d.timerange;
						if (d.numofnews> 0)
						{
							var boundObject = d3.select(this);
							var currentVal = d;
							getClickedObject( boundObject, currentVal ) 
							getNewsOnClick( timeRangeStr, realLabel );
						}
		
						
					});
					
					highlighHeatmap();		
		
					//heatMap.transition().duration(3000)
//					heatMap.transition().duration(3000).ease("elastic")
//					.style("fill", function(d) { return colorScale(d.numofnews); });
					
					heatMap.style("fill", function(d) { return colorScale(d.numofnews); });
		
                    if (i == 0) 
                    {
                        //add legends after drawing the first chart
                       var svglegend=d3.select("#lowerContentlegend").append("svg")
                       
                            .attr("width", 300)
                .attr("height", 55)
                //.attr("transform", "translate(" + ((margin.left/10) + 25) + "," + margin.top/10 + ")");
                .attr("transform", "translate(" + (0) + "," + margin.top/10 + ")");
       
                        //var legend = bodySvg.selectAll(".legend")
                        var legend = svglegend.selectAll("g.legend")
                        .data([0].concat(colorScale.quantiles()), function(d) { return d; }); 
                        
                        legend
                        .enter()
                        .append("g")
                        .attr("class", "legend");
                        var noffset = 10;
        
                        legend.append("rect")
                        .attr("x", function(d, i) { return 2*legendElementWidth * i + noffset; })
                        .attr("y", (20))
                        .attr("width", 2*legendElementWidth)
                        .attr("height", gridSize)
                        .style("fill", function(d, i) { return colors[i]; });
        
                        legend.append("text")
                        .attr("class", "mono")
                        .text(function(d) { return "≥ " + Math.round(d); })
                        //.text(function(d) { return "≥ " + 2 * Math.round(d / 2); }) // even number
                        .attr("x", function(d, i) { return 2*legendElementWidth * i + noffset; })
                        .attr("y", (1.5 * 20) + gridSize);
                    }
				}				
			}

		}
		//addInteractionFromTextWindowToHeatMap(rows);
		
		//add scrolling effect from the text window to heatmap
		addScrollingEffectsFromTextWindowToHeatMap(rows);		
	
		addHighlightToRowLabel(ylabelCountList);
	}
	
	//$("#table-1").append('<tr class="icon"><td><img id="addbutton" src="images/addbutton.png" alt="Smiley face" height="30" width="30"></td></tr>');
	//$("#table-1").append('<tr><td> <img id="addbutton" src="images/addbutton.png" alt="Smiley face" height="30" width="30"> </img>  </td></tr>');
	//$( "#addbutton" ).hide();
	if (removeTerm.length)
	{
		$("#table-1").append('<tr class="icon"><td><img id="addbutton" src="images/addbutton.png" alt="Smiley face" height="30" width="30"></td></tr>');		
	}	
	
	//$("#table-1 .sorter:first img").hide()
	
//	removeMouseEventFromImag()
	$("#table-1  td:first").prepend('<h4> Group </h4>');
	createHistogramDocument(facetData)

	facetInteraction();
	
	persistTermHighlighting(); //allows for term highlighting across frames
	
	addEntityTooltipForTable();
}



function createHeatMapChartWeekvsDay(vdata)
{
	/**
	 *  Week vs Day
	 */
	$("svg").remove();//remove all svg
	$( "#datatable" ).empty();

	
	var gridSize;
	var hourScale;
	
	var div = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);	
	
	var widthOffset = 470;
	
	var cdata = vdata["heat_map"];
	var ylabelCountList = vdata["topic_count"];
	var listOfTitles = vdata["titleData"];
	
	var facetData = vdata[ "facets"];
	createFacetDocument(facetData)

	var term_list = _.keys(cdata) ;
	term_list.unshift(""); //add empty element ot he beginning of the array
	
	//remove the delete term

	var removeTerm = [];
	
	for (var i = 0; i < remoteTermIndexArr.length; i++) {
	    var termindex  = remoteTermIndexArr[i];
	    var term = term_list[termindex];
	    removeTerm.push(term);
	}
	
	removeTerm = _.uniq(removeTerm) ;
	term_list = _.difference(term_list, removeTerm) ;
	
	currentTermList = term_list;

	var rows = []

	var labels = [];
	for (var i = 0; i < term_list.length ; i++) {
		var temp = {};
		temp["name"] = term_list[i].trim();
		rows.push(temp );
	}	

	var offset = 48;
	var margin = { top: 50, right: 0, bottom: 100, left: 30 }
	width = (960 - margin.left - margin.right- offset),
	height = (700 - margin.top - margin.bottom);
	gridSize = Math.floor(width / (24*3));
	legendElementWidth = gridSize*2;
	buckets = 10;


	//var colors = ["#FFFFFF", "#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"]; 
	var colors = ["#FFFFFF",  "#deebf7",  "#9ecae1", "#4292c6",  "#08519c", "#08306b"]; 
	
	var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


	$( "body svg" ).not('#control svg').remove(); //not the time clock
	var bodyDiv = d3.select("body");
	var bodySvg = bodyDiv.append("svg")
	.attr("class", "mainwindow") 
	.attr("width", width*2)
	.attr("height", height*2);

	var tooltip = bodyDiv.append("div")
	.style("position", "absolute")
	.style("visibility", "hidden");

	var table = d3.select("#datatable").append("table");
	table.attr("id", "table-1" );
	
//	thead = table.append("thead");
	tbody = table.append("tbody");




	var tr = tbody.selectAll("tr")
	.data(rows)
	.enter()
	.append("tr");
	
	//tr.html('<td class="sorter"> <img src="images/drag.png" alt="Smiley face" height="30" width="30"> </td>');
	
	
    var buttonColumn = tr.append("tr");
    buttonColumn.append("div")
    .attr("id", function (d,i){
      return "button"+i; 
    })
    .attr("class", "removebutton")
    //.html('<img src="images/delete.png" alt="Smiley face" height="10" width="10">');
    .html('<img src="images/nndelete1.png" alt="Smiley face" height="10" width="10">');

    
    
	var td = buttonColumn.selectAll("td")
	.data(function(d) { return [d.name]; })
	.enter()
	.append("td")
	.text(function(d) { return d; }) 
	.attr("id", function (d,i){
		return "id_"+cssStyleID(d); 
		
	})
	;

	tr.append("td")
	.append("div")
	.attr("id", function (d,i){
		return "chart"+i; 
	})
	.attr("width", width + "px");

	/**
          add interaction on the rows of the table to highlight the row label
	 */

	tr.on("mouseover", function (d){
		/**
            add mouseover event on the row of the table.
		 */
		//var nID = "#id_"+d.name;		
		var nID = "#id_"+cssStyleID(d.name);
		var selection = d3.select( nID );
		selection.classed("text-highlight", true);
        if (d.name)
        {
            showTerm(term_list, d.name);
        }	

	})
	.on("mouseout", function (d){
		/**
            add mouseover event on the row of the table.
		 */
		//var nID = "#id_"+d.name;		
		var nID = "#id_"+cssStyleID(d.name);
		var selection = d3.select( nID );
		selection.classed("text-highlight", false );
        if (d.name)
        {
            hideTerm(term_list, d.name);
        }
	});

	var totalData = _.values(cdata);
	totalData = _.flatten( totalData ) ;
	
	
	var end =  getCurrentTime(totalData);
	//drawClock(end) ; //draw clock on screen	
	
	if ( _.has(totalData[0], "week" ) && _.has(totalData[0], "day" ) && (typeof totalData !== 'undefined') )
	{
	
		var sumOfNewsByColumn = getSumOfNewsColumnWise(totalData); //key:timestamp, value: number of news
	
//		var colorScale = d3.scale.quantile()
//		.domain([0, buckets - 1, d3.max(totalData, function (d) { return d.numofnews })])
//		.range(colors);
		
//		var colorScale = d3.scale.quantile()
//		.domain([0, d3.max(totalData, function (d) { return d.numofnews })])
//		.range(colors);	
		
//		var colorScale = createlegendScale(totalData, colors );
		
        var maxNewsCount = 100;
        var colorScale = d3.scale.quantile()
        .domain([0, maxNewsCount])
        .range(colors); 
		
		var minVal = d3.min(_.compact(totalData), function (d) { return d.week }); //remove nulls and find min
		var maxVal = d3.max(_.compact(totalData), function (d) { return d.week }); //remove nulls and find max
		
		stotalData = _.sortBy(_.compact(totalData) , function(obj)
		{ 
			return  obj.week;
		});
	
		for (i = 0; i < rows.length; i++) 
		{
			var labels = rows[i].name;
			if (_.contains(term_list, labels))
			{
				var index = i+1;
				//var index = i;
				var classLabel = "#chart"+index;
				$(classLabel).css('height', ''+((height + margin.top + margin.bottom)/9.2)+'px'); //set height
				var svg = d3.select(classLabel).append("svg")
				//.attr("width", (width + margin.left + margin.right))
				.attr("width", (width + margin.right - widthOffset ))
				.attr("height", (height + margin.top + margin.bottom)/9.2)
				.append("g")
				.attr("transform", "translate(" + ((margin.left/10) + 25) + "," + margin.top/10 + ")");
		
		
				var realLabel =  rows[index % rows.length].name;
				
				if (_.has(cdata, realLabel )) 
				{
		
					/**
					 * handle the case of occluding rectangles based on duplicate data
					 * This code remove the occluding data when a data with zero number of news overlaps the heatmap with news. 
					 * The mouseover events works on the topmost rects. Now we have eliminated the topmost rect
					 */
					var data = cdata[realLabel ];
		
					data = _.sortBy(data , function(obj)
					{ 
						return -1 * obj.numofnews;
					});
		
		
					data = _.uniq(data , function(obj)
					{ 
						return (obj.week +""+ obj.day )   ; 
					});
					
					//sort by week to keep code in sync
					
					data = _.sortBy(data , function(obj)
					{ 
						return  obj.week;
					});
					
					var dayScale = d3.scale.linear().domain([1,7]).range([0,6]);
					
					
		
				
					if (i == 0) 
					{ 
						//add label here
						var classLabel = "#chart"+i;
						var svgDiv = d3.select(classLabel).append("svg")
						.attr("width", (width + margin.left + margin.right - widthOffset ))
						.attr("height", (height + margin.top + margin.bottom)/14)
						.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
						
						mapweeks=_.uniq(_.map(stotalData,function (d){
							return d.week; 		
						}) ); 
						
						var daysmap=svgDiv.selectAll(".daymap")
						.data(mapweeks)
			            .enter()
			            .append("text")
			     		    
						.attr("class", "daymap")
						.attr("id", function(d) 
						{					
							var timestampInMsec = parseInt(d) * 1000;
							var week = moment(timestampInMsec).utc().week();
							var year = moment(timestampInMsec).utc().year();
							var val = "id-"+week+"-"+year;
							return val;
						})
						.text(function(d) 
						{
							var timestampInMsec = parseInt(d) * 1000;
							var week = moment(timestampInMsec).utc().week();
							return "W"+week;
						})
						//.attr("y", function(d) { return Math.round( minuteScale(d.minute)) * gridSize ; })
						//.attr("x", function(d) { return (d.hour - minVal) * 24 * gridSize / (maxVal - minVal); })
		
						.attr("x", function(d, i) 
						{ 
							var timestampInMsec = parseInt(d) * 1000;  
							var week = moment(timestampInMsec).utc().week();
							var xVal ;
							if (( week%10) < 10) //length is 1
							{
								xVal = ((d - minVal) * 27 * gridSize / (maxVal - minVal)) ;
							}
		
							if (( week/10) >= 1) //length is 2
							{
								xVal = ((d - minVal) * 27 * gridSize / (maxVal - minVal)) - 5;
							}
							
							return xVal;
						})
		
						.attr("y", function(d, i) 
						{ 
							var output = 0;
							if (i%2 == 0)
							{
								output = -10;
							}
							return output;
						}
						);	
						//add event on x labels
						daysmap.on("mouseover", function(d) 
						{
							d3.select(this).classed("text-hover",true);		
					        div.transition()        
						        .duration(200)      
						        .style("opacity", .9);  							
						});
						
						daysmap.on("mousemove", function(d) 
						{
		
							var newsCount = sumOfNewsByColumn[d];			
							if ( (!_.isUndefined(newsCount) ) || (!_.isNull(newsCount) ) )
							{
								div .html(newsCount + "  news")  
								.style("left", (d3.event.pageX) + "px")     
								 .style("top", (d3.event.pageY - 28) + "px");  								
							} 
									
						});						
						daysmap.on("mouseout" , function(d) 
						{
							d3.select(this).classed("text-hover",false);
							
					        div.transition()        
					        .duration(500)      
					        .style("opacity", 0); 
					        
						});

						var monthlist = [];
								
						var monthsmap=svgDiv.selectAll(".monthmap")
						.data(mapweeks)
			            .enter()
			            .append("text")
			     		    
						.attr("class", "monthmap")
						.attr("id", function(d) 
						{					
							var timestampInMsec = parseInt(d) * 1000;
							var month = moment(timestampInMsec).utc().month();  						
							var valData = "top"+month;
							return valData;
						})
						.text(function(d) 
						{
							var timestampInMsec = parseInt(d) * 1000;
							var month = moment(timestampInMsec).utc().month();  
							monthlist.push(month);
							return months[month];
						})
						.style("text-anchor", "middle")
		
						.style("opacity", function(d, i)
						{
							var output;
							if (i < monthlist.length )
							{					
								output = (monthlist[i] === monthlist[i-1]) ? 0:1;					
							}										
							return output;
						})
						.attr("x", function(d, i) { return (d - minVal) * 27 * gridSize / (maxVal - minVal);})
						.attr("y", -30);
						
						preventOverlappingLabel(monthlist)
		
					}	
					
					
					var heatMap = svg.selectAll(".hour")
					.data(data)
					.enter().append("rect")
		            .attr("y", function(d) { return Math.round( dayScale(d.day)) * gridSize * 0.8 ; })
		            .attr("x", function(d) { return (d.week - minVal) * 27 * gridSize / (maxVal - minVal); })
		
					.attr("class", "hour bordered")
					.attr("timestamp", function(d) { return d.timerange; })
					.attr("identifier",  cssStyleID(realLabel))
					.attr("width", gridSize*0.7 )
					.attr("height", gridSize * 0.8 )
					.style("fill", colors[0]);
		
					
		
					var summarytooltip = d3.select("#summarytooltip"); //add tooltips
					svg.selectAll("rect")
					.on("mouseover", function(d, i) {
						d3.select(this).classed("cell-hover",true); //add a stroke on the rects
						/**
		                        add highlighting to the x axis label
						 */
						d3.selectAll(".daymap").classed("text-highlight",function(r,ri)
						{ 					
							if (r == d.week)
							{
								return true; 
							}
							else 
							{
								return false;
							}
						});
		
						//addInteractionFromHeatMapToTextWindow();
						var timeRangeStr = d.timerange;
						var ncurLabel = cssStyleID(realLabel);
						addInteractionFromHeatMapToTextWindow(ncurLabel, timeRangeStr);
		
					}) 
					
					.on("mousemove", function(d, i) {
						var timeRangeStr = d.timerange;
						var timeStampRange = timeRangeStr.split('-');
						var startTimeStamp = timeStampRange[0];
						var endTimeStamp = timeStampRange[1];
		
		//				var tz = jstz.determine(); // Determines the time zone of the browser client
		//				var timezone = tz.name(); //get timezone
						var startTimestampInMsec = parseInt(startTimeStamp) * 1000;
						var endTimestampInMsec = parseInt(endTimeStamp) * 1000;
		
		//				var startDate = moment(startTimestampInMsec).tz(timezone).format('lll'); ;  
		//				var endDate = moment(endTimestampInMsec).tz(timezone).format('lll'); ; 
						
						var startDate = moment(startTimestampInMsec).utc().format('lll'); ;  
						var endDate = moment(endTimestampInMsec).utc().format('lll'); ; 
						var numOfNews = d.numofnews;
		
						var pluralIndicator = (numOfNews > 1 ? "There are " : "");
						var currentTitleHTML = addTitleTooltip( listOfTitles[timeRangeStr] ); 
		
						summarytooltip
//						.style("left", ((width/2)+40) + "px")
//						.style("top", (margin.bottom) + "px")
		                .style("left", (d3.event.pageX - 180) + "px")     
		                .style("top", (d3.event.pageY + 20) + "px")
						.style("opacity", 1)
						.select("#value")
						.html(  pluralIndicator   + numOfNews + " news between "+startDate + " and "+ endDate + currentTitleHTML);	
					})
					
					.on("mouseout", function(d, i) {
		
						d3.select(this).classed("cell-hover",false); //remove a stroke on the rects
						d3.selectAll(".daymap").classed("text-highlight",function(r,ri)
						{ 
							return false;
		
						});
						summarytooltip.style("opacity", 0);
		
						//removing interaction from text window here
		//				if (!latest)
		//				{
							removeInteractionFromHeatMapToTextWindow();
		//				}
					})
					.on("click", function(d) {
						var timeRangeStr = d.timerange;
						if (d.numofnews> 0)
						{
							var boundObject = d3.select(this);
							var currentVal = d;
							getClickedObject( boundObject, currentVal ) 
							getNewsOnClick( timeRangeStr, realLabel );
						}
		
						
					});
					
					highlighHeatmap();			
					
					
					//heatMap.transition().ease("elastic").duration(3000)
//					heatMap.transition().duration(3000).ease("elastic")
//					.style("fill", function(d) { return colorScale(d.numofnews); });

					heatMap.style("fill", function(d) { return colorScale(d.numofnews); });

                    if (i == 0) 
                    {
                        //add legends after drawing the first chart
                       var svglegend=d3.select("#lowerContentlegend").append("svg")
                       
                            .attr("width", 300)
                .attr("height", 55)
                //.attr("transform", "translate(" + ((margin.left/10) + 25) + "," + margin.top/10 + ")");
                .attr("transform", "translate(" + (0) + "," + margin.top/10 + ")");
       
                        //var legend = bodySvg.selectAll(".legend")
                        var legend = svglegend.selectAll("g.legend")
                        .data([0].concat(colorScale.quantiles()), function(d) { return d; }); 
                        
                        legend
                        .enter()
                        .append("g")
                        .attr("class", "legend");
                        var noffset = 10;
        
                        legend.append("rect")
                        .attr("x", function(d, i) { return 2*legendElementWidth * i + noffset; })
                        .attr("y", (20))
                        .attr("width", 2*legendElementWidth)
                        .attr("height", gridSize)
                        .style("fill", function(d, i) { return colors[i]; });
        
                        legend.append("text")
                        .attr("class", "mono")
                        .text(function(d) { return "≥ " + Math.round(d); })
                        //.text(function(d) { return "≥ " + 2 * Math.round(d / 2); }) // even number
                        .attr("x", function(d, i) { return 2*legendElementWidth * i + noffset; })
                        .attr("y", (1.5 * 20) + gridSize);
                    }
				}				
			}

		}
		//addInteractionFromTextWindowToHeatMap(rows);
		
		//add scrolling effect from the text window to heatmap
		addScrollingEffectsFromTextWindowToHeatMap(rows);		
	
		addHighlightToRowLabel(ylabelCountList);
	}
	//$("#table-1").append('<tr class="icon"><td><img id="addbutton" src="images/addbutton.png" alt="Smiley face" height="30" width="30"></td></tr>');
	//$("#table-1").append('<tr><td> <img id="addbutton" src="images/addbutton.png" alt="Smiley face" height="30" width="30"> </img>  </td></tr>');
	
	//$( "#addbutton" ).hide();
	if (removeTerm.length)
	{
		$("#table-1").append('<tr class="icon"><td><img id="addbutton" src="images/addbutton.png" alt="Smiley face" height="30" width="30"></td></tr>');		
	}
	
	$("#table-1 .sorter:first img").hide()
	
//	removeMouseEventFromImag()
	$("#table-1  td:first").prepend('<h4> Group </h4>');
	createHistogramDocument(facetData)

	facetInteraction();
	
	persistTermHighlighting(); //allows for term highlighting across frames
	
	addEntityTooltipForTable();
}


function createHeatMapChartMonthvsWeek(vdata)
{
	/**
	 *  Month vs Week
	 */
	$("svg").remove();//remove all svg
	$( "#datatable" ).empty();
	
	var gridSize;
	var hourScale;
	
	var div = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);	
	
	var widthOffset = 470;
	
	var cdata = vdata["heat_map"];
	var ylabelCountList = vdata["topic_count"];
	var listOfTitles = vdata["titleData"];
	
	var facetData = vdata[ "facets"];
	createFacetDocument(facetData)

	var term_list = _.keys(cdata) ;
	term_list.unshift(""); //add empty element ot he beginning of the array

	//remove the delete term

	var removeTerm = [];
	
	for (var i = 0; i < remoteTermIndexArr.length; i++) {
	    var termindex  = remoteTermIndexArr[i];
	    var term = term_list[termindex];
	    removeTerm.push(term);
	}
	
	removeTerm = _.uniq(removeTerm) ;
	term_list = _.difference(term_list, removeTerm) ;
	
	currentTermList = term_list;
	
	var rows = []

	var labels = [];
	for (var i = 0; i < term_list.length ; i++) {
		var temp = {};
		temp["name"] = term_list[i].trim();
		rows.push(temp );
	}	

	var offset = 48;
	var margin = { top: 50, right: 0, bottom: 100, left: 30 }
	width = (960 - margin.left - margin.right- offset),
	height = (700 - margin.top - margin.bottom);
	gridSize = Math.floor(width / (24*3));
	legendElementWidth = gridSize*2;
	buckets = 10;


	//var colors = ["#FFFFFF", "#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"]; 
	var colors = ["#FFFFFF",  "#deebf7",  "#9ecae1", "#4292c6",  "#08519c", "#08306b"]; 
	var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


	$( "body svg" ).not('#control svg').remove(); //not the time clock
	var bodyDiv = d3.select("body");
	var bodySvg = bodyDiv.append("svg")
	.attr("class", "mainwindow") 
	.attr("width", width*2)
	.attr("height", height*2);

	var tooltip = bodyDiv.append("div")
	.style("position", "absolute")
	.style("visibility", "hidden");

	var table = d3.select("#datatable").append("table");
//	thead = table.append("thead");
	table.attr("id","table-1" )
	tbody = table.append("tbody");




	var tr = tbody.selectAll("tr")
	.data(rows)
	.enter()
	.append("tr");
	
	
    var buttonColumn = tr.append("tr");
    buttonColumn.append("div")
    .attr("id", function (d,i){
      return "button"+i; 
    })
    .attr("class", "removebutton")
    //.html('<img src="images/delete.png" alt="Smiley face" height="10" width="10">');
    .html('<img src="images/nndelete1.png" alt="Smiley face" height="10" width="10">');

    
    
	var td = buttonColumn.selectAll("td")
	.data(function(d) { return [d.name]; })
	.enter()
	.append("td")
	.text(function(d) { return d; }) 
	.attr("id", function (d,i){
		return "id_"+cssStyleID(d); 
		
	})
	;

	tr.append("td")
	.append("div")
	.attr("id", function (d,i){
		return "chart"+i; 
	})
	.attr("width", width + "px");

	/**
          add interaction on the rows of the table to highlight the row label
	 */

	tr.on("mouseover", function (d){
		/**
            add mouseover event on the row of the table.
		 */
		//var nID = "#id_"+d.name;		
		var nID = "#id_"+cssStyleID(d.name);
		var selection = d3.select( nID );
		selection.classed("text-highlight", true);
		

        if (d.name)
        {
            showTerm(term_list, d.name);
        }
	

	})
	.on("mouseout", function (d){
		/**
            add mouseover event on the row of the table.
		 */
		//var nID = "#id_"+d.name;		
		var nID = "#id_"+cssStyleID(d.name);
		var selection = d3.select( nID );
		selection.classed("text-highlight", false );
		
        if (d.name)
        {
            hideTerm(term_list, d.name);
        }

	});

	var totalData = _.values(cdata);
	totalData = _.flatten( totalData ) ;
	
	var end =  getCurrentTime(totalData);
	//drawClock(end) ; //draw clock on screen	
	
	if ( _.has(totalData[0], "month" ) && _.has(totalData[0], "week" ) && (typeof totalData !== 'undefined') )
	{
	
		var sumOfNewsByColumn = getSumOfNewsColumnWise(totalData); //key:timestamp, value: number of news
	
//		var colorScale = d3.scale.quantile()
//		.domain([0, buckets - 1, d3.max(totalData, function (d) { return d.numofnews })])
//		.range(colors);

//		var colorScale = d3.scale.quantile()
//		.domain([0, d3.max(totalData, function (d) { return d.numofnews })])
//		.range(colors);		
		
//		var colorScale = createlegendScale(totalData, colors );
		var maxNewsCount = 100;
        var colorScale = d3.scale.quantile()
        .domain([0, maxNewsCount])
        .range(colors); 
		
		var minVal = d3.min(_.compact(totalData), function (d) { return d.month }); //remove nulls and find min
		var maxVal = d3.max(_.compact(totalData), function (d) { return d.month }); //remove nulls and find max
		
		stotalData = _.sortBy(_.compact(totalData) , function(obj)
		{ 
			return  obj.month;
		});
		
		
		var minWeekVal = d3.min(_.compact(stotalData), function (d) { return d.week }); //remove nulls and find min
		var maxWeekVal = d3.max(_.compact(stotalData), function (d) { return d.week }); //remove nulls and find max
	
		var weekScale = d3.scale.linear().domain([ minWeekVal, maxWeekVal ]).range([0,4]);
	
		for (i = 0; i < rows.length; i++) 
		{
			var labels = rows[i].name;
			if (_.contains(term_list, labels))
			{
				var index = i+1;
				//var index = i;
				var classLabel = "#chart"+index;
				$(classLabel).css('height', ''+((height + margin.top + margin.bottom)/13)+'px'); //set height
				var svg = d3.select(classLabel).append("svg")
				//.attr("width", (width + margin.left + margin.right))
				.attr("width", (width + margin.right - widthOffset ))
				.attr("height", (height + margin.top + margin.bottom)/13)
				.append("g")
				.attr("transform", "translate(" + ((margin.left/10) + 25) + "," + margin.top/10 + ")");
		
		
				var realLabel =  rows[index % rows.length].name;
				
				if (_.has(cdata, realLabel )) 
				{
		
					/**
					 * handle the case of occluding rectangles based on duplicate data
					 * This code remove the occluding data when a data with zero number of news overlaps the heatmap with news. 
					 * The mouseover events works on the topmost rects. Now we have eliminated the topmost rect
					 */
					var data = cdata[realLabel ];
		
					data = _.sortBy(data , function(obj)
					{ 
						return -1 * obj.numofnews;
					});
		
		
					data = _.uniq(data , function(obj)
					{ 
						return (obj.month +""+ obj.week )   ; 
					});
					
					//sort by week to keep code in sync
					
					data = _.sortBy(data , function(obj)
					{ 
						return  obj.month;
					});
		
		
		
		
					
					if (i == 0) 
					{ 
						//add label here
						var classLabel = "#chart"+i;
						var svgDiv = d3.select(classLabel).append("svg")
						.attr("width", (width + margin.left + margin.right - widthOffset ))
						.attr("height", (height + margin.top + margin.bottom)/13)
						.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
						
		//				mapweeks=_.uniq(_.map(stotalData,function (d){
		//					return d.week; 		
		//				}) ); 
						
						var daysmap=svgDiv.selectAll(".daymap")
						.data(stotalData)
			            .enter()
			            .append("text")
			     		    
						.attr("class", "daymap")
						.attr("id", function(d) 
						{					
							var timestampInMsec = parseInt(d.week) * 1000;
							var month = moment(timestampInMsec).utc().month();  
							var year = moment(timestampInMsec).utc().year();
							return "id-"+ year +"-"+ month;
						})
						.text(function(d) 
						{
//							var timestampInMsec = parseInt(d.week) * 1000;
//							var month = moment(timestampInMsec).utc().month(); 
//							return months[month];
							
							var timestampInMsec = parseInt(d.week) * 1000;
							var year = moment(timestampInMsec).utc().year();
							
							
							var monthIndex = d.month / year;
							return months[monthIndex - 1];

							
						})
						
						
						//.attr("y", function(d) { return Math.round( minuteScale(d.minute)) * gridSize ; })
						//.attr("x", function(d) { return (d.hour - minVal) * 24 * gridSize / (maxVal - minVal); })
		
						.attr("x", function(d, i) 
						{ 
							var xVal = ((d.month - minVal) * 27 * gridSize / (maxVal - minVal)) - 5;	
							return xVal;
						})
		
						.attr("y", function(d, i) 
						{ 
							var output = 0;
		//					if (i%2 == 0)
		//					{
		//						output = -10;
		//					}
		
							return output;
						}
						);	
						
						
		//				daysmap.sort(function (a, b) 
		//				{ // select the parent and sort the path's
		//					
		//
		//					
		//					if ((a.week != b.week) && (a.month != b.month) )
		//				    {
		//						var month = moment(a.week).utc().month();  
		//						var year = moment(a.week).utc().year();
		//						var id =  "#id-"+ year +"-"+ month;
		//						d3.select(id).style("opacity", 0);
		//				    }
		//
		//				  });
					
						//add event on x labels
						daysmap.on("mouseover", function(d) 
						{
							d3.select(this).classed("text-hover",true);		
					        div.transition()        
						        .duration(200)      
						        .style("opacity", .9);  							
						});
						
						daysmap.on("mousemove", function(d) 
						{
		
							var newsCount = sumOfNewsByColumn[d];			
							if ( (!_.isUndefined(newsCount) ) || (!_.isNull(newsCount) ) )
							{
								div .html(newsCount + "  news")  
								.style("left", (d3.event.pageX) + "px")     
								 .style("top", (d3.event.pageY - 28) + "px");  								
							}  
									
						});						
						daysmap.on("mouseout" , function(d) 
						{
							d3.select(this).classed("text-hover",false);
							
					        div.transition()        
					        .duration(500)      
					        .style("opacity", 0); 
					        
						});
						var yearData = []
						var yearlist = [];
								
						var monthsmap=svgDiv.selectAll(".monthmap")
						.data(stotalData)
			            .enter()
			            .append("text")
			     		    
						.attr("class", "monthmap")
						.attr("id", function(d) 
						{					
							var timestampInMsec = parseInt(d.week) * 1000;
							var year = moment(timestampInMsec).utc().year();
							var valData = "top"+year;
							return valData;
						})
						.text(function(d) 
						{
							var timestampInMsec = parseInt(d.week) * 1000;
							var year = moment(timestampInMsec).utc().year();  
							yearlist.push(year);
							return year;
						})
						.style("text-anchor", "middle")
		
						.style("opacity", function(d, i)
						{
							var output;
							if (i < yearlist.length )
							{					
								output = (yearlist[i] === yearlist[i-1]) ? 0:1;					
							}										
							return output;
						})
						.attr("x", function(d, i) { return (d.month - minVal) * 27 * gridSize / (maxVal - minVal);})
						.attr("y", -30);
						  
						preventOverlappingLabel(yearlist)
		
					}				
					
					
					
					var heatMap = svg.selectAll(".hour")
					.data(data)
					.enter().append("rect")
		            .attr("y", function(d) { return Math.round( weekScale(d.week)) * gridSize ; })
		            .attr("x", function(d) { return (d.month - minVal) * 27 * gridSize / (maxVal - minVal); })
		
					.attr("class", "hour bordered")
					.attr("timestamp", function(d) { return d.timerange; })
					.attr("identifier",  cssStyleID(realLabel))
					.attr("width", gridSize*0.7 )
					.attr("height", gridSize )
					.style("fill", colors[0]);
		
					
		
					var summarytooltip = d3.select("#summarytooltip"); //add tooltips
					svg.selectAll("rect")
					.on("mouseover", function(d, i) {
						d3.select(this).classed("cell-hover",true); //add a stroke on the rects
						/**
		                        add highlighting to the x axis label
						 */
						d3.selectAll(".daymap").classed("text-highlight",function(r,ri)
						{ 					
							if (r == d.month)
							{
								return true; 
							}
							else 
							{
								return false;
							}
						});
						var timeRangeStr = d.timerange;
						var ncurLabel = cssStyleID(realLabel);
						addInteractionFromHeatMapToTextWindow(ncurLabel, timeRangeStr);
		
					})   

					.on("mousemove", function(d, i) {
						var timeRangeStr = d.timerange;
						var timeStampRange = timeRangeStr.split('-');
						var startTimeStamp = timeStampRange[0];
						var endTimeStamp = timeStampRange[1];
		
		//				var tz = jstz.determine(); // Determines the time zone of the browser client
		//				var timezone = tz.name(); //get timezone
						var startTimestampInMsec = parseInt(startTimeStamp) * 1000;
						var endTimestampInMsec = parseInt(endTimeStamp) * 1000;
		
		//				var startDate = moment(startTimestampInMsec).tz(timezone).format('lll'); ;  
		//				var endDate = moment(endTimestampInMsec).tz(timezone).format('lll'); ; 
						
						var startDate = moment(startTimestampInMsec).utc().format('lll'); ;  
						var endDate = moment(endTimestampInMsec).utc().format('lll'); ; 
						var numOfNews = d.numofnews;
		
						var pluralIndicator = (numOfNews > 1 ? "There are " : "");
						var currentTitleHTML = addTitleTooltip( listOfTitles[timeRangeStr] ); 
		
						summarytooltip
//						.style("left", ((width/2)+40) + "px")
//						.style("top", (margin.bottom) + "px")
		                .style("left", (d3.event.pageX - 180) + "px")     
		                .style("top", (d3.event.pageY + 20) + "px")
						.style("opacity", 1)
						.select("#value")
						.html(  pluralIndicator   + numOfNews + " news between "+startDate + " and "+ endDate + currentTitleHTML);					
						
					})
					
					.on("mouseout", function(d, i) {
		
						d3.select(this).classed("cell-hover",false); //remove a stroke on the rects
						d3.selectAll(".daymap").classed("text-highlight",function(r,ri)
						{ 
							return false;
		
						});
						summarytooltip.style("opacity", 0);
		
						//removing interaction from text window here
		//				if (!latest)
		//				{
							removeInteractionFromHeatMapToTextWindow();
		//				}
					})
					.on("click", function(d) {
						var timeRangeStr = d.timerange;
						if (d.numofnews> 0)
						{
							var boundObject = d3.select(this);
							var currentVal = d;
							getClickedObject( boundObject, currentVal ) 
							getNewsOnClick( timeRangeStr, realLabel );
						}
		
						
					});
					
					highlighHeatmap();		
					
					
					//heatMap.transition().duration(3000)
//					heatMap.transition().duration(3000).ease("elastic")
//					.style("fill", function(d) { return colorScale(d.numofnews); });

					heatMap.style("fill", function(d) { return colorScale(d.numofnews); });

                    if (i == 0) 
                    {
                        //add legends after drawing the first chart
                       var svglegend=d3.select("#lowerContentlegend").append("svg")
                       
                            .attr("width", 300)
                .attr("height", 55)
                //.attr("transform", "translate(" + ((margin.left/10) + 25) + "," + margin.top/10 + ")");
                .attr("transform", "translate(" + (0) + "," + margin.top/10 + ")");
       
                        //var legend = bodySvg.selectAll(".legend")
                        var legend = svglegend.selectAll("g.legend")
                        .data([0].concat(colorScale.quantiles()), function(d) { return d; }); 
                        
                        legend
                        .enter()
                        .append("g")
                        .attr("class", "legend");
                        var noffset = 10;
        
                        legend.append("rect")
                        .attr("x", function(d, i) { return 2*legendElementWidth * i + noffset; })
                        .attr("y", (20))
                        .attr("width", 2*legendElementWidth)
                        .attr("height", gridSize)
                        .style("fill", function(d, i) { return colors[i]; });
        
                        legend.append("text")
                        .attr("class", "mono")
                        .text(function(d) { return "≥ " + Math.round(d); })
                        //.text(function(d) { return "≥ " + 2 * Math.round(d / 2); }) // even number
                        .attr("x", function(d, i) { return 2*legendElementWidth * i + noffset; })
                        .attr("y", (1.5 * 20) + gridSize);
                    }
				}				
			}

		}
		//addInteractionFromTextWindowToHeatMap(rows);
		
		//add scrolling effect from the text window to heatmap
		addScrollingEffectsFromTextWindowToHeatMap(rows);		
	
		addHighlightToRowLabel(ylabelCountList);
	}
	
	//$("#table-1").append('<tr class="icon"><td><img id="addbutton" src="images/addbutton.png" alt="Smiley face" height="30" width="30"></td></tr>');
	//$("#table-1").append('<tr><td> <img id="addbutton" src="images/addbutton.png" alt="Smiley face" height="30" width="30"> </img>  </td></tr>');
	//$( "#addbutton" ).hide();
	
	if (removeTerm.length)
	{
		$("#table-1").append('<tr class="icon"><td><img id="addbutton" src="images/addbutton.png" alt="Smiley face" height="30" width="30"></td></tr>');		
	}
	//$("#table-1 .sorter:first img").hide()
	
//	removeMouseEventFromImag();
	$("#table-1  td:first").prepend('<h4> Group </h4>');
	createHistogramDocument(facetData)

	facetInteraction();
	
	persistTermHighlighting(); //allows for term highlighting across frames
	
	addEntityTooltipForTable();
}




//function removeMouseEventFromImag()
//{
////	$.each($('#table-1 .sorter'), function () {
////	    $(this).removeAttr('onmouseover');
////	    $(this).removeAttr('onmouseout');
////	});
////	
////	
//	$('img')
//    .unbind('mouseover')               //remove events attached with bind
//    .off('mouseover')                  //remove events attached with on
//    .die('mouseover');                 //remove events attached with live
//
//	
//}



function convertIDtoKey(str)
{
	/**
	 * convert css ID to array key
	 */
	var arr = str.split("-");
	var output = arr.join(" ");
	return output;
	
}



function addHighlightToRowLabel(ylabelCountList)
{
	/**
     *     add highlighting to the row label on a click event
	 */
	
	var div = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);	
	
	var termSelection = d3.selectAll("tbody td");

	termSelection.on("mouseover", function ()
	{
		var currentid = d3.select(this).attr("id");
		if( currentid  ) 
		{           
			var nID = "#"+currentid;
			var selection = d3.selectAll( nID );
			//selection.classed("text-highlight", false) ;
			selection.classed("text-hover", true);
			
			var curID = currentid.split("_");
			
			var name = convertIDtoKey(curID[1]);
		
			
			
			var newsCount = ylabelCountList[name]
			
			if ( !_.isUndefined(newsCount)  )
			{			
		        div.transition()        
			        .duration(200)      
			        .style("opacity", .9);  
		        
			    div .html(newsCount + "  news")  
			        .style("left", (d3.event.pageX - 30) + "px")     
			        .style("top",  (d3.event.pageY + 10) + "px");  
		    }	
		}
	});

	termSelection.on("mouseout", function ()
	{
		var currentid = d3.select(this).attr("id");
		if( currentid  ) 
		{
			var nID = "#"+currentid;
			var selection = d3.selectAll( nID );
			selection.classed("text-hover", false);		
			
	        div.transition()        
		        .duration(500)      
		        .style("opacity", 0); 
	        
		}   
	});       
}


function getNewsOnClick(time_range_string, term )
{
	
	var ajax = new Array();
	var processID = getRandomInt( MINVAL, MAXVAL );
	var ajaxindex = time_range_string+"-"+ term+"-"+processID;

	
	ajax[ ajaxindex] = new XMLHttpRequest();
	ajax[ ajaxindex].id=ajaxindex; 
	
	$( "#textWindow" ).hide(); //hide the text window

	ajax[ ajaxindex].onreadystatechange = function () 
	{
		if (ajax[ ajaxindex].readyState == 4 && ajax[ ajaxindex].status == 200) 
		{

			var news_html = ajax[ ajaxindex].responseText;
			if( news_html != null)
			{
				var news_window = document.getElementById("lowerContentTextWindow"); // get the compressed tweets DIV
				news_window.innerHTML = news_html; 
				$( "#textWindow" ).show();
				//add local time to the text window
				
				//$('.expander').simpleexpand();
				$('.expander').simpleexpand();
				addLocalDateToTextWindow();
				//add interaction from the text window to the heat map
				//addInteractionFromTextWindowToHeatMap();
				//add related news to the news window in a collapsible div
				//addRelatedNewsToTextWindow();
				//add time to related news
				//addLocalDateToRelatedNewsTextWindow();
				
				if( typeof elmnt === 'undefined' || elmnt === null )
				{
					
				}
				else
				{
					getRelatednewsID(elmnt);
				}
				
				//allow the scroll to begin at the top of the window
				$("#lowerContentTextWindow").scrollTop(0);
			}
			
		}
	}
	var param = "timerange=" + encodeURIComponent(time_range_string)+ "&term=" + encodeURIComponent(term);

	ajax[ ajaxindex].open("POST", "newdisplayNews.php" , true);
	ajax[ ajaxindex].setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	ajax[ ajaxindex].send(param);
}


function addInteractionFromHeatMapToTextWindow(label, timerange)
{
	var startTimeStamp = timerange.split('-')[0]; 
	var endTimeStamp = timerange.split('-')[1]; 
	
	var nodes = document.getElementById('lowerContentTextWindow').childNodes;

	for(var i=0; i<nodes.length; i++) 
	{
		var currentID = nodes[i].id;
		if(currentID)
		{
			var cssID = "#"+currentID;
			var currentTimeStamp = cssID.split('_')[2];
			var currentLabel = cssID.split('_')[3];

			if ( ( currentTimeStamp >= startTimeStamp ) &&  ( currentTimeStamp <= endTimeStamp ) ) //handle the time extents
			{
				if (label == currentLabel  ) //handle the label
				{
					$(cssID).find('.newsText').addClass("termDiv");
				}
			}
			
		}
	}

}



function removeInteractionFromHeatMapToTextWindow()
{
	var nodes = document.getElementById('lowerContentTextWindow').childNodes;
	for(var i=0; i<nodes.length; i++) 
	{
		var currentID = nodes[i].id;
		if(currentID)
		{
			var cssID = "#"+currentID;
			$(cssID).find('.newsText').removeClass("termDiv");
		}
	}
}



//function addRelatedNewsToTextWindow()
//{
//	var nodes = document.getElementById('lowerContentTextWindow').childNodes;
//
//	for(var i=0; i<nodes.length; i++) 
//	{
//		var currentID = nodes[i].id;
//		if(currentID)
//		{
//			//$uuid = 'id_'.$uuid.'_'.$unix_timestamp.'_'.$week_day.'_'.$md5Val.'_'.$str;
//			var cssID = "#"+currentID;
//			var currentTimeStamp = cssID.split('_')[2];
//			var md5hash = cssID.split('_')[4];  
//			/*
//			 * set time range to 10 days interval
//			 */
//			var currentTimeStampInt = parseInt(currentTimeStamp);
//			var earlierTimeStampInt = currentTimeStampInt - (5 * 24 * 3600);
//
//			var time_range_string = earlierTimeStampInt + "-"+ currentTimeStampInt;
//
//			var relatedDiv = "#related" + currentID;
//			
//			$(relatedDiv +" > a").on('click', function () 
//			{
//				getRelatedNewsOnAjax(time_range_string, md5hash, cssID );
//				
//			});
//		}
//	}
//}
//
//
//
//function getRelatedNewsOnAjax(time_range_string, hash, cssID )
//{
//	var ajax = new Array();
//	var processID = getRandomInt( MINVAL, MAXVAL );
//	var ajaxindex = time_range_string+"-"+ hash+"-"+processID;
//
//	
//	ajax[ ajaxindex] = new XMLHttpRequest();
//	ajax[ ajaxindex].id=ajaxindex; 
//	
//	ajax[ ajaxindex].onreadystatechange = function () 
//	{
//		if (ajax[ ajaxindex].readyState == 4 && ajax[ ajaxindex].status == 200) 
//		{
//			var relatedNewsHtml = ajax[ ajaxindex].responseText;
//			if( relatedNewsHtml != null)	
//			{
//				var currentID = cssID.substring(1);
//				var relatedDiv = "#related" + currentID;
//				 $(relatedDiv).find('.content').append( relatedNewsHtml );
//			}
//		}
//	}
//
//
//	var param = "timerange=" + encodeURIComponent(time_range_string) + "&hash=" + encodeURIComponent(hash);
//
//	ajax[ ajaxindex].open("POST", "relatedNews.php" , true);
//	ajax[ ajaxindex].setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
//	ajax[ ajaxindex].send(param);
//}

function getRelatednewsID(elmnt)
{
	var currentnewsID = elmnt.getAttribute("data-id") ;
	//fire an ajax call to get the news window
	addRelatedNews(currentnewsID);	

}

function addRelatedNews(currentID)
{

	//$uuid = 'id_'.$uuid.'_'.$unix_timestamp.'_'.$week_day.'_'.$md5Val.'_'.$str;
	var cssID = "#"+currentID;
	var currentTimeStamp = cssID.split('_')[2];
	var md5hash = cssID.split('_')[4];  
	/*
	 * set time range to 15 days interval
	 */
	var currentTimeStampInt = parseInt(currentTimeStamp);
	var earlierTimeStampInt = currentTimeStampInt - (15 * 24 * 3600);

	var time_range_string = earlierTimeStampInt + "-"+ currentTimeStampInt;

	var relatedDiv = "#related" + currentID;

	getRelatedNewsOnAjax(time_range_string, md5hash, cssID );


}



function getRelatedNewsOnAjax(time_range_string, hash, cssID )
{
	var ajax = new Array();
	var processID = getRandomInt( MINVAL, MAXVAL );
	var ajaxindex = time_range_string+"-"+ hash+"-"+processID;

	
	ajax[ ajaxindex] = new XMLHttpRequest();
	ajax[ ajaxindex].id=ajaxindex; 
	
	ajax[ ajaxindex].onreadystatechange = function () 
	{
		var currentID = cssID.substring(1);
		var relatedDiv = "#related" + currentID;	
		var errorMessage = "<h3> There is no news related to the current news. </h3>"
		if (ajax[ ajaxindex].readyState == 4 && ajax[ ajaxindex].status == 200) 
		{
			var relatedNewsHtml = ajax[ ajaxindex].responseText;
			if( relatedNewsHtml != null)	
			{
				 $(relatedDiv).find('.content').append( relatedNewsHtml );
			}
			else
			{
				$(relatedDiv).find('.content').append( errorMessage );
			}
		}
		else
		{
			if ( ajax[ ajaxindex].status == 500 )
			{
				/**
				 * server issues
				 */
				$(relatedDiv).find('.content').append( errorMessage );			
			}
			
		}
	}


	var param = "timerange=" + encodeURIComponent(time_range_string) + "&hash=" + encodeURIComponent(hash);

	ajax[ ajaxindex].open("POST", "relatedNews.php" , true);
	ajax[ ajaxindex].setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	ajax[ ajaxindex].send(param);
}




function addEntityHighlightingFromTextWindow(cssID)
{
	/**
	 * add text highlighting of named entity in the news window
	 */
	var named_entityStr= cssID.split('_')[5];
	var entityArr = named_entityStr.split("-");
	
	var selectedID = cssID+ " " + ".newsText p";
	for (var ind = 0; ind < entityArr.length; ind++) 
	{
		var curEntity = entityArr[ind];
		if (curEntity.length > 3)
		{
			$(selectedID).highlight(curEntity);
		}
		
	}
	
	
	$(cssID ).scrollProgress(); //add scrolling progress indicator

}


function addLocalDateToRelatedNewsTextWindow()
{
	var nodes = document.getElementById('lowerContentTextWindow').childNodes;

	for(var i=0; i<nodes.length; i++) 
	{
		var currentID = nodes[i].id;
		if(currentID)
		{
			var cssID = "#"+currentID;
			var currentTimeStamp = cssID.split('_')[2];
			currentTimeStamp = parseInt(currentTimeStamp);

			var tz = jstz.determine(); // Determines the time zone of the browser client
			var timezone = tz.name(); //get timezone
			var currentTimestampInMsec = currentTimeStamp * 1000;

			var htmlDate = moment(currentTimestampInMsec).tz(timezone).format('lll');   
			//var htmlDate = "<p>10:15:21    10,Mar 2014</p>";
			htmlDate = "<p>" + htmlDate + "</p>";
			var relatednewsID = "#relatedNews"+currentID;
			$(relatednewsID).find('.newsDate').append(htmlDate);

		}
	}

}



function addLocalDateToTextWindow()
{
	var nodes = document.getElementById('lowerContentTextWindow').childNodes;

	for(var i=0; i<nodes.length; i++) 
	{
		var currentID = nodes[i].id;
		if(currentID)
		{
			var cssID = "#"+currentID;
			var currentTimeStamp = cssID.split('_')[2];
			currentTimeStamp = parseInt(currentTimeStamp);

//			var tz = jstz.determine(); // Determines the time zone of the browser client
//			var timezone = tz.name(); //get timezone
			var currentTimestampInMsec = currentTimeStamp * 1000;

//			var htmlDate = moment(currentTimestampInMsec).tz(timezone).format('lll');   
			var htmlDate = moment(currentTimestampInMsec).utc().format('lll');
			
			//var htmlDate = "<p>10:15:21    10,Mar 2014</p>";
			htmlDate = "<p>" + htmlDate + "</p>";
			$(cssID).find('.newsDate').append(htmlDate);
			
			//add the named entity highlighting in the text window
			
			//addEntityHighlightingFromTextWindow(cssID);

		}
	}

}




function addInteractionFromTextWindowToHeatMap(rows)
{
	//$uuid = 'id_'.$uuid.'_'.$unix_timestamp.'_'.$newLabel.'_'.$md5Val.'_'.$str;
	
	var nodes = document.getElementById('lowerContentTextWindow').childNodes;

	for(var i=0; i<nodes.length; i++) 
	{
		var currentID = nodes[i].id;
		if(currentID)
		{
			var cssID = "#"+currentID;
			var currentTimeStamp = cssID.split('_')[2];
			currentTimeStamp = parseInt(currentTimeStamp);
			var labelFromID = cssID.split('_')[3];

			var pTextSection = d3.select("#lowerContentTextWindow").select(cssID).select(".newsText");
			pTextSection.on("mouseover", function (d)
			{
				//add interaction from text window to heatmap cells	
				

				for (var ind = 1; ind < rows.length; ind++) 
				{
					var divID = "#chart"+ind;
					var svg = d3.select(divID).selectAll('div > svg');
					var rectObj = svg.selectAll("rect");
					rectObj.each(function(d) 
					{
						var timerange = this.attributes.timestamp.textContent;
						var startTimeStamp = timerange.split('-')[0]; 
						var endTimeStamp = timerange.split('-')[1]; 
						startTimeStamp = parseInt(startTimeStamp); 
						endTimeStamp = parseInt(endTimeStamp);


						var labelName = this.attributes.identifier.textContent;	

						var curLabel = cssStyleID(rows[ind].name);
						if ( ( currentTimeStamp >= startTimeStamp ) &&  ( currentTimeStamp <= endTimeStamp ) )
						{						
							if ( (curLabel == labelName) && (d.numofnews > 0) )	
							{
								d3.select(this).classed("cell-hover",true);	

								//add interaction to y- axis label	
								
								var nID = "#id_"+ curLabel;
								var selection = d3.select( nID );
								selection.classed("text-highlight", true)	;

								//add interaction to x- axis label

								var timestampInMsec = currentTimeStamp * 1000;
								var day = moment(timestampInMsec).utc().format("D");  
								var month = moment(timestampInMsec).utc().month();  
								var hour = moment(timestampInMsec).utc().hour();  
								var week = moment(timestampInMsec).utc().week();
								var year = moment(timestampInMsec).utc().year();
								
								var dID = "#id-"+month+"-"+day;
								var selection = d3.select( dID );
								selection.classed("text-highlight", true)	;
								
								var dID1 = "#id-"+day+"-"+hour;
								var selection1 = d3.select( dID1 );
								selection1.classed("text-highlight", true)	;
								
								var dID2 = "#id-"+week+"-"+year;
								var selection2 = d3.select( dID2 );
								selection2.classed("text-highlight", true)	;
								
								var dID3 = "#id-"+ year +"-"+ month;
								var selection3 = d3.select( dID3 );
								selection3.classed("text-highlight", true)	;


							}
							else
							{
								d3.select(this).classed("cell-hover",false);		

								//remove interaction to y- axis label							
								var curLabel = cssStyleID(rows[ind].name);
								var nID = "#id_"+ curLabel;
								var selection = d3.select( nID );
								selection.classed("text-highlight", false)

								//add interaction to x- axis label

//								var timestampInMsec = currentTimeStamp * 1000;
//								var day = moment(timestampInMsec).utc().format("D");  
//								var month = moment(timestampInMsec).utc().month();  
//								var dID = "#id-"+month+"-"+day;
//								
//								var selection = d3.selectAll( dID );
//								selection.classed("text-highlight", false)	;
								
								var timestampInMsec = currentTimeStamp * 1000;
								var day = moment(timestampInMsec).utc().format("D");  
								var month = moment(timestampInMsec).utc().month();  
								var hour = moment(timestampInMsec).utc().hour();  
								var week = moment(timestampInMsec).utc().week();
								var year = moment(timestampInMsec).utc().year();
								
								var dID = "#id-"+month+"-"+day;
								var selection = d3.select( dID );
								selection.classed("text-highlight", false)	;
								
								var dID1 = "#id-"+day+"-"+hour;
								var selection1 = d3.select( dID1 );
								selection1.classed("text-highlight", false)	;
								
								var dID2 = "#id-"+week+"-"+year;
								var selection2 = d3.select( dID2 );
								selection2.classed("text-highlight", false)	;
								
								var dID3 = "#id-"+ year +"-"+ month;
								var selection3 = d3.select( dID3 );
								selection3.classed("text-highlight", false)	;
							}		
						}
					});	
				}

			});
			pTextSection.on("mouseout", function ()
			{
				//remove interaction from text window to heatmap cells			
				for (var ind = 1; ind < rows.length; ind++) 
				{
					var divID = "#chart"+ind;
					var svg = d3.select(divID).selectAll('div > svg');
					var rectObj = svg.selectAll("rect");
					rectObj.each(function(d) {
						var timerange = this.attributes.timestamp.textContent;
						var startTimeStamp = timerange.split('-')[0]; 
						var endTimeStamp = timerange.split('-')[1]; 
						startTimeStamp = parseInt(startTimeStamp); 
						endTimeStamp = parseInt(endTimeStamp);

						var labelName = this.attributes.identifier.textContent;
						var curLabel = cssStyleID(rows[ind].name);

						
						if ( (curLabel == labelName) &&  ( currentTimeStamp > startTimeStamp ) &&  ( currentTimeStamp < endTimeStamp ) )						
						{
							d3.select(this).classed("cell-hover",false);		

							//remove interaction to y- axis label							
							var curLabel = cssStyleID(rows[ind].name);
							var nID = "#id_"+ curLabel;
							var selection = d3.select( nID );
							selection.classed("text-highlight", false)

							//add interaction to x- axis label

//							var timestampInMsec = currentTimeStamp * 1000;
//							var day = moment(timestampInMsec).utc().format("D");  
//							var month = moment(timestampInMsec).utc().month();  
//							var dID = "#id-"+month+"-"+day;
//							
//							var selection = d3.selectAll( dID );
//							selection.classed("text-highlight", false)	;
							
							var timestampInMsec = currentTimeStamp * 1000;
							var day = moment(timestampInMsec).utc().format("D");  
							var month = moment(timestampInMsec).utc().month();  
							var hour = moment(timestampInMsec).utc().hour();  
							var week = moment(timestampInMsec).utc().week();
							var year = moment(timestampInMsec).utc().year();
							
							var dID = "#id-"+month+"-"+day;
							var selection = d3.select( dID );
							selection.classed("text-highlight", false)	;
							
							var dID1 = "#id-"+day+"-"+hour;
							var selection1 = d3.select( dID1 );
							selection1.classed("text-highlight", false)	;
							
							var dID2 = "#id-"+week+"-"+year;
							var selection2 = d3.select( dID2 );
							selection2.classed("text-highlight", false)	;
							
							var dID3 = "#id-"+ year +"-"+ month;
							var selection3 = d3.select( dID3 );
							selection3.classed("text-highlight", false)	;
						}	   
					});	
				}				
			});
		}
	}

}








function addScrollingEffectsFromTextWindowToHeatMap(rows)
{
	//$uuid = 'id_'.$uuid.'_'.$unix_timestamp.'_'.$newLabel.'_'.$md5Val.'_'.$str;
	var windowDiv = "lowerContentTextWindow";
	var nodes = document.getElementById(windowDiv).childNodes;
	//use throttle to make screen experience very smooth
	
	
	
//	$(window).scroll($.debounce( 250, true, function(){
//	    $('#scrollMsg').html('SCROLLING!');
//	}));
//	$(window).scroll($.debounce( 250, function(){
//	    $('#scrollMsg').html('DONE!');
//	}));
	
	
	$("#"+windowDiv).scroll( $.throttle( 3000,  function()
	{
		for(var i=0; i<nodes.length; i++) 
		{
			var currentID = nodes[i].id;
			if(currentID)
			{
				var cssID = "#"+currentID;
				var currentTimeStamp = cssID.split('_')[2];
				currentTimeStamp = parseInt(currentTimeStamp);
				var labelFromID = cssID.split('_')[3];
				//addProgressBar("#"+windowDiv, cssID);
//				var newwindow = "#"+windowDiv;
//				newwindow = newwindow + " >  " 
				
	
				var aTop = $(cssID).height();
				if($(this).scrollTop()>=aTop)
				{
					//add event here
					//add interaction from text window to heatmap cells	

					for (var ind = 1; ind < rows.length; ind++) 
					{
						var divID = "#chart"+ind;
						var svg = d3.select(divID).selectAll('div > svg');
						var rectObj = svg.selectAll("rect");
						rectObj.each(function(d) 
						{
							var timerange = this.attributes.timestamp.textContent;
							var startTimeStamp = timerange.split('-')[0]; 
							var endTimeStamp = timerange.split('-')[1]; 
							startTimeStamp = parseInt(startTimeStamp); 
							endTimeStamp = parseInt(endTimeStamp);

							var labelName = this.attributes.identifier.textContent;			
							var curLabel = cssStyleID(rows[ind].name);

							//if ( (labelFromID == labelName) &&  ( startTimeStamp <= currentTimeStamp ) && ( currentTimeStamp  <=  endTimeStamp) )
							if (  ( currentTimeStamp >= startTimeStamp   ) && ( currentTimeStamp  <=  endTimeStamp) )
							{
								if ( (curLabel == labelName) && (d.numofnews > 0) )	
								{
									d3.select(this).classed("cell-hover",true);	

									//add interaction to y- axis label	
									
									var nID = "#id_"+ curLabel;
									var selection = d3.select( nID );
									selection.classed("text-highlight", true)	;

									//add interaction to x- axis label

									var timestampInMsec = currentTimeStamp * 1000;
									var day = moment(timestampInMsec).utc().format("D");  
									var month = moment(timestampInMsec).utc().month();  
									var hour = moment(timestampInMsec).utc().hour();  
									var week = moment(timestampInMsec).utc().week();
									var year = moment(timestampInMsec).utc().year();
									
									var dID = "#id-"+month+"-"+day;
									var selection = d3.select( dID );
									selection.classed("text-highlight", true)	;
									
									var dID1 = "#id-"+day+"-"+hour;
									var selection1 = d3.select( dID1 );
									selection1.classed("text-highlight", true)	;
									
									var dID2 = "#id-"+week+"-"+year;
									var selection2 = d3.select( dID2 );
									selection2.classed("text-highlight", true)	;
									
									var dID3 = "#id-"+ year +"-"+ month;
									var selection3 = d3.select( dID3 );
									selection3.classed("text-highlight", true)	;


								}
								else
								{
									d3.select(this).classed("cell-hover",false);		

									//remove interaction to y- axis label							
									var curLabel = cssStyleID(rows[ind].name);
									var nID = "#id_"+ curLabel;
									var selection = d3.select( nID );
									selection.classed("text-highlight", false)

									//add interaction to x- axis label

//									var timestampInMsec = currentTimeStamp * 1000;
//									var day = moment(timestampInMsec).utc().format("D");  
//									var month = moment(timestampInMsec).utc().month();  
//									var dID = "#id-"+month+"-"+day;
//									
//									var selection = d3.selectAll( dID );
//									selection.classed("text-highlight", false)	;
									
									var timestampInMsec = currentTimeStamp * 1000;
									var day = moment(timestampInMsec).utc().format("D");  
									var month = moment(timestampInMsec).utc().month();  
									var hour = moment(timestampInMsec).utc().hour();  
									var week = moment(timestampInMsec).utc().week();
									var year = moment(timestampInMsec).utc().year();
									
									var dID = "#id-"+month+"-"+day;
									var selection = d3.select( dID );
									selection.classed("text-highlight", false)	;
									
									var dID1 = "#id-"+day+"-"+hour;
									var selection1 = d3.select( dID1 );
									selection1.classed("text-highlight", false)	;
									
									var dID2 = "#id-"+week+"-"+year;
									var selection2 = d3.select( dID2 );
									selection2.classed("text-highlight", false)	;
									
									var dID3 = "#id-"+ year +"-"+ month;
									var selection3 = d3.select( dID3 );
									selection3.classed("text-highlight", false)	;
								}															
							}

						});	
					}					

				}	
				
			}
		}
	} ) );
	
	
//	$(window).scroll($.debounce( 250, function(){
//    $('#scrollMsg').html('DONE!');
//}));
}



function checkSubString(string, searchfor)
{
	//var string="This is testing for javascript search !!!";
	var status = false;
	if(string.search(searchfor) != -1) {
		status = true;
	} 
	return status;
}



//function getDataStream( time_range_string )
//{
//	var ajax = new Array();
//	var processID = getRandomInt( MINVAL, MAXVAL );
//	var ajaxindex = time_range_string+"-"+processID;
//
//	
//	ajax[ ajaxindex] = new XMLHttpRequest();
//	ajax[ ajaxindex].id=ajaxindex; 
//	
//
//	ajax[ ajaxindex].onreadystatechange = function () 
//	{
//		if (ajax[ ajaxindex].readyState == 4 && ajax[ ajaxindex].status == 200) 
//		{
//			var currentJsonData = JSON.parse(ajax[ ajaxindex].responseText); 
//			if( currentJsonData != null )
//			{
//				/**
//	              use data in a stream
//	              create plots and perform real-time visualization
//	              This is the updated plots for incremental updates
//				 */
//				updateData(currentJsonData);       	
//			}
//		}
//	}
//	var param = "timerange=" + encodeURIComponent(time_range_string);
//
//	ajax[ ajaxindex].open("POST", "data.php" , true);
//	ajax[ ajaxindex].setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
//	ajax[ ajaxindex].send(param);
//}


function getDataStream( time_range_string )
{
	var deferred = Q.defer();
	var request = $.ajax({
		url: "data.php",
		type: "POST",
		data: { "timerange" : time_range_string },
		dataType: "json",
		timeout: 120000
	});
	request.done(function( msg ) {
		updateData( msg, time_range_string );
		
		deferred.resolve();
	});
	request.fail(function( jqXHR, textStatus ) {
		console.log( "Request failed: " + textStatus );
	});
	return deferred.promise;
}	

//function getSearchResult( time_range_string )
//{
//	/*
//	 * obtain the search result based on an ajax call
//	 */
//	if (typeof searchEntityTerm !== 'undefined')
//	{
//		var ajax = new Array();
//		var processID = getRandomInt( MINVAL, MAXVAL );
//		var ajaxindex = time_range_string+"-"+processID;
//	
//		
//		ajax[ ajaxindex] = new XMLHttpRequest();
//		ajax[ ajaxindex].id=ajaxindex; 
//		
//	
//		ajax[ ajaxindex].onreadystatechange = function () 
//		{
//			if (ajax[ ajaxindex].readyState == 4 && ajax[ ajaxindex].status == 200) 
//			{
//				var currentJsonData = JSON.parse(ajax[ ajaxindex].responseText); 
//				if( currentJsonData != null )
//				{	
//					/*
//					 * perform query for search data
//					 */
//					SearchTotalNews( currentJsonData );
//		 	
//				}
//			}
//		}
//		var param = "timerange=" + encodeURIComponent(time_range_string);
//	
//		ajax[ ajaxindex].open("POST", "searchTermEntity.php" , true);
//		ajax[ ajaxindex].setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
//		ajax[ ajaxindex].send(param);
//	}
//}


function getSearchResult( time_range_string )
{
	var deferred = Q.defer();
	var parameter = getSearchInputList();
	var currentTerms = getlistOfTerms();
	if (highlightedEntity.length > 0) //check that the list is not empty
	{
		var request = $.ajax({
			url: "searchTermEntity.php",
			type: "POST",
			data: { "timerange" : encodeURIComponent(time_range_string), "searchparam" :  JSON.stringify(parameter, null, 2), "type": encodeURIComponent(param), "currentList": JSON.stringify(currentTerms) },
			dataType: "json",
			timeout: 240000
		});
		request.done(function( msg ) {
			SearchTotalNews( msg);
			deferred.resolve();
		});
		request.fail(function( jqXHR, textStatus ) {
			console.log( "Request failed: " + textStatus );
		});
	}
	return deferred.promise;
}	


//function DataStream()
//{
//	
//	//var delayTime = 80000; //2 minutes
//	var delayTime = 30000; //2 minutes
//	var shortdelayTime = 500; //2 minutes
//	
//	var start = 1392023721 + (10 * 24 * 3600);	
//	//var start = 1392023721;	
//	var end;
//	
//	
//	var runningStateInc = {};
//	var runningStateVal = {};
//	
//	var delayStateVal = {};
//	
//	
//	
//	this.streamOutput = function(aggregationLevelType)
//	{
////		var start = 0;	
////		var end = 0;
//		var extent = sessionObj[aggregationLevelType]["window-size"];
//		var step = sessionObj[aggregationLevelType]["step"];
//
//		delayStateVal[aggregationLevelType] = true;
//		
//		console.log("Streamming data :  "+ aggregationLevelType);
//
////		start = 1392023721 + (10 * 24 * 3600);	
//	
//		start = parseInt(start/step ) * step; 
//		end = start + extent;
//		var timeRange1 = "";
//
//		function getVal(timeRange)
//		{
//		
//			getBreakingNewsTitle( timeRange );
//			//working code
//			getDataStream( timeRange)
//			.then( getSearchResult( timeRange) );
//
//		}
//
//		function incrementExtent()
//		{
//			/**
//			 * use moment.js to get currrent time and make necessary calculations
//			 */
//			step = sessionObj[aggregationLevelType]["step"]
//			start = start + step; 
//			end = end + step;
//
//			timeRange1 = start + "-"+ end;
//	
//		}
//
//		/**
//		 * make the code to start at once
//		 */
//		if (delayStateVal[aggregationLevelType])
//		{
////			incrementExtent();
////			getVal(timeRange1);	
//			setTimeout(incrementExtent, shortdelayTime);
//			setTimeout( function() { getVal(timeRange1); }, shortdelayTime );
//			
//		}
//
//		
//		runningStateInc[aggregationLevelType] = setInterval(incrementExtent, delayTime);
//		runningStateVal[aggregationLevelType] = setInterval( function() { getVal(timeRange1); }, delayTime );				
//		
//	}
//	
//	
//	this.shutstream = function(aggregationLevelType)
//	{
//		clearInterval ( runningStateInc[aggregationLevelType] );
//		clearInterval ( runningStateVal[aggregationLevelType] );
//	}
//}


function DataStream()
{

	var delayTime = 30000; //2 minutes



	var shortdelayTime = 500; //2 minutes
	
	var start = 1392023721 + (10 * 24 * 3600);	
	//var start = 1392023721;	
	var end;
	
	
	var runningStateInc = {};
	var runningStateVal = {};
	
	var delayStateVal = {};
//	var startConstant = 1392023721 + (10 * 24 * 3600);	

	
	this.streamOutput = function(aggregationLevelType)
	{
//		var start = 0;	
//		var end = 0;
		var extent = sessionObj[aggregationLevelType]["window-size"];
		var step = sessionObj[aggregationLevelType]["step"];
		

		delayStateVal[aggregationLevelType] = true;
		
		console.log("Streamming data :  "+ aggregationLevelType);

//		start = 1392023721 + (10 * 24 * 3600);	
	
		start = parseInt(start/step ) * step; 
		end = start + extent;
		
//		var endConstant = startConstant + extent;
		var timeRange1 = "";

		function getVal(timeRange)
		{
		
			getBreakingNewsTitle( timeRange );
			//working code
			getDataStream( timeRange)
			.then( getSearchResult( timeRange) );

		}

		function incrementExtent()
		{
			/**
			 * use moment.js to get currrent time and make necessary calculations
			 */
			step = sessionObj[aggregationLevelType]["step"]
			start = start + step; 
			end = end + step;
			


			timeRange1 = start + "-"+ end;
			
			drawClock(end) ; //draw clock on screen		
			
	
		}

		/**
		 * make the code to start at once
		 */
		if (delayStateVal[aggregationLevelType])
		{
			setTimeout(incrementExtent, shortdelayTime);
			setTimeout( function() { getVal(timeRange1); }, shortdelayTime );
			
		}
		
		runningStateInc[aggregationLevelType] = setInterval(incrementExtent, delayTime);
		runningStateVal[aggregationLevelType] = setInterval( function() { getVal(timeRange1); }, delayTime );	
		
		

		
	    /**
	     * 
	     * latest data on the rightmost heatmap
	     */
	    
	    var match = _.contains(latestNewsArr, aggregationLevelType);
	    if (!match)
	    {                  
	        latestNewsArr.push(aggregationLevelType); 
	        setTimeout( function() { markLastestNewsNow( timeRange1 ); }, delayTime/4);
	        setTimeout( function() { loadNews( timeRange1 ); }, delayTime/4 );     
	    }
		
 
		
		
	}
	
	
	this.shutstream = function(aggregationLevelType)
	{
		clearInterval ( runningStateInc[aggregationLevelType] );
		clearInterval ( runningStateVal[aggregationLevelType] );

	}
	

}



function buttonClick() {        
	var imageSource = document.getElementById("close").value;
	if (imageSource == "") {
		console.log("Please enter the source for an image.");
	}
	else {
		$("#textWindow").hide();
	}
} 



//add button to close the news window
function init() {    
	var button = document.getElementById("close");
	button.onclick = buttonClick;    
}




//** Update data section (Called from the onclick)
function updateData(data, time_range_string) 
{
	// Select the section we want to apply our changes to
//	var elem = document.getElementById("datatable");
//	parent=elem.parentNode; 
//	elem.remove();
//
//
//	var div = document.createElement("div");
//	div.id    = "datatable";
//	parent.appendChild(div);

	$( "#datatable" ).empty();
	$( "#lowerContentlegend" ).empty(); //remove exisiting ocontent before redrawing in the window

	var delayTime = 5000;
	
    /**
     * 
     * latest data on the rightmost heatmap
     */
    
//    var match = _.contains(latestNewsArr, aggregationLevelType);
//    if (!match)
//    {                  
//        latestNewsArr.push(aggregationLevelType); 
        setTimeout( function() { markLastestNewsNow( time_range_string ); }, delayTime);
//        setTimeout( function() { loadNews( time_range_string ); }, delayTime );     
//    }
    
//    var textWindowDiv = "#lowerContentTextWindow"
//
//    	if ( $(textWindowDiv).is(':empty') )
//    	{
//    		$(textWindowDiv).hide()  
//    	} 
//    	else
//    	{
//    		$(textWindowDiv).show()   
//    	}

	
	
	var mapData = data["heat_map"];
	var data_aggregation = data ["aggregation_type"];
	removeTooltip() //remove existing tooltip	
	
//	console.log( JSON.stringify(mapData) )
	if ( aggregationLevelType == data_aggregation)
	{
		
		if ( aggregationLevelType == "Months_vs_Weeks")  // prevent empty data from entering the space
		{
			//"Months_vs_Weeks"
			if ( Object.keys( mapData).length  > 0)
			{
				/**
				 * add start time and end time data point
				 * 
				 */

				var arr = time_range_string.split("-");
				var startTimestamp = arr[0];
				var endTimestamp = arr[1];
				
				var startTimestampInMsec = startTimestamp * 1000;
				var endTimestampInMsec = endTimestamp * 1000;
				var syear = moment(startTimestampInMsec).utc().get('year'); 
				var eyear = moment(endTimestampInMsec ).utc().get('year');
				
				var smonth = moment(startTimestampInMsec).utc().month();  
				var emonth = moment(endTimestampInMsec ).utc().month();				
				
				
				var termlist = _.keys(mapData)
				var start = {}
	            
	            var weekInSecs = (7*24*3600);

	            
				start ["month"] = (smonth+1) * syear
				start ["week"] =  parseInt (startTimestamp/weekInSecs) * weekInSecs;
				start ["numofnews"] =  0;
				start ["timerange"] =  (startTimestamp-1000) + "-" +startTimestamp;
				
				mapData[termlist[0]].push(start);
				
				var end = {}
				end ["month"] =   (emonth+1) * syear ;
				end ["week"] =  parseInt (endTimestampInMsec/weekInSecs) * weekInSecs;
				end ["numofnews"] =  0;
				end ["timerange"] =  (endTimestamp-1000) + "-" + endTimestamp;
				
				mapData[termlist[0]].push(end);					
				
				createHeatMapChartMonthvsWeek(data);
				//hideAllButton();
				//removeRowFromHeatmap();
				removeRowFromHeatmap();
				
				addRowFromHeatmap();
			}
			else
			{
				$( "#textWindow" ).hide(); //hide the text window
			}
		}
		else if ( aggregationLevelType == "Weeks_vs_Days")  // prevent empty data from entering the space
		{
			//"Weeks_vs_Days"	
			if ( Object.keys( mapData).length  > 0)
			{
				/**
				 * add start time and end time data point
				 * 
				 */

				var arr = time_range_string.split("-");
				var startTimestamp = arr[0];
				var endTimestamp = arr[1];
				
				var startTimestampInMsec = startTimestamp * 1000;
				var endTimestampInMsec = endTimestamp * 1000;
				var sday = moment(startTimestampInMsec).utc().isoWeekday();  //moment().isoWeekday(); 
				var eday = moment(endTimestampInMsec ).utc().isoWeekday();// 1 - 7  
				var termlist = _.keys(mapData)
				var start = {}
				
				
	            
	            var weekInSecs = (7*24*3600);
				start ["week"] =  parseInt (startTimestamp/weekInSecs) * weekInSecs;
				start ["day"] =  sday;
				start ["numofnews"] =  0;
				start ["timerange"] =  (startTimestamp-1000) + "-" +startTimestamp;
				
				mapData[termlist[0]].push(start);
				
				var end = {}
				end ["week"] =  parseInt (endTimestamp/weekInSecs) * weekInSecs ;
				end ["day"] =  eday;
				end ["numofnews"] =  0;
				end ["timerange"] =  (endTimestamp-1000) + "-" + endTimestamp;
				
				mapData[termlist[0]].push(end);				
				
				data["heat_map"] = mapData;
				
				createHeatMapChartWeekvsDay(data);
				//hideAllButton();
				//removeRowFromHeatmap();
				removeRowFromHeatmap();
				
				addRowFromHeatmap();
			}
			else
			{
				$( "#textWindow" ).hide(); //hide the text window
			}
		}
		else if ( aggregationLevelType == "Days_vs_Hours")  // prevent empty data from entering the space
		{
			//"Days_vs_Hours"
			if ( Object.keys( mapData).length  > 0)
			{
				/**
				 * add start time and end time data point
				 * 
				 */
				var dayInSecs = 86400; //day in sec
				var arr = time_range_string.split("-");
				var startTimestamp = arr[0];
				var endTimestamp = arr[1];
				
				var startTimestampInMsec = startTimestamp * 1000;
				var endTimestampInMsec = endTimestamp * 1000;
				var shour = moment(startTimestampInMsec).utc().hour();  
				var ehour = moment(endTimestampInMsec ).utc().hour();  
				var termlist = _.keys(mapData)
				var start = {}
				start ["day"] =  parseInt (startTimestamp/dayInSecs) * dayInSecs;
				start ["hour"] =  shour;
				start ["numofnews"] =  0;
				start ["timerange"] =  (startTimestamp-1000) + "-" +startTimestamp;
				
				mapData[termlist[0]].push(start);
				
				var end = {}
				end ["day"] =  parseInt (endTimestamp/dayInSecs) * dayInSecs ;
				end ["hour"] =  ehour;
				end ["numofnews"] =  0;
				end ["timerange"] =  (endTimestamp-1000) + "-" + endTimestamp;
				
				mapData[termlist[0]].push(end);				
				
				data["heat_map"] = mapData;
				
				createHeatMapChart(data);
				//hideAllButton();
				//removeRowFromHeatmap();
				removeRowFromHeatmap();
				
				addRowFromHeatmap();
				
				
				
				
			}
			else
			{
				$( "#textWindow" ).hide(); //hide the text window
			}
		}
		else
		{
		  	//"Hours_vs_Minutes"

			if ( Object.keys( mapData).length  > 0)// prevent empty data from entering the space
			{
				/**
				 * add start time and end time data point
				 * 
				 */

				var arr = time_range_string.split("-");
				var startTimestamp = arr[0];
				var endTimestamp = arr[1];
				
				var startTimestampInMsec = startTimestamp * 1000;
				var endTimestampInMsec = endTimestamp * 1000;
				var sminute = moment(startTimestampInMsec).utc().get('minute');  
				var eminute = moment(endTimestampInMsec ).utc().get('minute');
				var termlist = _.keys(mapData)
				var start = {}
				
				
	            
	            var hoursInSecs = (1*3600);
				start ["hour"] =  parseInt (startTimestamp/hoursInSecs) * hoursInSecs;
				start ["minute"] =  sminute;
				start ["numofnews"] =  0;
				start ["timerange"] =  (startTimestamp-1000) + "-" +startTimestamp;
				
				mapData[termlist[0]].push(start);
				
				var end = {}
				end ["hour"] =  parseInt (endTimestamp/hoursInSecs) * hoursInSecs ;
				end ["minute"] =  eminute;
				end ["numofnews"] =  0;
				end ["timerange"] =  (endTimestamp-1000) + "-" + endTimestamp;
				
				mapData[termlist[0]].push(end);				
				
				data["heat_map"] = mapData;				
				
				createHeatMapChartHourvsMin(data);
				//hideAllButton();
				//removeRowFromHeatmap();
				removeRowFromHeatmap();
				
				addRowFromHeatmap();
			}
			else
			{
				$( "#textWindow" ).hide(); //hide the text window
			}
		}
		

		
	}
	//remoteTermIndexArr = _.uniq( remoteTermIndexArr);

	console.log(JSON.stringify ( remoteTermIndexArr) )

//update news window
	/**
	$('#textWindow').each(function() {
	    var c = $(this).children(); // find the inner div
	    if (c.html().length == 0) {            // check its content's length
	        $(this).hide();
	        $('#textWindow').hide();
	    }
	    else
	    {
	        $('#textWindow').show();
	    }
	});
	*/
	
}     



//add function in newdraw.js
//place the code inside initParameter()
function getLastestNewsOnDefault()
{
	latest = true;
	var ajax = new Array();
	var processID = getRandomInt( MINVAL, MAXVAL );
	var ajaxindex = processID;

	
	ajax[ ajaxindex] = new XMLHttpRequest();
	ajax[ ajaxindex].id=ajaxindex; 

	$( "#textWindow" ).hide(); //hide the text window

	ajax[ ajaxindex].onreadystatechange = function () 
	{
		if (ajax[ ajaxindex].readyState == 4 && ajax[ ajaxindex].status == 200) 
		{

			var news_html = ajax[ ajaxindex].responseText;
			if( news_html != null)
			{
				var news_window = document.getElementById("lowerContentTextWindow"); // get the compressed tweets DIV
				news_window.innerHTML = news_html; 
				$( "#textWindow" ).show();
				//add local time to the text window
				addLocalDateToTextWindow();
				//add interaction from the text window to the heat map
				//addInteractionFromTextWindowToHeatMap();
				//add related news to the news window in a collapsible div
				//addRelatedNewsToTextWindow();
				//add time to related news
				//addLocalDateToRelatedNewsTextWindow();
				//allow the scroll to begin at the top of the window
				$("#lowerContentTextWindow").scrollTop(0);
			}
		}
	}

	ajax[ ajaxindex].open("POST", "latestNews.php" , true);
	ajax[ ajaxindex].setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	ajax[ ajaxindex].send(null);
}



function initMessage(width, height )
{
	var div = d3.select("body").append("div")   
    .attr("id", "message")               
    .style("opacity", 0);	


	div.transition()        
		.duration(200)      
		.style("opacity", .9);  
			        
	div.html("<p><strong>Message:</strong> Kindly wait as we are loading the news.</p>")  
	.style("left", (width/2)-200 + "px")     
	.style("top", (height/2)-200 + "px");  

	$("#message").delay(250).fadeOut();
}


function setDefaultSessionObject()
{
	var ajax = new Array();
	var processID = getRandomInt( MINVAL, MAXVAL );
	var ajaxindex = processID;
	
	ajax[ ajaxindex] = new XMLHttpRequest();
	ajax[ ajaxindex].id=ajaxindex; 

	ajax[ ajaxindex].onreadystatechange = function () 
	{
		if (ajax[ ajaxindex].readyState == 4 && ajax[ ajaxindex].status == 200) 
		{
			console.log("set default value for session object");
		}
	}

	ajax[ ajaxindex].open("POST", "setDefaultSession.php" , true);
	ajax[ ajaxindex].setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	ajax[ ajaxindex].send(null);
}





function initParameter()
{
	var width = 960;
	var height = 700;
	//set initial session object
	setDefaultSessionObject();
	

	getInputFromRadioTimeWatch();

	initMessage(width, height )
	
	console.log(aggregationLevelType)
	
	$( "#textWindow" ).hide(); 
	//getLastestNewsOnDefault();
	
//	var latestObj = setTimeout(getLastestNewsOnDefault, 10000);
	
	
	//move the headings
	//floatDiv('#chart0');
	//floatDiv("#chart0 > svg")
	
	//move the news text window
	//floatDiv('#close');
	
	//move the tooltip with a scroll
	//floatDiv('#summarytooltip');
	
	//$("#table-1").tableDnD(); //allow draggable divs
	//$("#table-1").tableDnD();
	// Return a helper with preserved width of cells
//	  var fixHelper = function(e, ui) {
//	      ui.children().each(function() {
//	          $(this).width($(this).width());
//	      });
//	      return ui;
//	  };
	
	//$("#table-1 .sorter").sortable()

	  //$("#table-1 tbody").sortable({
//	  $("#table-1").sortable({
//	      helper: fixHelper
//	  }).disableSelection();
	
//	var fixHelper = function(e, tr)
//	  {
//	    var $originals = tr.children();
//	    var $helper = tr.clone();
//	    $helper.children().each(function(index)
//	    {
//	      // Set helper cell sizes to match the original sizes
//	      $(this).width($originals.eq(index).width());
//	    });
//	    return $helper;
//	  };
//
//	  $("#table-1 tbody").sortable({
//	      helper: fixHelper
//	  }).disableSelection();	  
	
	
	
	  
	//prevent endless scrolling
	preventEndlessScrolling();
	window.onload = init;
	

}


function getlistOfTerms()
{
   var tableSelection = d3.select('#table-1').selectAll('tr');
   var output = [];
   tableSelection.each( function(d, i)
   {
       var currentLabel = d.name;
       if (currentLabel )
       {
           output.push(currentLabel);
       }
     
   });
   return _.uniq( output );

}



function searchCurrentNews(chartID, currentTimeStamp)
{
	/**
	 * This searches for the news by timestamp
	 */
	var selectedDiv = ".hour, .bordered";
	d3.select(chartID).selectAll( selectedDiv ).each( function(d, i)
	{
		var timerange = d.timerange;
		var startTimeStamp = timerange.split('-')[0]; 
		var endTimeStamp = timerange.split('-')[1]; 
		if ( (currentTimeStamp >= startTimeStamp) &&  (currentTimeStamp <= endTimeStamp) )
		{   
			d3.select(this).style("stroke", '#f4a582').style('stroke-width', '1.5px');
		}
//		else
//		{
//			d3.select(this).style("stroke", 'transparent').style('stroke-width', '0px');
//		}
	});    
}



function SearchTotalNews(data)
{
	/**
	 * highlight total searched news
	 */
	if (data)
	{
		//var yLabelList = getlistOfTerms();
		yLabelList = currentTermList;
		yLabelList = _.uniq(yLabelList );
		//iterate through elements to search for matches
		data.forEach(function(d) 
		{
			var uuid = d.uuid;
			var timestamp = d.unix_timestamp;
			var possibleLabels = _.values( d.type );
			possibleLabels = _.uniq(possibleLabels );
			//var possibleLabels =  d.type ;


			for (i = 0; i < possibleLabels.length; i++) 
			{
				var currentLabel = possibleLabels[i];
				var index = yLabelList.indexOf(currentLabel);
				if (index != -1)
				{
					//var chartID = "#chart" + (index+1) ;
					var chartID = "#chart" + (index) ;
					searchCurrentNews( chartID, timestamp);		
					var newLabel =  cssStyleID(currentLabel);
					
//					"md5hash" => $md5Val,
//					"str" => $str
					var md5Val = d.md5hash;
					var str = d.str;
					var cssID  = 'id_'+ uuid + '_'+ timestamp +'_'+ newLabel+'_'+ md5Val+ '_'+str;
					
	                //add a border on the searched news        
	                $(cssID).addClass("searchEntity");
					
					
				}

				
			}   
		});

	}
}


//function scroll_to(div)
//{
//	/**
//	 * allow scrolling to a div
//	 */
////    $('#lowerContentTextWindow').animate(
////    {
////        scrollTop: $(div).offset().top
////    },9000);
//
//    
//    
//    $.throttle( 3000,  function()
//    {
//    	$(div)[0].scrollIntoView(true);
//    })
//}


function getBreakingNewsTitle( time_range_string )
{
	var deferred = Q.defer();
	var given_time_extent = time_range_string.split("-"); 
	var endtimestamp = parseInt( given_time_extent[1] ); 

	var starttimestamp = endtimestamp - 86400;
	var current_timestamp_range = starttimestamp+"-"+endtimestamp;

	var request = $.ajax({
		url: "breakingNewsIndicator.php",
		type: "POST",
		data: { "timerange" : current_timestamp_range },
		dataType: "html",
		timeout: 120000
	});
	request.done(function( msg ) {
		var breakingNewsWindow = document.getElementById("breakingNewsWindow"); // get the compressed tweets DIV
		breakingNewsWindow.innerHTML = msg; 
		if ($('#js-news').html().length > 10) 
		{

			
			$( "#breakingNewsWindow" ).show();

			

			$('#js-news').ticker();	
			//Fire event once the news is loaded
			if( typeof elmnt === 'undefined' || elmnt === null )
			{
				
			}
			else
			{
				getBreakingnewsID(elmnt);
			}
			
		}
		

		deferred.resolve();
	});
	request.fail(function( jqXHR, textStatus ) {
		console.log( "Request failed: " + textStatus );
	});

	return deferred.promise; 
}	




function floatDiv(div)
{
	$(window).scroll( $.throttle( 3000,  function()
	{
		$(div).stop().animate({"marginTop": ($(window).scrollTop()) + "px", "marginLeft":($(window).scrollLeft()) + "px"}, "slow" );
	}));	
}


//function removeRowFromHeatmap()
//{
//  //$( "#button0" ).hide(  );
//    $(document).on('click', '.removebutton', function () {
//       //$(this).closest('tr').remove();
//       $(this).parent().parent().remove();
//       
//       var deleteID = $(this).context.id;
//
//       var index = deleteID.slice(-1); //get the index of the ID attributes
//       remoteTermIndexArr.push(index);
//       
//       return false;
//   });
//
//}


function removeRowFromHeatmap()
{
  //$( "#button0" ).hide(  );
    $(document).on('click', '.removebutton', function () 
    {
    	//animate the removal of the row
    	$(this).parent().parent().fadeOut(1500, function()
    	{ 
    		//$(this).remove();
    		$(this).hide();
    		tableRowObjArr.push($(this));
    		
    		//hide the add button
    		$( "#addbutton" ).show();
        });
       
       var deleteID = $(this).context.id;

       var index = deleteID.slice(-1); //get the index of the ID attributes
       remoteTermIndexArr.push(index);
       remoteTermIndexArr = _.uniq( remoteTermIndexArr);
       
       
       return false;
   });

}



function addRowFromHeatmap()
{
	remoteTermIndexArr = _.uniq( remoteTermIndexArr);
    var myEl = document.getElementById('addbutton');
    if ( !_.isNull( myEl) ) 
    {  	
	    myEl.addEventListener('click', function() {
	    	
	//    	for (var i = 0; i < tableRowObjArr.length; i++) {
	//    		tableRowObjArr[i].show();
	//    		remoteTermIndexArr.splice(i, 1);
	//    	}
	
	    	lastElem = tableRowObjArr.pop();
	    	lastElem.show();
	    	remoteTermIndexArr.pop()
	    	//remoteTermIndexArr.shift();
	    	//remoteTermIndexArr.pop()
	    	remoteTermIndexArr = _.uniq( remoteTermIndexArr);
	    }, false);
    }    
    
}




function hideAllButton()
{
  var listOfTerm = getlistOfTerms(); 
  for (i = 0; i < listOfTerm.length+1; i++) {
      $( "#button"+i ).hide(  );
  }
}


//function (term_list, term)
//{
//    var index = term_list.indexOf(term); 
//    $( "#button"+index ).show(  );
//}
//
//
//function hideTerm(term_list, term)
//{
//
//    var index = term_list.indexOf(term); 
//    $( "#button"+index ).hide(  );
//}


function showTerm(term_list, term)
{
    var index = term_list.indexOf(term); 
    var selection = $( "#button"+index ).find('img').attr("src", "images/delete.png");

}


function hideTerm(term_list, term)
{

    var index = term_list.indexOf(term); 
    var selection = $( "#button"+index ).find('img').attr("src", "images/nndelete1.png");

}



function getBreakingNewsOnClick(newsID)
{
	/**
	 *  This get the news content from the breaking news slider
	 */
	
	var ajax = new Array();
	var processID = getRandomInt( MINVAL, MAXVAL );
	var ajaxindex = processID;

	
	ajax[ ajaxindex] = new XMLHttpRequest();
	ajax[ ajaxindex].id=ajaxindex; 
	
	$( "#textWindow" ).hide(); //hide the text window

	ajax[ ajaxindex].onreadystatechange = function () 
	{
		if (ajax[ ajaxindex].readyState == 4 && ajax[ ajaxindex].status == 200) 
		{

			var news_html = ajax[ ajaxindex].responseText;
			if( news_html != null)
			{
				var news_window = document.getElementById("lowerContentTextWindow"); // get the compressed tweets DIV
				news_window.innerHTML = news_html; 
				$( "#textWindow" ).show();
				//add local time to the text window
				
				//$('.expander').simpleexpand();
				$('.expander').simpleexpand();
				addLocalDateToTextWindow();
				//add related news to the news window in a collapsible div
				//addRelatedNewsToTextWindow();
				if( typeof elmnt === 'undefined' || elmnt === null )
				{
					
				}
				else
				{
					getRelatednewsID(elmnt);
				}
				//allow the scroll to begin at the top of the window
				$("#lowerContentTextWindow").scrollTop(0);
			}
		}
	}
	var param = "news_id=" + encodeURIComponent(newsID);

	ajax[ ajaxindex].open("POST", "breakingNews.php" , true);
	ajax[ ajaxindex].setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	ajax[ ajaxindex].send(param);
}





function getBreakingnewsID(elmnt){
	/**
	 * gets the news ID from the news content to load up the news
	 * 
	 */

	var currentnewsID = elmnt.getAttribute("data-id") ;
	//fire an ajax call to get the news window
	getBreakingNewsOnClick(currentnewsID);


	
}




function preventEndlessScrolling()
{
	$('body').on({
		'mousewheel': function(e) {
			if (e.target.id == 'content') return;
			e.preventDefault();
			e.stopPropagation();
		}
	})

}



function getInputFromRadioTimeWatch()
{
	
	var width = 960;
	var height = 700;
	
	//remove checked status from checkbox
	$('input:checkbox').removeAttr('checked');
	
	$('input[type=checkbox]').change(function() 
	{ 
		if ( $('input[type=checkbox]').is(":checked") )
		{
			//stop visualization

			console.log('stop visualization');
			streamObj.shutstream(aggregationLevelType);

			shutDownStatus = true;
			//hide the text window
			//$( "#textWindow" ).hide();
			//hide the breaking news window
			$( "#breakingNewsWindow" ).hide();
			
			/**
			 * disable controls
			 */
			$("input[type=radio][value=topic]").attr("disabled",true);
			$("input[type=radio][value=person]").attr("disabled",true);
			$("input[type=radio][value=organization]").attr("disabled",true);		
			$( "#slider-range-max-data" ).slider('disable');

		}
		else
		{
			//hide the text window
			$( "#textWindow" ).show();
			//hide the breaking news window
			$( "#breakingNewsWindow" ).show();
			shutDownStatus = false;
			
			
			for (i = 0; i < aggregationArray.length; i++) 
			{ 
				var curAgg = aggregationArray[i] ;
				streamObj.shutstream(curAgg);

			}

			streamObj.streamOutput(aggregationLevelType);	

			/**
			 * enable controls
			 */
			$("input[type=radio][value=topic]").attr("disabled",false);
			$("input[type=radio][value=person]").attr("disabled",false);
			$("input[type=radio][value=organization]").attr("disabled",false);
			$( "#slider-range-max-data" ).slider('enable');
		}


	});

}



function getDataForHistogram( narray ) 
{
	/**
	 * format structure for the histogram
	 */
	//var arr = $.grep(array,function(n){ return(n) }); //remove nulls in the data
	
	var array = narray.filter(function(e){ return e.replace(/(\r\n|\n|\r)/gm,"")});
    var counts = {};

    for(var i = 0; i< array.length; i++) {
        var num = array[i];
        counts[num] = counts[num] ? counts[num]+1 : 1;
    }

    /**
    *  list of elements uniques
    */

    var arrUnique = _.uniq(array);
    var output = []

    for (i = 0; i < arrUnique.length; i++) 
    { 
        var term = arrUnique[i];
        var count = counts[term];
        var temp = {}
        temp["text"] = term;
        temp["count"] = count;

        output.push(temp )
    }   
    
    return output;
}



function getMinMaxHistogram(data)
{
	/**
	 * get the range of the thresholds
	 */
	var threshold = 0.3;//10% of maximum
    var maxValObj = _.max(data, function(obj){ return obj.count; });
    var maxVal = maxValObj.count; 
    var minVal = threshold * maxVal; 
    
    var output = {};
    output['max'] = maxVal;
    output['min'] = minVal;
    return output;
}



function drawHistogram(data, type)
{
	/**
	 * filter the data based on set threshold and use the data for the table.
	 * plot the histogram using this data
	 * data is in text, count format
	 */
    var w = 150;
    var h = 30;
    
    
    var maxMinValObj =  getMinMaxHistogram(data);
    var maxVal = maxMinValObj.max; 
    var minVal = maxMinValObj.min; 
    
    var widthScale = d3.scale.linear()
                  .domain([0,maxVal])
                   .range([0,w]);



    var filteredData = _.filter(data, function(num){ return num.count >= minVal && num.count <= maxVal; });

    filteredData = _.sortBy(filteredData, function(obj){ return -1 * obj.count; }); //sort in ascending order
    var tablestr = "<table class='entityTable'><tbody>";

      for (var i = 0; i < filteredData.length; i++) 
      {
          var curVal = filteredData[i].text;
          var currentCountVal = filteredData[i].count;
          var curValID = type +"_"+ cssStyleID (curVal);
          var chart = "chart-" + cssStyleID (curVal);
          if( ( (currentCountVal > 0) ||   !_.isUndefined(currentCountVal) ) && !checkSubString(curValID, "Bloomberg") )
          {
              tablestr += "<tr> <td class= 'rowformat' count = "+currentCountVal  +"  id="+ curValID+" >" + curVal + "</td> <td id="+ chart+" ></td></tr>"        	  
          }
      }

      tablestr += "</tbody></table>";


//      $(".person").append(tablestr);

      
      var nDiv = "."+type + "Table";
      $(nDiv).append(tablestr);

      for (var i = 0; i < filteredData.length; i++) 
      {
          /**
          * plot a chart based on the ID
          */
          var curVal = filteredData[i].text;
          var count = filteredData[i].count;
          
          if( ( !_.isUndefined(curVal)   || curVal !="" ) && !checkSubString(curVal, "Bloomberg") )
          {
              var chart = "chart-" + cssStyleID (curVal);
              var chartID = "#"+chart;

              var svg = d3.select(chartID)
                          .append("svg")
                          .attr("width", w)
                          .attr("height", h);

              svg.append("rect")
                 .attr("x", 0)
                 .attr("y",  h/2)
                 .attr("width",   widthScale(count) )
                 .attr("height", h)
                 .attr("fill", "#1a9850");


              svg.append("text")
                .text(count)
                .attr("y", h-5)
                .attr("x", widthScale(count)-(h/2))
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("fill", "white");        	  
        	  
          }

      }


}


function dataForList(data)
{
	/**
	 * the remaining 10% is a ordered list
	 */
	
	
	var maxMinValObj =  getMinMaxHistogram(data);
	var maxVal = maxMinValObj.max; 
	var minVal = maxMinValObj.min; 
	var remainingData = _.filter(data, function(num){ return num.count >= 0 && num.count < minVal; });
	//remainingData = _(remainingData).chain().sortBy('count').reverse().sortBy('text').reverse().value() //sort count and text alphabetically

	remainingData = _(remainingData).chain().sortBy('text').reverse().value() //sort count and text alphabetically

	remainingData = _.sortBy(remainingData , function (obj) {return obj.text})
	remainingData = _.uniq(remainingData , function(obj)
	{ 
		return (obj.count +""+ obj.text )   ; 
	});
	return remainingData;
	
}



function addEntityTooltipForTable()
{
	var div = d3.select("body").append("div")   
	.attr("class", "tooltip")               
	.style("opacity", 0);   

	var termSelection = d3.selectAll(".entityTable td");

	termSelection.on("mouseover", function ()
	{
		var currentid = d3.select(this).attr("id");
		var newsCount = d3.select(this).attr("count");
		if( currentid  ) 
		{           
			//if ( !_.isUndefined(newsCount) || !_.isNull(newsCount)   )
			if ( !_.isNull(newsCount)   )
			{          
				div.transition()        
				.duration(200)      
				.style("opacity", .9);  

				div .html(newsCount + "  items")  
//				.style("left", (d3.event.pageX) + "px")     
//				.style("top", (d3.event.pageY - 28) + "px");  
                .style("left", (d3.event.pageX - 30) + "px")     
                .style("top",  (d3.event.pageY + 10) + "px");  
			}
		}
	});

	termSelection.on("mouseout", function ()
	{
		var currentid = d3.select(this).attr("id");
		if( currentid  ) 
		{
			var nID = "#"+currentid;
			var selection = d3.selectAll( nID );
			selection.classed("text-hover", false);     

			div.transition()        
			.duration(500)      
			.style("opacity", 0); 

		}   
	});  


	/**
	 * person
	 */   
	termSelection = d3.selectAll(".person > p");
	termSelection.on("mouseover", function ()
	{
		var currentid = d3.select(this).attr("id");
		var newsCount = d3.select(this).attr("count");
		if( currentid  ) 
		{           
			//if ( !_.isUndefined(newsCount) || !_.isNull(newsCount)   )
			if ( !_.isNull(newsCount)   )
			{          
				div.transition()        
				.duration(200)      
				.style("opacity", .9);  

				div .html(newsCount + "  items")  
				.style("left", (d3.event.pageX) + "px")     
				.style("top", (d3.event.pageY - 28) + "px");  
			}
		}
	});

	termSelection.on("mouseout", function ()
	{
		var currentid = d3.select(this).attr("id");
		if( currentid  ) 
		{
			var nID = "#"+currentid;
			var selection = d3.selectAll( nID );
			selection.classed("text-hover", false);     

			div.transition()        
			.duration(500)      
			.style("opacity", 0); 

		}   
	});  



	/**
	 * topic
	 */   
	termSelection = d3.selectAll(".topic > p");
	termSelection.on("mouseover", function ()
	{
		var currentid = d3.select(this).attr("id");
		var newsCount = d3.select(this).attr("count");
		if( currentid  ) 
		{           
			//if ( !_.isUndefined(newsCount) || !_.isNull(newsCount)   )
			if ( !_.isNull(newsCount)   )
			{          
				div.transition()        
				.duration(200)      
				.style("opacity", .9);  

				div .html(newsCount + "  items")  
				.style("left", (d3.event.pageX) + "px")     
				.style("top", (d3.event.pageY - 28) + "px");  
			}
		}
	});

	termSelection.on("mouseout", function ()
	{
		var currentid = d3.select(this).attr("id");
		if( currentid  ) 
		{
			var nID = "#"+currentid;
			var selection = d3.selectAll( nID );
			selection.classed("text-hover", false);     

			div.transition()        
			.duration(500)      
			.style("opacity", 0); 

		}   
	});      	    


	/**
	 * organization
	 */   
	termSelection = d3.selectAll(".organization > p");
	termSelection.on("mouseover", function ()
	{
		var currentid = d3.select(this).attr("id");
		var newsCount = d3.select(this).attr("count");
		if( currentid  ) 
		{           
			//if ( !_.isUndefined(newsCount) || !_.isNull(newsCount)   )
			if ( !_.isNull(newsCount)   )
			{          
				div.transition()        
				.duration(200)      
				.style("opacity", .9);  

				div .html(newsCount + "  items")  
				.style("left", (d3.event.pageX) + "px")     
				.style("top", (d3.event.pageY - 28) + "px");  
			}
		}
	});

	termSelection.on("mouseout", function ()
	{
		var currentid = d3.select(this).attr("id");
		if( currentid  ) 
		{
			var nID = "#"+currentid;
			var selection = d3.selectAll( nID );
			selection.classed("text-hover", false);     

			div.transition()        
			.duration(500)      
			.style("opacity", 0); 

		}   
	});       	        	    

}



function removePunctuation(s)
{
	/**
	 * remove all punctuation
	 */

	var punctuationless = s.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");
	var finalString = punctuationless.replace(/\s{2,}/g," ");	
	return finalString;

}





function markLastestNewsNow( time_range_string )
{
	var deferred = Q.defer();
	var currentTerms = getlistOfTerms();

		var request = $.ajax({
			url: "nnlatestNews.php",
			type: "POST",
			data: { "timerange" : encodeURIComponent(time_range_string), "type": encodeURIComponent(param), "currentList": JSON.stringify(currentTerms) },
			dataType: "json",
			timeout: 240000
		});
		request.done(function( msg ) {
			SearchTotalNews( msg);
			deferred.resolve();
		});
		request.fail(function( jqXHR, textStatus ) {
			console.log( "Request failed: " + textStatus );
		});
	
	return deferred.promise;
}	



function loadNews( time_range_string )
{
    
    var ajax = new Array();
    var processID = getRandomInt( MINVAL, MAXVAL );
    var ajaxindex = time_range_string+"-"+processID;

    
    ajax[ ajaxindex] = new XMLHttpRequest();
    ajax[ ajaxindex].id=ajaxindex; 
    
    $( "#textWindow" ).hide(); //hide the text window

    ajax[ ajaxindex].onreadystatechange = function () 
    {
        if (ajax[ ajaxindex].readyState == 4 && ajax[ ajaxindex].status == 200) 
        {

            var news_html = ajax[ ajaxindex].responseText;
            
            var textWindowDiv = "#lowerContentTextWindow"
            
            if( news_html != null)
            {
                var news_window = document.getElementById("lowerContentTextWindow"); 
                news_window.innerHTML = news_html;

                $( "#textWindow" ).show();
                //add local time to the text window
                $('.expander').simpleexpand();
                addLocalDateToTextWindow();
                
                if( typeof elmnt === 'undefined' || elmnt === null )
                {
                    
                }
                else
                {
                    getRelatednewsID(elmnt);
                }
       
                
                //allow the scroll to begin at the top of the window
                $("#lowerContentTextWindow").scrollTop(0);
            }
            else
            {
            	$(textWindowDiv).hide()  
            }
            
        }
    }
    var param = "timerange=" + encodeURIComponent(time_range_string);

    ajax[ ajaxindex].open("POST", "nnDisplayNews.php" , true);
    ajax[ ajaxindex].setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    ajax[ ajaxindex].send(param);
}






