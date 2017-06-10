<?php
require_once ('lib/db_lib.php');
date_default_timezone_set ( 'UTC' );
$oDB = new db ();

//{"duplicate","person","content","organization","source","title","summary","language","url","uuid","published", "topic"}
$DOCPATH = getcwd();
$FULLPATH = $DOCPATH."/"."data/google-documents.json";
$string = file_get_contents($FULLPATH);

$json =  json_decode($string,true );

for ($ind=0; $ind< count($json); $ind++)
{
	$currentRowObj = $json[$ind];	

	$doc_url = $currentRowObj["url"];
	$language = $currentRowObj["language"];
	$source = $currentRowObj["source"];
	$summary = $currentRowObj["summary"];
	$title = $currentRowObj["title"];
	
	$time_string = $currentRowObj["published"];	
	$dt   = new DateTime($time_string);
	$dt->setTimezone(new DateTimeZone('UTC'));	
	
	$unix_timestamp = $dt->getTimestamp();
	

	
	$uuid = $currentRowObj["uuid"];
	
	$weekday = gmdate('N', $unix_timestamp); // 1-7
	$month = gmdate('m', $unix_timestamp); // 1-12
	$day = gmdate('d', $unix_timestamp); // 1-31
	

	$hour = gmdate('H', $unix_timestamp);
	$minute = gmdate('i', $unix_timestamp);
	$second = gmdate('s', $unix_timestamp);
	$weekNumberInYear = gmdate('W', $unix_timestamp); //convert to week number
	
	
	$year = gmdate('Y', $unix_timestamp); // 2004
	/**
	 * convert timestamp to gmt
	 */	

		
	
	$organization = "";
	$person = "";
	$topic = "";
	$duplicate = "";
	
	if (array_key_exists("duplicate", $currentRowObj)) {
		$duplicate = $currentRowObj["duplicate"];
	}
	
	if (array_key_exists("person", $currentRowObj)) {
		$current_person_list = $currentRowObj["person"];
	 	$person = join(",", $current_person_list);
	}
	
	if (array_key_exists("organization", $currentRowObj)) {
	 	$current_organization_list = $currentRowObj["organization"];
	 	$organization = join(",", $current_organization_list);
	}
	
	if (array_key_exists("topic", $currentRowObj)) {
	 	$current_topic_list = $currentRowObj["topic"];
	 	$topic = join(",", $current_topic_list);
	}
	/**
	 * 
	 * $unix_timestamp = 1421276307;
	 * $hour = date('W', $unix_timestamp); //convert to week number
	 * echo $hour;
	 */
	$field_values = 'day = ' . $day . ', ' .
			'doc_url = "' . $doc_url . '", ' .
			'duplicate = "' . $duplicate . '", ' .
			'hour = "' . $hour . '", ' .
			'language = "' . $language . '", ' .
			'minute = "' . $minute . '", ' .
			'month = "' . $month . '", ' .
			'organization = "' . $organization . '", ' .
			'person = "' . $person . '", ' .
			'second = "' . $second . '", ' .
			'source = "' . $source . '", ' .
			'summary = "' . $summary . '", ' .
			'title = "' . $title . '", ' .
			'topic = "' . $topic . '", ' .
			'unix_timestamp = "' . $unix_timestamp . '", ' .
			'uuid = "' . $uuid . '", ' .		
			'year = "' . $year . '", ' .			
			'weekno = "' . $weekNumberInYear . '", ' .
			'weekday = "' . $weekday . '"' ;
	
	
	
	if ($oDB->in_table('NewsMetaData','uuid="' . $uuid . '"')) {
		$oDB->update('NewsMetaData',$field_values,'uuid = "' .$uuid . '"');
	} else {
		$oDB->insert('NewsMetaData',$field_values);
	}	
	
	
	$content = $currentRowObj["content"];
	
	$fld_values = 'uuid = "' . $uuid . '", ' .
			'content = "' . $content . '"' ;
	
	if ($oDB->in_table('NewsContent','uuid="' . $uuid . '"')) {
		$oDB->update('NewsContent',$fld_values,'uuid = "' .$uuid . '"');
	} else {
		$oDB->insert('NewsContent',$fld_values);
	}
	
	
 }
?>