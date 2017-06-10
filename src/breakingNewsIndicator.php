<?php
require_once('common_function.php');
require_once ('probabilisticEWMA.php');

function getBreakingNewsTimeSeries($result_array )
{
	/**
	 * get the breaking news data in a time series
	 */
	$news_ObjectHash = array();

	$news_Object = array();
	$groupByHash = array();
	$output = array();
	$hash_array = array();
	foreach ( $result_array as $text_row )
	{
		$person = $text_row["person"];
		$organization = $text_row["organization"];
		$currentID = $text_row["uuid"];
		$currentTime = $text_row["unix_timestamp"];
		$currentSource = $text_row["source"];

		$named_entity = $person.",".$organization;
		$named_entity_arr = explode( ',',$named_entity ) ;

		$named_entity_arr = array_filter($named_entity_arr);//remove nulls
		
		

		////////////////////////////determining beginning of news in window/////////////////////////////////////////
		sort($named_entity_arr); //sort the array based on string

		$str = serialize($named_entity_arr); //convert to string
		$md5Val = md5($str);
		$typeVal = implode("-", $named_entity_arr);

		$currentData = array(
				"id" => $currentID, //current ID
				"hash" => $md5Val, //hash
				"time" => $currentTime,
				"source" => $currentSource,
				//"type"=> $typeVal,
				"entities"=> $named_entity_arr
		);
		
		if ( array_key_exists($md5Val, $groupByHash ) )
		{
			array_push($groupByHash[$md5Val], $currentData);
		}
		else
		{
			$groupByHash[$md5Val] = array();
			array_push($groupByHash[$md5Val], $currentData);
		}
		
		
		$hash_array[] =  $md5Val;
	}


	$hash_array_duplicates = array_count_values($hash_array);


	foreach ( $hash_array as $key => $value )
	{
		$currentHash = $value;
		$count = $hash_array_duplicates[$currentHash];

		$currentElement = $groupByHash[$currentHash];
		//sort by timestamp
		$sortedElement = __::sortBy($currentElement, function($n) { return $n["time"] ; });

		$timeArr = __::pluck($currentElement, "time");
		$avgtime = array_sum ($timeArr ) / count ($timeArr );
		
		$sourceArr = __::pluck($currentElement, "source");
		$hashSourceArr = array_count_values($sourceArr);
		$uniqSourceList = array_keys($hashSourceArr);
		
		
				
		//get last element 
		$lastElem = end($sortedElement);
		$currentID = $lastElem["id"];
		$currentTimestamp = $lastElem["time"];
		//$currentType = $lastElem["type"];
		
		$currentEntity = $lastElem["entities"];
		$temp = array();
		
		$curData = array(
				"id" => $currentID, //current ID
				"Avgtime" => $avgtime,
				"numSource" => count($uniqSourceList),
				"time" => $currentTimestamp,
				"type" => $currentEntity
				//"type" => $currentType
		);
		$news_Object[] = $curData;

	}

	return $news_Object;
}


