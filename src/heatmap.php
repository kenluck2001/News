<?php

require_once('lib/db_config.php');
require_once('common_function.php');


$db = new mysqli($db_host , $db_user, $db_password, $db_name); // location, user, pass, database to use

if($db->connect_errno)
{
	printf ("Connection failed:" . $db->connect_error);
	exit();
}

//days vs hours
//$query = "select concat(21600*floor(a.unix_timestamp/21600),'-', 21600*floor(a.unix_timestamp/21600) + 21600) as range_t, count(*) as CountOfNews, a.day, a.month, a.year, a.day, a.month, a.weekday, a.hour, a.minute, a.second, a.weekno from news.NewsMetaData a group by range_t  order by range_t asc;";
// $arregationSec = 21600;
// $start_timestamp = 1392022800;
// $start_timestamp = intval($start_timestamp/$arregationSec) * $arregationSec;
// $end_timestamp = $start_timestamp + (24 * 6 * 3600); //6 days interval

// $arregationSec = 21600;
// $arregationDay = 3600 * 24;
// $start_timestamp = 1392022800;
// $start_timestamp = intval($start_timestamp/$arregationDay ) * $arregationDay ;
// $end_timestamp = $start_timestamp + (24 * 6 * 3600); //6 days interval


// $start_timestamp = 1399092800;
// $start_timestamp = intval($start_timestamp/$arregationDay ) * $arregationDay ;
// $end_timestamp= $start_timestamp + (24 * 6 * 3600); 

$extent = "1392196521-1397455721";
//$extent = "1392196521-1394874921";

list($extent_start,$extent_end ) = explode("-", $extent);
$arregationSec = 21600;

$heatMapData = getAggregatedData( $db, $extent_start, $extent_end, $arregationSec );



?>