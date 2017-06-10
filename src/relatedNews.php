<?php
session_start ();
session_write_close ();

require_once('common_function.php');

function getRelatedNews($db, $extent_start, $extent_end)
{
	 
	$query = "select  DISTINCT a.person, a.organization, a.uuid, a.unix_timestamp from news.NewsMetaData a, NewsContent b WHERE b.content IS NOT NULL AND trim(coalesce(b.content, '')) <>'' AND a.unix_timestamp>='$extent_start' AND a.unix_timestamp<='$extent_end' AND a.uuid = b.uuid ORDER BY a.unix_timestamp;";
	$result = $db->query ( $query );

	if (! $result) // Verify the tweet query did not fail.
	{
		printf ( "Query failed: " . $db->error );
		exit ();
	}

	$news_ObjectHash = array();
	$news_Object = array();
	$groupByHash = array();
	$hash_array = array();
	
	$importantWords = $_SESSION["important_words"];


	while ($text_row = $result->fetch_assoc())
	{
		$person = $text_row["person"];
		$organization = $text_row["organization"];
		$currentID = $text_row["uuid"];
		$currentTime = $text_row["unix_timestamp"];
		$named_entity = $person.",".$organization;
		$named_entity_arr = explode( ',',$named_entity ) ;
		$named_entity_arr = array_filter($named_entity_arr);//remove nulls

		////////////////////////////determining beginning of news in window/////////////////////////////////////////
		sort($named_entity_arr); //sort the array based on string
		//$str = serialize($named_entity_arr); //convert to string
		
		$named_entity_arr = array_map('strtolower', $named_entity_arr);
		
		$set_Object = array_intersect($named_entity_arr, $importantWords);
		$set_Object = array_filter($set_Object); //calculate importance score
		
		$str = implode("-", $named_entity_arr);
		$md5Val = md5($str);
		
		if (!empty($named_entity_arr))
		{

			$currentData = array(
					"id" => $currentID, //current ID
					"hash" => $md5Val, //hash
					"score" => count($set_Object )
			);
	
			//$news_ObjectHash[] = $currentData;
			
			
			if ( array_key_exists($md5Val, $news_ObjectHash ) )
			{
				array_push($news_ObjectHash[$md5Val], $currentData);
			}
			else
			{
				$news_ObjectHash[$md5Val] = array();
				array_push($news_ObjectHash[$md5Val], $currentData);
			}		
			
			
			if ( array_key_exists($md5Val, $groupByHash ) )
			{
				array_push($groupByHash[$md5Val], $currentID);
			}
			else
			{
				$groupByHash[$md5Val] = array();
				array_push($groupByHash[$md5Val], $currentID);
			}
			
			array_push($hash_array, $md5Val);
		}

	}
	
	foreach ( $hash_array as $currentHash )
	{

		$currentElement = $news_ObjectHash[$currentHash];
		//sort by score
		$sortedElement = __::sortBy( $currentElement, function($n) { return $n["score"] ; });
		$currentIDArr = __::pluck($sortedElement, "id"); // select id from news
		
		$news_Object [$currentHash] = $currentIDArr ;

	
	}
	//sort by score
	

	//return $groupByHash;
	return $news_Object;
}


function createQuery($array)
{
	$sql = "";
	for($ind = 0; $ind < count ( $array )-1; $ind ++)
	{
		$currentID = $array[$ind];
		$sql = $sql. "  a.uuid= ".$currentID . " OR";
	}
	$sql = $sql."  a.uuid= ".end($array);	
	return $sql;
}


function buildHtmlForRelatedNews($db, $output, $relatedhash)
{
	/**
	 * $output is from getRelatedNews($db, $extent_start, $extent_end, $whereString )
	 */
	$newsIdArray = $output[$relatedhash];
	$num_of_elements = 8;
	$newsIdArray = array_slice($newsIdArray, 0, $num_of_elements); //use only six elements 
	$newsIdArray = implode('", "', $newsIdArray);
// 	$newsIdArray = '"'.$newsIdArray.'"';
	
// 	$newsIdArray = explode(',', $newsIdArray);
	
	$wherePart = '("'.$newsIdArray.'")';
	$query = "SELECT DISTINCT a.uuid, a.title, a.source, a.doc_url, a.unix_timestamp, a.person, a.organization, b.content FROM NewsMetaData a, NewsContent b WHERE a.uuid IN $wherePart ORDER BY a.unix_timestamp" ;


// 	$wherePart = createQuery($newsIdArray);
// 	$query = "SELECT a.uuid, a.title, a.source, a.doc_url, a.unix_timestamp, a.person, a.organization, b.content FROM NewsMetaData a, NewsContent b WHERE b.content IS NOT NULL AND $wherePart" ;
	
	$result = $db->query ( $query );
	
	if (! $result) // Verify the tweet query did not fail.
	{
		printf ( "Query failed: " . $db->error );
		exit ();
	}
	
	$html = "";
	
	if ($result->num_rows != 0)
	{
		//$html = $html."<div class=\"content\"> ";
		while ($text_row = $result->fetch_assoc())
		{
			$uuid = $text_row ["uuid"];
	
			$title = $text_row ["title"];
			$title = preg_replace('/[^a-zA-Z0-9_ %\[\]\.\(\)%&-]/s', '', $title);
			$source = $text_row ["source"];
			$url = $text_row ["doc_url"];
			$text = $text_row ["content"];
			
			$text = cleanText($text);
			$text = formatUrlInString($text);
	
	
			$unix_timestamp = $text_row ["unix_timestamp"];
	
			//$text = preg_replace('/[^a-zA-Z0-9_ %\[\]\.\(\)%&-]/s', '', $text);
	
			$person = $text_row ["person"];
			$organization = $text_row ["organization"];
	
			$named_entity = $person.",".$organization;
			$named_entity_arr = explode( ',',$named_entity ) ;
			$named_entity_arr = array_filter($named_entity_arr);//remove nulls
			
			////////////////////////////determining beginning of news in window/////////////////////////////////////////
			sort($named_entity_arr); //sort the array based on string
			//$str = serialize($named_entity_arr); //convert to string
			
			$str = implode(",", $named_entity_arr);
			$md5Val = md5($str);
			
			$uuid = 'id_'.$uuid.'_'.$md5Val;
			
			$text = formatUrlInString($text);
			
			$source = cleanText($source);
	
			$html =	$html."<div id=\"$uuid\">
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
			</div>  ";
		}
		//$html = $html."</div>";
	}
	return 	$html;
}



$db = new mysqli($db_host , $db_user, $db_password, $db_name); // location, user, pass, database to use

$relatedhash = $_POST ["hash"] ;
$extent = $_POST ["timerange"] ;

list($extent_start,$extent_end ) = explode("-", $extent);

// $extent_start = 1392755874;
// $extent_end = 1402662030;
// $relatedhash = "d41d8cd98f00b204e9800998ecf8427e";


$output = getRelatedNews($db, $extent_start, $extent_end );

$htmlStr = buildHtmlForRelatedNews($db, $output, $relatedhash);

header("HTTP/1.0 200 OK");
echo  $htmlStr ; // send back json object



?>









