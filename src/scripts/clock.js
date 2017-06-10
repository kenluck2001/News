/**
 * show clock on the screen
 */



var width = 240,
height = 20,
fhou = d3.time.format("%H:"),
fmin = d3.time.format("%M:"),
fsec = d3.time.format("%S");


function drawClock(currentTimestamp) 
{
    var svg = d3.select("#clock");
    svg.selectAll("svg").remove();
    
    //clear the date 
    var dateDiv = "#dateval";
    $( dateDiv  ).empty();
    
	var vis = d3.select("#clock").append("svg")
	.attr("width", width)
	.attr("height", height)
	var g = vis.selectAll("g")
	.data(fields(currentTimestamp))
	.enter()
	.append("g");
	g.append("text")   
	.text(function(d) { return d.text; });

	var g = vis.selectAll("g")
	.data(fields(currentTimestamp));
	g.select("text")
	.attr("fill", "rgb(15, 15, 15)")
	.attr("stroke","rgb(15, 15, 15)")
	.attr("stroke-width",1)

	.attr("transform", function(d) {

//		if(d.index==1){
//			return "translate(" +  0 + ",18)"	
//		}
//		if(d.index==2){
//			return "translate(" +  40 + ",18)"
//		}
//		if(d.index==3){
//			return "translate(" +  80 + ",18)"
//		}
//		else{	
//			return "translate(" +  122  + ",18)"
//		}
		
		if(d.index==1){
			return "translate(" +  0 + ",18)"	
		}
		if(d.index==2){
			return "translate(" +  32 + ",18)"
		}
		if(d.index==3){
			return "translate(" +  64 + ",18)"
		}
		else{	
			return "translate(" +  96  + ",18)"
		}		
	})
	.text(function(d) { return d.text; });
	
	/**
	 * add formatted date to the time
	 */
    var dt = new Date();
    var correctedTimestamp = parseInt(currentTimestamp) + ( dt.getTimezoneOffset() * 60 ) ;
    var correctedTimestampMsecs = correctedTimestamp  * 1000;

    var stringDate = moment(correctedTimestampMsecs).utc().format('ll');



    $(dateDiv).append( stringDate );	
	

}

//Generate the fields for the current date/time.
function fields(currentTimestamp) 
{
	//var d = new Date;
    var dt = new Date();
    var correctedTimestamp = parseInt(currentTimestamp) + ( dt.getTimezoneOffset() * 60 ) ;
    var correctedTimestampMsecs = correctedTimestamp  * 1000;
	
	
	var d = new Date( correctedTimestampMsecs);

	var  hour = (d.getHours() + minute) / 24,
	minute = (d.getMinutes() + second) / 60,
	second = (d.getSeconds() + d.getMilliseconds() / 1000) / 60;
	return [
	        {value: hour,    index: 1, text: fhou(d)},
	        {value: minute,  index: 2, text: fmin(d)},
	        {value: second,  index: 3, text: fsec(d)},

	        ];
}



