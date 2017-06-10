<?php

require_once('common_function.php');

$db = new mysqli($db_host , $db_user, $db_password, $db_name); // location, user, pass, database to use

$extent = $_POST ["timerange"] ;
list($extent_start, $extent_end ) = explode("-", $extent);
$currentType = $_POST ["type"] ;
$currentList = json_decode( $_POST ["currentList"] ) ;

$end_timestamp = $extent_end;
$start_timestamp = $end_timestamp - (8*3600); //deduct 2 hours from end time

$query = "SELECT a.uuid, a.year, a.day, a.hour, a.minute, a.second, a.month, a.title, a.source, a.doc_url, a.unix_timestamp, a.person, a.organization, a.topic, b.content, a.weekday FROM NewsMetaData a, NewsContent b WHERE b.content IS NOT NULL AND trim(coalesce(b.content, '')) <>'' AND a.unix_timestamp>=".$start_timestamp." AND a.unix_timestamp<=".$end_timestamp ." AND a.uuid = b.uuid ORDER BY a.unix_timestamp" ;

$result_db = $db->query($query);

if(!$result_db) // Verify the tweet query did not fail.
{
	printf("Query failed: " . $db->error);
	exit();
}

$html = "";

if ($result_db->num_rows != 0)
{
	while ($text_row = $result_db->fetch_assoc())
	{
		$uuid = $text_row ["uuid"];

		$title = $text_row ["title"];
		$title = preg_replace('/[^a-zA-Z0-9_ %\[\]\.\(\)%&-]/s', '', $title);
		$source = $text_row ["source"];
		$url = $text_row ["doc_url"];
		$text = $text_row ["content"];
		//$text = preg_replace('/[^a-zA-Z0-9_ %\[\]\.\(\)%&-]/u', '', $text);
		$text = cleanText($text);

		$text = formatUrlInString($text);
		$text = formatNewsContent($text, 4 ); //4 sentences formatted with paragraph tags



		$unix_timestamp = $text_row ["unix_timestamp"];

		//$text = preg_replace('/[^a-zA-Z0-9_ %\[\]\.\(\)%&-]/s', '', $text);

		$person = trim($text_row ["person"]);
		$organization = trim($text_row ["organization"]);
		$topic = trim($text_row ["topic"]);
		$week_day = $text_row ["weekday"];

		//$type = $person.$organization.$topic;
		//$type = trim( preg_replace( "/[^0-9a-z]+/i", "", $type ) );

		$named_entity = $person.",".$organization;
		$named_entity_arr = explode( ',',$named_entity ) ;
		$named_entity_arr = array_filter($named_entity_arr);//remove nulls

		$named_entity_arr = getNamedEntity($named_entity_arr);



		////////////////////////////determining beginning of news in window/////////////////////////////////////////
		sort($named_entity_arr); //sort the array based on string
		//$str = serialize($named_entity_arr); //convert to string

		$str = implode("-", $named_entity_arr); //named
		$md5Val = md5($str);


		//$uuid = 'id_'.$uuid.'_'.$unix_timestamp.'_'.$type.'_'.$week_day.'_'.$md5Val.'_'.$str;

		$newLabel = cssStyleID($term);

		$uuid = 'id_'.$uuid.'_'.$unix_timestamp.'_'.$newLabel.'_'.$md5Val.'_'.$str;
		$relatedNewsDiv = "related".$uuid ;
		$source = cleanText($source);
		if (trim($text) )
		{

		$html = $html."<div id=\"$uuid\">
		<div class=\"newsTitle\">
		<p > $title </p>
		</div>
		<div class=\"clear\"></div>
		<div class=\"newsText\">
		<p> $text </p>
		</div>
		<div class=\"clear\"></div>

		<div class=\"newsFooter\">
		<div class=\"newsSource\">
		<p>$source</p>
		<p><a href='$url' target=\"_blank\" >Read news from source</a> </p>
		</div>


		<div class=\"newsDate\">
		</div>

		</div>

		<div class=\"clear\"></div><hr > </hr >
		</div> ";
		}

	}
}


header("HTTP/1.0 200 OK");
echo  $html ; // send back json object

?>


