<?php

//session_start();
require_once('lib/db_config.php');
require_once('function_processing.php');
require_once('settings.php');


// Declare a variable to contain all the news returned from the database query.
unset($json_news_graph_data);
unset($interval);
unset($oldest_date_string);

$db = new mysqli($db_host , $db_user, $db_password, $db_name); // location, user, pass, database to use
$extent = getFullExtent ($db, $window_size_in_days);									

// add aggregation function here
//$time_aggregation from settings.php
$output = getAggregation($db, $extent, $time_aggregation );

$interval = $output["interval"];
$oldest_date_string = $output["oldDate"];

unset($result_array);
$result_array = array();

//$_SESSION["extent"]= $extent;

$query = "SELECT uuid, year, day, hour, minute, second, month, person, organization, topic, title, summary, source, doc_url, unix_timestamp FROM NewsMetaData WHERE unix_timestamp>=".$extent["old"]." AND unix_timestamp<=".$extent["new"] ;

$result_db = $db->query($query);

if(!$result_db) // Verify the tweet query did not fail.
{
	printf("Query failed: " . $db->error);
	exit();
}	

while ($row = $result_db->fetch_assoc()) 
{
	$result_array[] = $row;
}

//$number_of_sparklines from settings.php

$sparklinesObjects = SparklineSortByZscore($result_array, $interval, $oldest_date_string, $number_of_sparklines);

$result_title_by_uuid_array = array();
foreach ( $result_array as $text_row )
{
	$uuid = $text_row ["uuid"];
	$title = $text_row ["title"];
	$result_title_by_uuid_array[$uuid] = $title;
}

$result_entity_by_uuid_array = array();


foreach ( $result_array as $text_row )
{
	$uuid = $text_row ["uuid"];
	$person = $text_row ["person"];
	$organization = $text_row ["organization"];
	$entity = $person.",".$organization;
	$entity_array =  explode(",", $entity);
	$result_entity_by_uuid_array[$uuid] = $entity_array;
}




?>


