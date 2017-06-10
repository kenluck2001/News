<?php
session_start ();
session_write_close ();
require_once('common_function.php');


function searchEntityByTerm($db, $start_timestamp, $end_timestamp, $currentType, $currentList, $searchParam) 
{
	if (! empty ( $currentList )) 
	{
		$query = "";
		$currentListStr = "";
		if ($currentType == "topic") 
		{
			$personList = "";
			$organizationList = "";
			foreach ( $searchParam as $key => $value ) 
			{
				if (! empty ( $value  )) 
				{
					if ($key == "person") {
						$personList = implode ( "|", $value );
					} 
					else if ($key == "organization") 
					{
						$organizationList = implode ( "|", $value );
					}
				}
			}
			
			$currentListStr = implode ( "|", $currentList );
			
			if (! empty ( $personList ) && ! empty ( $organizationList )) 
			{
				$query = "select a.uuid, a.unix_timestamp, a.topic, a.person, a.organization from NewsMetaData a, NewsContent b WHERE ( b.content IS NOT NULL AND a.uuid = b.uuid AND a.unix_timestamp>='$start_timestamp' AND a.unix_timestamp<='$end_timestamp' AND a.topic REGEXP '$currentListStr') AND (a.person REGEXP '$personList' OR a.organization REGEXP '$organizationList') ;";
			} 
			else if (! empty ( $personList ) && empty ( $organizationList )) 
			{
				$query = "select a.uuid, a.unix_timestamp, a.topic, a.person, a.organization from NewsMetaData a, NewsContent b WHERE ( b.content IS NOT NULL AND a.uuid = b.uuid AND a.unix_timestamp>='$start_timestamp' AND a.unix_timestamp<='$end_timestamp' AND a.topic REGEXP '$currentListStr') AND (a.person REGEXP '$personList') ;";
			} 
			else if (empty ( $personList ) && ! empty ( $organizationList )) 
			{
				$query = "select a.uuid, a.unix_timestamp, a.topic, a.person, a.organization from NewsMetaData a, NewsContent b WHERE ( b.content IS NOT NULL AND a.uuid = b.uuid AND a.unix_timestamp>='$start_timestamp' AND a.unix_timestamp<='$end_timestamp' AND a.topic REGEXP '$currentListStr') AND ( a.organization REGEXP '$organizationList') ;";
			}
		} 
		else if ($currentType == "person") 
		{
			$topicList = "";
			$organizationList = "";
			foreach ( $searchParam as $key => $value ) 
			{
				if (! empty ( $value  ))
				{
					if ($key == "topic") 
					{
						$topicList = implode ( "|", $value );
					} 
					else if ($key == "organization") 
					{
						$organizationList = implode ( "|", $value );
					}
				}
			}
			
			$currentListStr = implode ( "|", $currentList );
			
			if (! empty ( $topicList ) && ! empty ( $organizationList )) 
			{
				$query = "select a.uuid, a.unix_timestamp, a.topic, a.person, a.organization from NewsMetaData a, NewsContent b WHERE ( b.content IS NOT NULL AND a.uuid = b.uuid AND a.unix_timestamp>='$start_timestamp' AND a.unix_timestamp<='$end_timestamp' AND a.person REGEXP '$currentListStr' ) AND (a.topic REGEXP '$topicList' OR a.organization REGEXP '$organizationList')  ;";
			} 
			else if (! empty ( $topicList ) && empty ( $organizationList )) 
			{
				$query = "select a.uuid, a.unix_timestamp, a.topic, a.person, a.organization from NewsMetaData a, NewsContent b WHERE ( b.content IS NOT NULL AND a.uuid = b.uuid AND a.unix_timestamp>='$start_timestamp' AND a.unix_timestamp<='$end_timestamp' AND a.person REGEXP '$currentListStr' ) AND (a.topic REGEXP '$topicList')  ;";
			} 
			else if (empty ( $topicList ) && ! empty ( $organizationList )) 
			{
				$query = "select a.uuid, a.unix_timestamp, a.topic, a.person, a.organization from NewsMetaData a, NewsContent b WHERE ( b.content IS NOT NULL AND a.uuid = b.uuid AND a.unix_timestamp>='$start_timestamp' AND a.unix_timestamp<='$end_timestamp' AND a.person REGEXP '$currentListStr' ) AND (a.organization REGEXP '$organizationList')  ;";
			}
		} 
		else if ($currentType == "organization") 
		{
			$topicList = "";
			$personList = "";
			foreach ( $searchParam as $key => $value ) 
			{
				if (! empty ( $value  ))
				{
					if ($key == "topic") 
					{
						$topicList = implode ( "|", $value );
					} 
					else if ($key == "person") 
					{
						$personList = implode ( "|", $value );
					}
				}
			}
			
			$currentListStr = implode ( "|", $currentList );
			
			if (! empty ( $topicList ) && ! empty ( $personList )) 
			{
				$query = "select a.uuid, a.unix_timestamp, a.topic, a.person, a.organization from NewsMetaData a, NewsContent b WHERE ( b.content IS NOT NULL AND a.uuid = b.uuid AND a.unix_timestamp>='$start_timestamp' AND a.unix_timestamp<='$end_timestamp' AND a.organization REGEXP '$currentListStr' ) AND (a.person REGEXP '$personList' OR a.topic REGEXP '$topicList') ;";
			} 
			else if (! empty ( $topicList ) && empty ( $personList )) 
			{
				$query = "select a.uuid, a.unix_timestamp, a.topic, a.person, a.organization from NewsMetaData a, NewsContent b WHERE ( b.content IS NOT NULL AND a.uuid = b.uuid AND a.unix_timestamp>='$start_timestamp' AND a.unix_timestamp<='$end_timestamp' AND a.organization REGEXP '$currentListStr' ) AND ( a.topic REGEXP '$topicList') ;";
			} 
			else if (empty ( $topicList ) && ! empty ( $personList )) 
			{
				$query = "select a.uuid, a.unix_timestamp, a.topic, a.person, a.organization from NewsMetaData a, NewsContent b WHERE ( b.content IS NOT NULL AND a.uuid = b.uuid AND a.unix_timestamp>='$start_timestamp' AND a.unix_timestamp<='$end_timestamp' AND a.organization REGEXP '$currentListStr' ) AND (a.person REGEXP '$personList' ) ;";
			}
		}
		
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
			
			if ($currentType == "topic") 
			{
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
			} 
			else if ($currentType == "person") 
			{
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
			} 
			else if ($currentType == "organization") 
			{
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
list($extent_start,$extent_end ) = explode("-", $extent);
$searchParam = json_decode(  $_POST ["searchparam"] , true );
$currentType = $_POST ["type"] ;
$currentList = json_decode( $_POST ["currentList"] ) ;


$output = NULL;


$db = new mysqli($db_host , $db_user, $db_password, $db_name); // location, user, pass, database to use
$output = searchEntityByTerm($db, $extent_start,$extent_end , $currentType, $currentList, $searchParam );


$output = json_encode($output);
header("HTTP/1.0 200 OK");
echo  $output ; // send back json object


?>