<?php
session_start();
require_once('lib/underscore.php');
require_once('function_processing.php');
require_once('lib/db_config.php');
require_once('settings.php');

require_once('important_words.php');



$db = new mysqli($db_host , $db_user, $db_password, $db_name); // location, user, pass, database to use

$extent = getFullExtent ($db, $window_size_in_days);
$query = "SELECT uuid, year, day, hour, minute, second, month, person, organization, topic, title, summary, source, doc_url, unix_timestamp FROM NewsMetaData WHERE unix_timestamp>=".$extent["old"]." AND unix_timestamp<=".$extent["new"]." ORDER BY unix_timestamp" ;       
$result_db = $db->query($query);

if(!$result_db) // Verify the tweet query did not fail.
{
	printf("Query failed: " . $db->error);
	exit();
}

$result_array = array();

while ($row = $result_db->fetch_assoc())
{
	$result_array[] = $row;
}

//$time_aggregation from settings.php
$output = getAggregation($db, $extent, $time_aggregation );

$interval = $output["interval"];
$oldest_date_string = $output["oldDate"];

$aggregatedData = getTimelineData($result_array,  $interval, $oldest_date_string  );
$newsObjWithScore = getNewsWithDecayAndImportantScore($aggregatedData , $result_array );

?>