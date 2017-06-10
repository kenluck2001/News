<?php
require_once('news_decay.php');
require_once('lib/underscore.php');
require_once('settings.php');

function formatUrlInString($text)
{
	$reg_exUrl = "/((((http|https|ftp|ftps)\:\/\/)|www\.)[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,4}(\/\S*)?)/";
	$text = preg_replace( $reg_exUrl, "<a href=\"$1\"  target=\"_blank\"   >$1</a> ", $text ) ;
	return $text;
}

$db = new mysqli($db_host , $db_user, $db_password, $db_name); // location, user, pass, database to use

$extent = getFullExtent ($db, $window_size_in_days);

$query = "SELECT a.uuid, a.year, a.day, a.hour, a.minute, a.second, a.month, a.title, a.source, a.doc_url, a.unix_timestamp, b.content FROM NewsMetaData a, NewsContent b WHERE a.unix_timestamp>=".$extent["old"]." AND a.unix_timestamp<=".$extent["new"]." AND a.uuid = b.uuid ORDER BY a.unix_timestamp" ;
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

$newData = array();
$monthArray = array("Jan", "Feb", "Mar", "April","May", "Jun", "July", "Aug","Sept", "Oct", "Nov","Dec");

foreach ( $result_array as $text_row )
{
	$uuid = $text_row ["uuid"];
	$year = $text_row ["year"];
	$day = $text_row ["day"];
	$hour = $text_row ["hour"];
	$minute = $text_row ["minute"];
	$second = $text_row ["second"];
	$month = intval ($text_row ["month"]);
	
	$title = $text_row ["title"];
	$source = $text_row ["source"];
	$url = $text_row ["doc_url"];
	$content = $text_row ["content"];
	
	
	$date = $hour.":".$minute.":".$second."    ".$day.",". $monthArray[$month]. " ".$year;
	$currentData = array(
			"title" => $title,
			"text" => $content,
			"source" => $source,
			"date" => $date,
			"url"  => $url
	);
	$newData[$uuid] = $currentData;
}


$news_id_strings = $_POST ["newsid_strings"] ;

$news_id_array = explode(",", $news_id_strings);
//$news_id_array = array_filter($news_id_array);

$sortedNewsObjWithScore = __::sortBy($newsObjWithScore, function($n) { return (-1 * $n["score"]*$n["weight"] * $n["repeatWeight" ]) ; });

$sortedNewsID = __::pluck($sortedNewsObjWithScore, "id");
$selectNewsID = __::intersection( $sortedNewsID, $news_id_array );

$html = "";
foreach ($selectNewsID as &$id) 
{
	$currentData = $newData[$id];
	$title = $currentData["title"];
	$text = $currentData["text"];
	$source = $currentData["source"];
	$date = $currentData["date"];
	$url =  $currentData["url"];
	
	$html =	$html."<div id=\"$id\">
	<div class=\"newsTitle\">
	<p > $title </p>
	</div>
	<div id=\"clear\"></div>
	<div class=\"newsText\">
	<p> $text </p>
	</div>
	<div id=\"clear\"></div>
	
	<div class=\"newsFooter\">
	<div class=\"newsSource\">
	<p>$source</p>
	<p>$url</p>
	</div>
	
	<div class=\"newsDate\">
	<p>$date</p>
	</div>
	</div>
	</div> <div id=\"clear\"></div><hr > </hr > ";

}

header("HTTP/1.0 200 OK");
$html = formatUrlInString($html);
echo  $html ; // send back json object

?>