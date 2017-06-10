<?php
	session_start();
	require_once 'sparklines.php';	
	require_once 'hierachicalChart.php';

 ?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title>News Dashboard</title>
		<script type="text/javascript" src="js/d3.min.js"></script>
		<script type="text/javascript" src="js/jquery-1.11.1.js"></script>
		<script type="text/javascript" src="js/jquery-ui-1.10.4.js"></script>
		<script type="text/javascript" src="js/underscore-min.js"></script>
		<script type="text/javascript" src="js/jquery.highlight-4.js"></script>
 		<script type="text/javascript" src="js/moment-with-locales.js"></script>
 		<script type="text/javascript" src="js/jstz.min.js"></script>
 				
		<script type="text/javascript" src="js/glow.js"></script>
 		<link rel="stylesheet" href="style/main.css"></link>	
 		
 		<script type="text/javascript" src="scripts/draw.js"></script> 

	</head>	
	<body>
		<div id="control">
			<div id="control1">		
				<p></p>
			</div>			

			<div id="control2">	
				<h1> News Dashboard </h1>
			</div>	
			
			<div id="control3">	
				<p></p>		
			</div>
		</div>
		
		<div id="clear"></div>
		
		<div id="entityLabel">
			<div id='entityLabelTopic' >
				<p><b>Topics</b></p>
			</div>
			<div id='entityLabelPerson'>
				<p><b>Persons</b></p>
			</div>
			<div id='entityLabelOrganization'>
				<p><b>Organizations</b></p>    
			</div>
		</div>
		
		<div id="clear"></div> 

		<div id="content">
			<div id="contentTopics">
				<!---<p>This is a topic.</p> -->
				<div id="contentTopicsTerms" >
				</div>

				<div id="contentTopicsSparklines" >
				</div>			
				
				<div id="contentTopicsNotifications">
					<!---<p>nt</p>-->
				</div>
				
				<div id="contentTopicsPadding">
				</div>
			
			</div>
			
			
			<div id="contentPersons">
				<!---<p>This is a person.</p> -->
				<div id="contentPersonsTerms" >
				</div>

				<div id="contentPersonsSparklines" >
				</div>			
				
				<div id="contentPersonsNotifications">
					<!---<p>nt</p>-->
				</div>
				
				<div id="contentPersonsPadding">
				</div>
				
			</div>
			<div id="contentOrganizations">
				<!---<p>This is an organization.</p> -->
				
				<div id="contentOrganizationsTerms" >
				</div>

				<div id="contentOrganizationsSparklines" >
				</div>			
				
				<div id="contentOrganizationsNotifications">
					<!---<p>nt</p>-->
				</div>
				
				<div id="contentOrganizationsPadding">
				</div>
			
			</div>
		</div>
		
		<div id="clear"></div> 
		
		<div id="lowerContent">
			<div id="lowerContentHierarchyChart">			
			</div>		
			<div id="contentSpacing">
			</div>
			<div id="textWindow">
				<img id="close" src="images/close.png" />
				<div id="lowerContentTextWindow">
				</div>				
			</div>	
				
		</div>
		<script type="text/javascript">


			var sparkline_data 	= <?php echo json_encode($sparklinesObjects); ?>;			// from sparklines.php
			var hierarchicalData = <?php echo json_encode($hierarchicalData , JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE); ?>;					// from hierachicalChart.php
			var zscoreLimit =   <?php echo $zscoreLimit; ?>;	//from setting.php
			var titleByUUID =   <?php echo json_encode($result_title_by_uuid_array, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE); ?>; //from sparklines.php
			var entityByUUID =   <?php echo json_encode($result_entity_by_uuid_array, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE); ?>; //from sparklines.php
			var areas = [
					        {"id":"2","area":"Topics","color":"#374900"},
					        {"id":"3","area":"Persons","color":"#0f2d4f"},
					        {"id":"4","area":"Organizations","color":"#2f0f4f"},
					    ];
			areaIds = {};
		
			createSparklineChart(sparkline_data, zscoreLimit);
			
			createHierarchicalChart(hierarchicalData, areas, titleByUUID, sparkline_data); //create hierarchical charts
			addNewsLabelFromHierarchicalChart(); //allow news loading in window from hierarchical chord

			
			
		</script>

 	</body>
</html>
