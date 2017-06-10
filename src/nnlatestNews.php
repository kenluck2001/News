<?php

// session_start ();
// session_write_close ();
require_once('common_function.php');


function getEntityTerm($db, $start_timestamp, $end_timestamp, $currentType, $currentList)
{
	if (! empty ( $currentList ))
	{
		$query = "select a.uuid, a.unix_timestamp, a.topic, a.person, a.organization from NewsMetaData a, NewsContent b WHERE ( b.content IS NOT NULL AND trim(coalesce(b.content, '')) <>'' AND a.uuid = b.uuid AND a.unix_timestamp>='$start_timestamp' AND a.unix_timestamp<='$end_timestamp' )  ;";

		$result = $db->query ( $query );

		if (! $result) // Verify the tweet query did not fail.
		{
			printf ( "Query failed: " . $db->error );
			exit ();
		}

		$result_array = array ();

		while ( $row = $result->fetch_assoc () )
		{
			$uuid = $row ["uuid"];
			$timestamp = $row ["unix_timestamp"];
			$topic = $row ["topic"];
			$person = $row ["person"];
			$organization = $row ["organization"];

			$named_entity = $person . "," . $organization . "," . $topic;
			$named_entity_arr = explode ( ',', $named_entity );
			$named_entity_arr = array_filter ( $named_entity_arr ); // remove nulls

			$searchNamedEntity = $named_entity_arr;

			// ////////////////////////////////

			$unix_timestamp = $text_row ["unix_timestamp"];

			$named_entityLbl = $person . "," . $organization;
			$named_entityLbl_arr = explode ( ',', $named_entityLbl );
			$named_entityLbl_arr = array_filter ( $named_entityLbl_arr ); // remove nulls

			$named_entityLbl_arr = getNamedEntity ( $named_entityLbl_arr );

			// //////////////////////////determining beginning of news in window/////////////////////////////////////////
			sort ( $named_entityLbl_arr ); // sort the array based on string
			// $str = serialize($named_entity_arr); //convert to string

			$str = implode ( "-", $named_entityLbl_arr ); // named
			$md5Val = md5 ( $str );
			if ($currentType == "topic") {
				$topic_arr = explode ( ',', $topic );
				$topic_arr = array_filter ( $topic_arr ); // remove nulls
				
				$outArr = __::intersection ( $currentList, $topic_arr );
				$outArr = __::uniq ( $outArr );
				
				foreach ( $outArr as $searchTerm ) {
					$newLabel = cssStyleID ( $searchTerm );
					
					$cssuuid = 'id_' . $uuid . '_' . $unix_timestamp . '_' . $newLabel . '_' . $md5Val . '_' . $str;
					
					$arr_obj = array (
							"uuid" => $uuid,
							"unix_timestamp" => $timestamp,
							"type" => $searchNamedEntity,
							"md5hash" => $md5Val,
							"str" => $str 
					);
					$result_array [] = $arr_obj;
				}
			} else if ($currentType == "person") {
				$person_arr = explode ( ',', $person );
				$person_arr = array_filter ( $person_arr ); // remove nulls
				
				$outArr = __::intersection ( $currentList, $person_arr );
				
				foreach ( $outArr as $searchTerm ) {
					$newLabel = cssStyleID ( $searchTerm );
					
					$cssuuid = 'id_' . $uuid . '_' . $unix_timestamp . '_' . $newLabel . '_' . $md5Val . '_' . $str;
					
					$arr_obj = array (
							"uuid" => $uuid,
							"unix_timestamp" => $timestamp,
							"type" => $searchNamedEntity,
							"md5hash" => $md5Val,
							"str" => $str 
					);
					$result_array [] = $arr_obj;
				}
			} else if ($currentType == "organization") {
				$organization_arr = explode ( ',', $organization );
				$organization_arr = array_filter ( $organization_arr ); // remove nulls
				
				$outArr = __::intersection ( $currentList, $organization_arr );
				
				foreach ( $outArr as $searchTerm ) {
					$newLabel = cssStyleID ( $searchTerm );
					
					$cssuuid = 'id_' . $uuid . '_' . $unix_timestamp . '_' . $newLabel . '_' . $md5Val . '_' . $str;
					
					$arr_obj = array (
							"uuid" => $uuid,
							"unix_timestamp" => $timestamp,
							"type" => $searchNamedEntity,
							"md5hash" => $md5Val,
							"str" => $str 
					);
					$result_array [] = $arr_obj;
				}
			}
			
		}
		return $result_array;
	}
}

$extent = $_POST ["timerange"] ;
list($extent_start, $extent_end ) = explode("-", $extent);
$currentType = $_POST ["type"] ;
$currentList = json_decode( $_POST ["currentList"] ) ;

$end_timestamp = $extent_end;
$start_timestamp = $end_timestamp - (8*3600); //deduct 2 hours from end time

$output = NULL;


$db = new mysqli($db_host , $db_user, $db_password, $db_name); // location, user, pass, database to use
$output = getEntityTerm($db, $start_timestamp, $end_timestamp, $currentType, $currentList) ;


$output = json_encode($output);
header("HTTP/1.0 200 OK");
echo  $output ; // send back json object


?>