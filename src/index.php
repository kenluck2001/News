<?php
	session_start();
 	//require_once 'heatmap.php';	
 ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta content="text/html;charset=utf-8" http-equiv="Content-Type">
<meta content="utf-8" http-equiv="encoding">
<meta http-equiv='cache-control' content='no-cache'>
<meta http-equiv='expires' content='0'>
<meta http-equiv='pragma' content='no-cache'>
<meta name="viewport" content="width=device-width, initial-scale=1">


<title>News Dashboard</title>
<script type="text/javascript" src="js/d3.js"></script>
<script type="text/javascript" src="js/jquery-1.7.2.min.js"></script>
<script type="text/javascript"
	src="https://code.jquery.com/ui/1.11.3/jquery-ui.js"></script>

<script type="text/javascript" src="js/jquery-ui-1.8.21.custom.min.js"></script>
<script type="text/javascript" src="js/underscore-min.js"></script>
<script type="text/javascript" src="js/jquery.highlight-4.js"></script>
<script type="text/javascript" src="js/jstz.min.js"></script>


<script type="text/javascript" src="js/simple-expand.js"></script>

<script type="text/javascript" src="js/jquery.ba-throttle-debounce.js"></script>

<script type="text/javascript" src="js/moment-with-locales.js"></script>
<script type="text/javascript"
	src="js/moment-timezone-with-data-2010-2020.min.js"></script>

<link rel="stylesheet" href="style/newmain.css"></link>
<link rel="stylesheet" href="style/jquery-ui.css"></link>

<link href="style/ticker-style.css" rel="stylesheet" type="text/css" />
<script src="js/jquery.ticker.js" type="text/javascript"></script>

<script type="text/javascript" src="js/q.js"></script>


<script type="text/javascript" src="scripts/clock.js"></script>
<script type="text/javascript" src="scripts/newdraw.js"></script>

<script type="text/javascript" src="js/progress.js"></script>

<!-- <script type="text/javascript" src="js/jquery.tablednd.js"></script> -->
<!-- <script type="text/javascript" src="js/jquery.rowsorter.js"></script> -->
<!-- <script type="text/javascript" src="http://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.13.3/jquery.tablesorter.min.js"></script> -->
<!-- <script type="text/javascript" src="js/jquery.table_sort.js"></script> -->
<!-- <script type="text/javascript" src="https://code.jquery.com/ui/1.11.3/jquery-ui.js"></script> -->

<!-- <script type="text/javascript" src="http://johnny.github.io/jquery-sortable/js/jquery-sortable.js"></script> -->

</head>
<body>
	<div id="control">
		<div id="control1">
			<label for="amount">Data Aggregation:</label> <input type="text"
				id="amount-data" class="sliderClass"> <br />
			<div id="slider-range-max-data" class="sliderControl"></div>
		</div>

		<div id="control2">	
			<div class ='topControl'> 
				<h1>News Dashboard</h1>
			</div>
			<div class ='bottomControl'>
				<div id="breakingNewsWindow"></div>
			</div>
		</div>

		<div id="control3">
			<form class="type">
				<label>Group By:</label><br /> 
					<input type="radio" name="type"
					checked="checked" value="topic">Topic</input><br /> 
					<input type="radio" name="type" value="person">Person</input><br /> 
					<input type="radio" name="type" value="organization">Organization</input><br />
			</form>
		</div>
		
		<div id="control4">
			<label>Current Time:</label> <input type="checkbox" name="stop"
				value="stop">Stop</input>
			<div id="dateval"></div>
			<div id="clock"></div>

			<br />

		</div>		
	</div>

	<div class="clear"></div>
	<div id="topcontent">
<!-- 		<div id="breakingNewsWindow"></div> -->
		<div id="dummy1"></div>
		<div id="lowerContentlegend"></div>
		
	</div>

	<div class="clear"></div>

	<div id="content">
		<div id="facet"></div>
		<div class="placeholder">
			<div id="datatable"></div>
		</div>
		<div id="textWindow">
<!-- 			<img id="close" src="images/close.png" /> -->
<!-- 			<div class="clear"></div> -->
			<div id="lowerContentTextWindow"></div>
<!-- 			<div id="lowerContentlegend"></div> -->
		</div>
	</div>

	<div id="summarytooltip" class="hidden">
		<p>
			<span id="value"> </span>
		</p>
	</div>


	<script type="text/javascript">
			getInputFromRadioButton();
			getInputFromTextbox();
			initParameter();

	</script>

</body>
</html>