if (! (class_exists ( 'BreakingNewsDetection' ))) 
{
	class BreakingNewsDetection
	{
		/**
		 * *
		 * @counter is used to determine when we are in training mode or normal mode
		 * @trainingFlag if true then we are in training mode, else we are in normal mode
		 * @ewmaObj is instance of the probabilisticEWMA class
		 * @result_array is the data set
		 */
		private $counter;
		private $ewmaObj;
		private $trainingFlag;
		private $data;
		private $minimumSize; // threshold to ensure it is not empty
		public function __construct() // seprate the data by subjects
		{
			/**
			 * $flag set to true means we are in training mode
			 */
			$this->counter = 0;
			$this->minimumSize = 1; //number of sources must be at least equal to this
			$this->trainingFlag = true;
		}
		
		
		public function setData($data) // seprate the data by subjects
		{
			/**
			 * $flag set to true means we are in training mode
			 */
			$this->data = $data;
		}
		
		
		public function getAnomalyScore( ) 
		{
			/**
			 * *put data in a format for easy mathematical computation and calculate anomaly score for each entity
			 */
			$this->data  = __::sortBy ( $this->data, function ($obj) {
				return $obj ["Avgtime"];
			} ); // sort by timestamp

			$output = array();

			$currentDataList = __::pluck($this->data, "numSource");
			
			/**
			 * training mode as a seed for the operation as default
			*/
			$this->ewmaObj = new probabilisticEWMA ( $currentDataList, $this->trainingFlag );

			/**
			* after training the model
			*/
			$this->ewmaObj ->setData ( $currentDataList );

				
			$anomalyScoreList = $this->ewmaObj->calcAnomalyScore ();
			for($ind = 0; $ind < count ( $anomalyScoreList ); $ind ++) 
			{
				$anomalyScore = $anomalyScoreList[$ind];
				$currentData = $this->data[$ind];
				$currentID = $currentData["id"];
				$numberOfSources = $currentData["numSource"];
				$currentTimestamp = $currentData["time"];
				$currentType = $currentData["type"];
				$status = 0;
				//if ( ($anomalyScore < 0.044) && ($numberOfSources >= $this->minimumSize) )
				if ( ($anomalyScore < 0.0044) && ($numberOfSources >= $this->minimumSize) )
				
				{
					$status = 1;
					
					$curData = array(
							"id" => $currentID, //current ID
							"time" => $currentTimestamp,
							"status" => $status,
							"type" => $currentType
					);
					$output[] = $curData;
				}

			}

			return $output;

		}
	}
}


function getBreakingNewsData($db, $extent)
{
	
	list($extent_start,$extent_end ) = explode("-", $extent);
	$query = "select * from news.NewsMetaData a, NewsContent b WHERE b.content IS NOT NULL AND a.uuid = b.uuid  AND a.unix_timestamp>='$extent_start' AND a.unix_timestamp<='$extent_end';";
	$result = $db->query ( $query );
	
	if (! $result) // Verify the tweet query did not fail.
	{
		printf ( "Query failed: " . $db->error );
		exit ();
	}
	
	$result_array = array();
	
	while ( $row = $result->fetch_assoc () )
	{
		$text = $row ["content"];
		if (trim($text) )
		{
			$result_array[] = $row ;
		}
	}
	
	$data = getBreakingNewsTimeSeries($result_array );
	
	return $data;
}


$db = new mysqli($db_host , $db_user, $db_password, $db_name); // location, user, pass, database to use

$extent = $_POST ["timerange"] ;

// $extent = "1301650230-1402661030";

$data = getBreakingNewsData($db, $extent);



$breakObj = new BreakingNewsDetection();
$breakObj->setData($data);
$outputArr  = $breakObj->getAnomalyScore( );



$uuidArr =  array();





$html = '<ul id="js-news" class="js-hidden" >';

foreach ($outputArr as $value) 
{
	$currentID = $value["id"];
	$currentID  = "'$currentID '";
	$query = "SELECT DISTINCT a.uuid, a.year, a.day, a.hour, a.minute, a.second, a.month, a.title, a.source, a.doc_url, a.unix_timestamp, a.person, a.organization, a.topic, b.content, a.weekday FROM NewsMetaData a, NewsContent b WHERE a.uuid = ".$currentID  ;
	
	$result_db = $db->query($query);
	
	if(!$result_db) // Verify the tweet query did not fail.
	{
		printf("Query failed: " . $db->error);
		exit();
	}	
	
	if ($result_db->num_rows != 0)
	{
		$text_row = $result_db->fetch_assoc ();
		
		$text = $text_row ["content"];
		

		
			$title = $text_row ["title"];
			$title = preg_replace ( '/[^a-zA-Z0-9_ %\[\]\.\(\)%&-]/s', '', $title );
			
			$html = $html . "
				<li class=\"news-item\"> <a data-id=".$currentID." href='#'  onclick='getBreakingnewsID(this)'>  $title </a>  </li>";

	}

}



$html = $html."</ul>";


header("HTTP/1.0 200 OK");
//$html = formatUrlInString($html);
echo  $html ; // send back json object

//this->data is a 4 field data set

?>