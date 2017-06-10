<?php
session_start ();
session_write_close ();
require_once('common_function.php');


$db = new mysqli($db_host , $db_user, $db_password, $db_name); // location, user, pass, database to use

$extent = $_POST ["timerange"] ;
//$extent = "1392196521-1397455721";

list($extent_start,$extent_end ) = explode("-", $extent);




//$arregationSec = 21600;
$aggregType = $_SESSION["aggregation_type"];


//$arregationSec = $_SESSION["Days_vs_Hours"]["aggregSecY"];
// $arregationSec = $_SESSION[$aggregType]["aggregSecY"];

// $result_array = getData ( $db, $extent_start, $extent_end, $arregationSec );

// $hotnessObj = new determineHotnessOfEntity (  );
// $output = getHeatMapAggregatedDataDayvsHour( $result_array,  "topic");

$output;
$hotnessObj = new determineHotnessOfEntity (  );

if ( $aggregType == "Years_vs_Months")
{
	$arregationSec = $_SESSION[$aggregType]["aggregSecY"];
}
else if ( $aggregType == "Months_vs_Weeks")
{
	$arregationSec = $_SESSION[$aggregType]["aggregSecY"];
	$result_array = getData ( $db, $extent_start, $extent_end, $arregationSec );
	$outputTitle = getDataTitle($db, $extent_start,$extent_end, $arregationSec);
	
	$param = $_SESSION["type"];
	$output =  getHeatMapAggregatedDataMonthvsWeek( $result_array,  $param);
	$output["titleData"] = $outputTitle;
	
	$aggredData = $output["heat_map"];
	$outResult = getListOfEntities($db, $aggredData, $param, $extent_start, $extent_end );
	$output["facets"] = $outResult["facets"];
}
else if ( $aggregType == "Weeks_vs_Days")
{
	$arregationSec = $_SESSION[$aggregType]["aggregSecY"];
	$result_array = getData ( $db, $extent_start, $extent_end, $arregationSec );
	$outputTitle = getDataTitle($db, $extent_start,$extent_end, $arregationSec);
	
	$param = $_SESSION["type"];	
	$output =  getHeatMapAggregatedDataWeekvsDay( $result_array,  $param);
	$output["titleData"] = $outputTitle;
	
	$aggredData = $output["heat_map"];
	$outResult = getListOfEntities($db, $aggredData, $param, $extent_start, $extent_end );
	$output["facets"] = $outResult["facets"];
	
}
else if ( $aggregType == "Days_vs_Hours")
{
	$arregationSec = $_SESSION[$aggregType]["aggregSecY"];
	$result_array = getData ( $db, $extent_start, $extent_end, $arregationSec );
	$outputTitle = getDataTitle($db, $extent_start,$extent_end, $arregationSec);
	
	$param = $_SESSION["type"];
	$output = getHeatMapAggregatedDataDayvsHour( $result_array,  $param);
	$output["titleData"] = $outputTitle;
	
	$aggredData = $output["heat_map"];
	$outResult = getListOfEntities($db, $aggredData, $param, $extent_start, $extent_end );
	$output["facets"] = $outResult["facets"];
	
}
else
{
	//"Hours_vs_Minutes"
	$arregationSec = $_SESSION[$aggregType]["aggregSecY"];
	$result_array = getData ( $db, $extent_start, $extent_end, $arregationSec );
	$outputTitle = getDataTitle($db, $extent_start,$extent_end, $arregationSec);
	
	$param = $_SESSION["type"];
	$output = getHeatMapAggregatedDataHourvsMinute( $result_array,  $param);
	$output["titleData"] = $outputTitle;
	
	$aggredData = $output["heat_map"];
	$outResult = getListOfEntities($db, $aggredData, $param, $extent_start, $extent_end );
	$output["facets"] = $outResult["facets"];
	
}


$output = json_encode($output);
header("HTTP/1.0 200 OK");
echo  $output ; // send back json object


?>




		
	
	
	