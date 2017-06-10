<?php
session_start ();


require_once ('lib/db_config.php');
require_once ('lib/underscore.php');
require_once ('probabilisticEWMA.php');
require_once ('important_words.php');

date_default_timezone_set ( 'UTC' );



function addhttp($url)
{
	if (!preg_match("~^(?:f|ht)tps?://~i", $url))
	{
		$url = "http://" . $url;
	}
	return $url;
}

function formatUrlInString($text) 
{
	/**
	 * format the url in the string to html links
	 */
	//$reg_exUrl = "/((((http|https|ftp|ftps)\:\/\/)|www\.)[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,4}(\/\S*)?)/";
	$reg_exUrl = '/\b(http:\/\/(\S+(?<!\.)(?=(?:$|\s|\.(?:$|\s)))))(?<!(?:\.(?:png|gif|jpg)))/i';
	$text = str_replace(" www", " http://www", $text); //add http to url
	$text = preg_replace ( $reg_exUrl, "<a href=\"$1\"  target=\"_blank\"   >$1</a> ", $text );

	//$text = preg_replace('/\b(http:\/\/(\S+(?<!\.)(?=(?:$|\s|\.(?:$|\s)))))(?<!(?:\.(?:png|gif|jpg)))/i', '', $text);
	return $text;
}


function sliceMultiDimenArray($multid_array, $length)
{
	$sliced_array = array();  //setup the array you want with the sliced values.

	//loop though each sub array and slice off the first 5 to a new multidimensional array
	foreach ($multid_array as $sub_array) {
		$sliced_array[] = array_slice($sub_array, 0, $length);
	}
	return $sliced_array;

}


function cleanText($text)
{

	$text = preg_replace('/[\x00-\x1F\x80-\xFF]/', ' ', $text);//remove non-printable character
	//$text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x80-\x9F]/u', '', $text); //handle unicode characters
	//$text = preg_replace('!\s+!', ' ', $text);//remove double spaces with a single space
	$text = preg_replace(array('~([.,!?])(\\1+)~', '~[?!]{2,}~'), array('$1', '?'), $text); //repetive punctuation see http://stackoverflow.com/questions/10545303/php-removing-duplicate-punctuation
	$text = preg_replace('/([?!.:,;])[?!.:,;\s]+/', '$1 ', $text); //remove repeated punctuation
	//$text = preg_replace('/\s\s+/', ' ', $text); //remove double spaces
// 	$text = preg_replace("(<([a-z]+)>.*?</\\1>)is"," ",$text); //remove html tags
// 	$text =preg_replace("~<blockquote(.*?)>(.*)</blockquote>~si","",' '.$text.' ');
// 	$text =preg_replace("~<q(.*?)>(.*)</q>~si","",' '.$text.' ');
// 	$text =preg_replace("~<i(.*?)>(.*)</i>~si","",' '.$text.' ');
//	$text =preg_replace("~<b(.*?)>(.*)</b>~si","",' '.$text.' ');
	
	$text = strip_tags($text, '<a></a>');
	return $text;
}



function getNamedEntity($named_entity_arr)
{
	$output = array();
	foreach ($named_entity_arr as $curObj)
	{
		$entityArr = explode( ' ',$curObj );
		$innerArr = array();
		foreach ($entityArr as $word)
		{
			$word = preg_replace("/[^a-zA-Z 0-9]+/", "", $word);
			$innerArr[] = $word;
		}
			
		$str = implode("-", $innerArr); //named
		$output[] = $str;
	}
	return $output;
}


function cssStyleID($str)
{
	/**
	 * convert string to css ID
	 */
	$output = "" ;
	$str = preg_replace("/\s{2,}/i", " ", trim($str) );
	$arr =  explode(" ", $str);
	$output = implode("-", $arr);
	return $output;
}

function groupByMulti($obj, $values) 
{
	/**
	 * This allows the data structure to be grouped by selected fields
	 */
	if (count ( $values ) == 0) {
		return $obj;
	}
	$byFirst = __::groupBy ( $obj, $values [0] );
	$rest = $values [1];
	$first = array_shift ( $values );
	
	$key_col = __::keys ( $byFirst );
	
	foreach ( $key_col as $key => $value ) {
		$byFirst [$value] = groupByMulti ( $byFirst [$value], $values );
	}
	return $byFirst;
}


function getFieldDomain($dataset, $field_name) {
	/**
	 * get unique item in the field
	 */
	$unique_items_arr = __::pluck ( $dataset, $field_name );
	$unique_items_arr = __::uniq ( $unique_items_arr );
	return $unique_items_arr;
}


/**
function getAggregatedData($db, $start_timestamp, $end_timestamp, $arregationSec) {
	$query = "select concat('$arregationSec'*floor(a.unix_timestamp/'$arregationSec'),'-', '$arregationSec'*floor(a.unix_timestamp/'$arregationSec') + '$arregationSec') as range_t, count(*) as CountOfNews, a.year, a.month, a.day, a.hour from news.NewsMetaData a, NewsContent b WHERE b.content IS NOT NULL AND a.unix_timestamp>='$start_timestamp' AND a.unix_timestamp<='$end_timestamp' AND a.uuid = b.uuid group by range_t  order by range_t asc;";

	$result = $db->query ( $query );

	if (! $result) // Verify the tweet query did not fail.
	{
		printf ( "Query failed: " . $db->error );
		exit ();
	}

	$news_graph_data = array ();
	unset ( $prevRange );
	while ( $row = $result->fetch_assoc () ) {
		list ( $range_start, $range_end ) = explode ( "-", $row ['range_t'] );
		if (! array_key_exists ( $row ["range_t"], $news_graph_data )) {
				
			// / I am addin new intervals.. the previous one is
			if (isset ( $prevRange )) {

				$currentRange = $range_start;
				$time1 = new DateTime ( '@' . $prevRange ); // / end range....
				$time2 = new DateTime ( '@' . $currentRange ); // / start range...
				$interval = $time1->diff ( $time2 );

				$endran = intval ( $prevRange );
				$staran = intval ( $currentRange );
				$diff = $staran - $endran;
				if ($diff >= $arregationSec) {
					for($timeran = $endran; $timeran < $staran; $timeran += $arregationSec) {
						$startTimeStamp = $timeran;
						$endTimeStamp = $timeran + $arregationSec;

						$range_t = $startTimeStamp . '-' . $endTimeStamp;
						$startTimeStampStr = gmdate ( 'Y-m-d', $startTimeStamp );
						$endTimeStampStr = gmdate ( 'Y-m-d', $endTimeStamp );

						$averageTimeStamp = intval ( ($startTimeStamp + $endTimeStamp) / 2 );
						// $averageTimeStamp = intval($averageTimeStamp/$arregationSec) * $arregationSec;
						$year = gmdate ( 'Y', $averageTimeStamp ); // 2004
						$month = gmdate ( 'm', $averageTimeStamp ); // 1-12
						$day = gmdate ( 'd', $averageTimeStamp ); // 1-31
						$hour = gmdate ( 'H', $averageTimeStamp );

						$news_graph_data [$range_t] = array (
								"numofnews" => 0,
								"timerange" => $range_t,
								"year" => intval ( $year ),
								"month" => intval ( $month ),
								"day" => intval ( $day ),
								"hour" => intval ( $hour )
						);
					}
				}
			}
		}

		$startTimeStampStr = gmdate ( 'Y-m-d', $range_start );
		$endTimeStampStr = gmdate ( 'Y-m-d', $range_end );

		$numberofnews = $row ["CountOfNews"];
		$arr_news_actual = array (
				"numofnews" => intval ( $numberofnews ),
				"timerange" => $row ["range_t"],
				"year" => $row ["year"],
				"month" => $row ["month"],
				"day" => $row ["day"],
				"hour" => $row ["hour"]
		);

		// / already exist ..
		$news_graph_data [$row ["range_t"]] = $arr_news_actual;

		$prevRange = $range_end;
		$prevRangeStart = $range_start;
	}

	$news_output = array_values ( $news_graph_data );
	$groupedData = groupByMulti ( $news_output, [
			"year",
			"month",
			"day",
			"hour"
	] );

	$yearList = __::keys ( $groupedData );
	$yearList = __::sortBy ( $yearList, function ($n) {
		return $n;
	} );

		$outputData = array ();
		$yearCount = 0;
		
		
		

		foreach ( $yearList as $cyear ) 
		{
			$yearCount = $yearCount + 1;//increment year counter
			$currentData = $groupedData [$cyear]; // month as key, and (day, hour) as value
			$monthList = __::keys ( $currentData );
			$monthList = __::sortBy ( $monthList, function ($n) {
				return $n;
			} );
			
			$monthCount = 0;
			foreach ( $monthList as $month ) 
			{
				$monthCount = $monthCount + 1; //increment month counter within the year
				$totalDayData = $currentData [$month]; // month as key, and (day, hour) as value
				$dayList = __::keys ( $totalDayData );
				$dayList = __::sortBy ( $dayList, function ($n) {
					return $n;
				} );
					
				$dayCount = 0;
				foreach ( $dayList as $day ) {
					$dayCount = $dayCount  + 1; //increment day count
					$hourArr = $totalDayData [$day];
					$hourlist = __::keys ( $hourArr );
					$hourlist = __::sortBy ( $hourlist, function ($n) {
						return $n;
					} );

					$hourCount = 0;
					foreach ( $hourlist as $hour ) 
					{
						$hourCount = $hourCount + 1;
						$currentHourObject = $hourArr [$hour] [0];
						$num_of_news = $currentHourObject ["numofnews"];
						$time_range = $currentHourObject ["timerange"];
						list ( $start, $end ) = explode ( "-", $time_range );
						$avgStamp = ( $start + $end )/2;
						
						$dayInSecs = 86400;
						$avgStamp = intval ($avgStamp/$dayInSecs) * $dayInSecs;
						
						
						$arr_news = array (
								//"day" => 4 * ($day + $avgStamp)/100000, //make correction to fix all issues at once
								"day" =>  $avgStamp,
								"hour" => $hour,
								"numofnews" => $num_of_news,
								"timerange" => $time_range
						);

						$outputData [] = $arr_news;
						
					}

					

				}
			}
		}

		return $outputData;
}
*/


function getData($db, $start_timestamp, $end_timestamp, $arregationSec) 
{
	/**
	 * Primary source of data for the heatmap
	 */
	$query = "select concat('$arregationSec'*floor(a.unix_timestamp/'$arregationSec'),'-', '$arregationSec'*floor(a.unix_timestamp/'$arregationSec') + '$arregationSec') as range_t, count(*) as CountOfNews, a.year, a.month, a.day, a.hour, GROUP_CONCAT(a.topic) as topiclist, GROUP_CONCAT(a.person) as personlist, GROUP_CONCAT(a.organization) as organizationlist  from news.NewsMetaData a, NewsContent b WHERE b.content IS NOT NULL  AND a.unix_timestamp>='$start_timestamp' AND a.unix_timestamp<='$end_timestamp' AND a.uuid = b.uuid group by range_t  order by range_t asc;";
	$result = $db->query ( $query );
	
	if (! $result) // Verify the tweet query did not fail.
	{
		printf ( "Query failed: " . $db->error );
		exit ();
	}
	
	$total_news_graph_data = array ();
	$news_graph_data = array ();
	$dummy_news_graph_data = array ();
	
	$extra_news_graph_data = array ();	
	
	$aggregType = $_SESSION["aggregation_type"];
	//$dayInSecs = $_SESSION[$aggregType]["aggregSecX"];
	
	unset ( $prevRange );
	while ( $row = $result->fetch_assoc () ) {
		list ( $range_start, $range_end ) = explode ( "-", $row ['range_t'] );
		if (! array_key_exists ( $row ["range_t"], $news_graph_data )) {
			
			// / I am addin new intervals.. the previous one is
			if (isset ( $prevRange )) {
				
				$currentRange = $range_start;
				$time1 = new DateTime ( '@' . $prevRange ); // / end range....
				$time2 = new DateTime ( '@' . $currentRange ); // / start range...
				$interval = $time1->diff ( $time2 );
				
				$endran = intval ( $prevRange );
				$staran = intval ( $currentRange );
				$diff = $staran - $endran;
				if ($diff >= $arregationSec) {
					for($timeran = $endran; $timeran < $staran; $timeran += $arregationSec) {
						$startTimeStamp = $timeran;
						$endTimeStamp = $timeran + $arregationSec;
						
						$range_t = $startTimeStamp . '-' . $endTimeStamp;
						$vstart = intval ( $startTimeStamp );
						$vend = intval ( $endTimeStamp );
						
						$avgTimestamp = ($vstart + $vend) / 2;
						$news_graph_data [$range_t] = array (
								"y" => 0,
								"x" => $avgTimestamp,
								"topic" => "",
								"person" => "",
								"organization" => "",
								"timerange" => $range_t
						);

						$dummy_news_graph_data [$range_t] = array (
								"y" => 0,
								"x" => $avgTimestamp 
						);
						
						$unix_timestamp = $avgTimestamp;
							
							
						$weekday = gmdate('N', $unix_timestamp); // 1-7
						$month = gmdate('m', $unix_timestamp); // 1-12
						$day = gmdate('d', $unix_timestamp); // 1-31
						$hour = gmdate('H', $unix_timestamp);
						$year = gmdate('Y', $unix_timestamp); // 2004
						$minute = gmdate('i', $unix_timestamp);
						
						
						//add session variable for the different kind of data that will be included here in if statements
						$dayInSecs = 86400;
						//if ( $aggregType == "Days_vs_Hours")
						//{
							//$dayInSecs = $_SESSION[$aggregType]["aggregSecX"];
							$avgStamp = intval ($avgTimestamp/$dayInSecs) * $dayInSecs; //normalize to beginning of the day
							
							$extra_news_graph_data [$range_t] = array (
									"numofnews" => 0,
									"x" => $avgTimestamp,
// 									"weekday" => intval ( $weekday ),
// 									"year" => intval ( $year ),
// 									"month" => intval ( $month ),
									"day" => intval ( $avgStamp ),
									"hour"=> intval ( $hour ),
									"minute" => intval ( $minute ),
									"timerange" => $range_t
							);
						//}
					}
				}
			}
		}
		$vstart = intval ( $range_start );
		$vend = intval ( $range_end );
		
		$avgTimestamp = ($vstart + $vend) / 2;

		
		$numberofnews = $row ["CountOfNews"];
		$arr_news_actual = array (
				"y" => intval ( $numberofnews ),
				"x" => $avgTimestamp,
				"topic" => $row ["topiclist"],
				"person" => $row ["personlist"],
				"organization" => $row ["organizationlist"] ,
				"timerange" => $row ["range_t"]
		);
		
		// / already exist ..
		$news_graph_data [$row ["range_t"]] = $arr_news_actual;
		
		$dummy_news_graph_data [$row ["range_t"]] = array (
				"y" => 0,
				"x" => $avgTimestamp 
		);

		$unix_timestamp = $avgTimestamp;
			
			
		$weekday = gmdate('N', $unix_timestamp); // 1-7
		$month = gmdate('m', $unix_timestamp); // 1-12
		$day = gmdate('d', $unix_timestamp); // 1-31	
		$hour = gmdate('H', $unix_timestamp);
		$year = gmdate('Y', $unix_timestamp); // 2004
		$minute = gmdate('i', $unix_timestamp);
		

		
		$dayInSecs = 86400;
		//if ( $aggregType == "Days_vs_Hours")
		//{
			//$dayInSecs = $_SESSION[$aggregType]["aggregSecX"];
			$avgStamp = intval ($avgTimestamp/$dayInSecs) * $dayInSecs; //normalize to beginning of the day
			
			//add session variable for the different kind of data that will be included here in if statements
			$extra_news_graph_data[$row ["range_t"]] = array (
					"numofnews" => 0,
					"x" => $avgTimestamp,
// 					"weekday" => intval ( $weekday ),	
// 					"year" => intval ( $year ),
// 					"month" => intval ( $month ),
					"day" => intval ( $avgStamp ),
					"hour"=> intval ( $hour ),
					"minute" => intval ( $minute ),
					"timerange" => $row ["range_t"]
			);
		//}
		
		
		$prevRange = $range_end;
		$prevRangeStart = $range_start;
	}
	
	$total_news_graph_data ["large"] [] = array_values ( $news_graph_data );
	$total_news_graph_data ["empty"] [] = array_values ( $dummy_news_graph_data );
	$total_news_graph_data ["extra"] [] = array_values ( $extra_news_graph_data );
	
	return $total_news_graph_data;
}


function getListByParameter($nresult_array, $param) 
{
	/*
	 * $param can be 'topic', 'person', 'organization' ;
	 * because there are database field used to filter the data
	 */
	$totalTopicsArray = array ();
	$result_array = $nresult_array ["large"] [0];

	$topic_list = getFieldDomain ( $result_array, $param ); // get the list of topics
	$topic_list = join ( ",", $topic_list );
	$topic_list = explode ( ",", $topic_list ); // split into array
	$topic_list = array_filter ( $topic_list ); // remove nulls

	$topic_list = __::uniq ( $topic_list ); // make unique
	return $topic_list;
}



function getDataByParameter($nresult_array, $param) {
	/*
	 * $param can be 'topic', 'person', 'organization' ;
	 * because there are database field used to filter the data
	 */
	$totalTopicsArray = array ();
	$result_array = $nresult_array ["large"] [0];
	
	$topic_list = getFieldDomain ( $result_array, $param ); // get the list of topics
	$topic_list = join ( ",", $topic_list );
	$topic_list = explode ( ",", $topic_list ); // split into array
	$topic_list = array_filter ( $topic_list ); // remove nulls
	
	$topic_list = __::uniq ( $topic_list ); // make unique
	
	$grouped_by_topic = __::groupBy ( $result_array, $param );
	$grouped_by_topic = array_filter ( $grouped_by_topic ); // make unique
	$grouped_by_topic = removeNullKeys ( $grouped_by_topic ); // remove nulls
	
	for($ind = 0; $ind < count ( $topic_list ); $ind ++) {
		$current_topic = $topic_list [$ind];
		$totalTopicsArray [$current_topic] = array ();
		foreach ( $grouped_by_topic as $subKey => $subArray ) {
			$needle_arr = array (
					$current_topic 
			);
			$haystack_arr = explode ( ",", $subKey ); // split into array
			$haystack_arr = array_filter ( $haystack_arr ); // remove nulls
			$common = __::intersection ( $haystack_arr, $needle_arr );
			$common = __::uniq ( $common );
			if (count ( $common )) // value exist
			{
				array_push ( $totalTopicsArray [$current_topic], $grouped_by_topic [$subKey] );
			}
		}
	}
	return $totalTopicsArray;
}


function getDataByEntity($nresult_array, $param) {
	/**
	 * group the data by entities
	 */
	$result_array = $nresult_array ["large"] [0];
	$groupedData = getDataByParameter ( $nresult_array, $param );
	$topic_list = __::keys ( $groupedData );
	$totalDataArray = array ();
	
	for($ind = 0; $ind < count ( $topic_list ); $ind ++) {
		$current_topic = $topic_list [$ind];
		$dataArr = $groupedData [$current_topic];
		$totalDataArray [$current_topic] = array ();
		$sumArr [$current_topic] = array ();
		for($count = 0; $count < count ( $dataArr ); $count ++) {
			$currentObj = $dataArr [$count];
			$sumArr [$current_topic] = array_merge_recursive ( $sumArr [$current_topic], $currentObj );
		}
		$totalDataArray [$current_topic] = $sumArr [$current_topic];
	}
	return $totalDataArray;
}


function arrayRecursiveDiff($aArray1, $aArray2) {
	$aReturn = array ();
	
	foreach ( $aArray1 as $mKey => $mValue ) {
		if (array_key_exists ( $mKey, $aArray2 )) {
			if (is_array ( $mValue )) {
				$aRecursiveDiff = arrayRecursiveDiff ( $mValue, $aArray2 [$mKey] );
				if (count ( $aRecursiveDiff )) {
					$aReturn [$mKey] = $aRecursiveDiff;
				}
			} else {
				if ($mValue != $aArray2 [$mKey]) {
					$aReturn [$mKey] = $mValue;
				}
			}
		} else {
			$aReturn [$mKey] = $mValue;
		}
	}
	return $aReturn;
}


function completeDataForEntity($result_array, $param) {
	/**
	 * format the data in the right order
	 */
	$data = getDataByEntity ( $result_array, $param );
	$reducedDimData = array ();
	$result = array ();
	
	$total_padded_data = $result_array ["empty"] [0];
	
	$topic_list = __::keys ( $data );
	for($ind = 0; $ind < count ( $topic_list ); $ind ++) {
		$currentTopic = $topic_list [$ind];
		$currentData = $data [$currentTopic];
		$reducedDimData [$currentTopic] = array ();
		$result [$currentTopic] = array ();
		
		foreach ( $currentData as $obj ) {
			$temp = array ();
			$temp ["x"] = $obj ["x"];
			$temp ["y"] = $obj ["y"]; //number of news at the time span
			
	
			array_push ( $reducedDimData [$currentTopic], $temp );
		}
		$result [$currentTopic] = array_diff_assoc ( $total_padded_data, $reducedDimData [$currentTopic] );
		$result [$currentTopic] = $reducedDimData [$currentTopic] + $result [$currentTopic]; // union of array
		
		$result [$currentTopic] = __::sortBy ( $result [$currentTopic], function ($obj) {
			return $obj ["x"];
		} ); // sort by timestamp
	}
	
	return $result;
}


function removeNullKeys($array) {
	/**
	 * remove null key from multidimensional array
	 */
	foreach ( $array as $subKey => $subArray ) {
		if ($subKey == "") {
			unset ( $array [$subKey] );
		}
	}
	return $array;
}





function getTimeSeries($result_array, $param) {
	/**
	 * *put data in a format for easy mathematical computation
	 */
	$result = getDataByParameter ( $result_array, $param );
	$result = getDataByEntity ( $result_array, $param );
	$timeSeries = completeDataForEntity ( $result_array, $param );
	$topic_list = __::keys ( $timeSeries );
	
	$output = array ();
	
	for($ind = 0; $ind < count ( $topic_list ); $ind ++) {
		$currentTopic = $topic_list [$ind];
		$currentDataList = $timeSeries [$currentTopic];
		$frequency_list = __::pluck ( $currentDataList, 'y' );
		$output [$currentTopic] = array ();
		
		//if (array_sum($frequency_list) > 10) // avoid empty list
		//{
			array_push ( $output [$currentTopic], $frequency_list );
		//}
	}
	return $output;
}


////////////////////////////////////////////////

function getHeatMapDataByParameter($nresult_array, $param) {
	/*
	 * $param can be 'topic', 'person', 'organization' ;
	 * because there are database field used to filter the data for the heatmap
	 */
	$totalTopicsArray = array ();
	$result_array = $nresult_array ["large"] [0];

	$topic_list = getFieldDomain ( $result_array, $param ); // get the list of topics
	$topic_list = join ( ",", $topic_list );
	$topic_list = explode ( ",", $topic_list ); // split into array
	$topic_list = array_filter ( $topic_list ); // remove nulls

	$topic_list = __::uniq ( $topic_list ); // make unique

	$grouped_by_topic = __::groupBy ( $result_array, $param );
	$grouped_by_topic = array_filter ( $grouped_by_topic ); // make unique
	$grouped_by_topic = removeNullKeys ( $grouped_by_topic ); // remove nulls

	for($ind = 0; $ind < count ( $topic_list ); $ind ++) {
		$current_topic = $topic_list [$ind];
		$totalTopicsArray [$current_topic] = array ();
		foreach ( $grouped_by_topic as $subKey => $subArray ) {
			$needle_arr = array (
					$current_topic
			);
			$haystack_arr = explode ( ",", $subKey ); // split into array
			$haystack_arr = array_filter ( $haystack_arr ); // remove nulls
			$common = __::intersection ( $haystack_arr, $needle_arr );
			$common = __::uniq ( $common );
			if (count ( $common )) // value exist
			{
				array_push ( $totalTopicsArray [$current_topic], $grouped_by_topic [$subKey] );
			}
		}
	}
	return $totalTopicsArray;
}


function getHeatMapDataByEntity($nresult_array, $param) {
	/**
	 * this is similar to the getDataByEntity function but has been customized for heatmap
	 */
	$result_array = $nresult_array ["large"] [0];
	$groupedData = getHeatMapDataByParameter ( $nresult_array, $param );
	$topic_list = __::keys ( $groupedData );
	$totalDataArray = array ();

	for($ind = 0; $ind < count ( $topic_list ); $ind ++) {
		$current_topic = $topic_list [$ind];
		$dataArr = $groupedData [$current_topic];
		$totalDataArray [$current_topic] = array ();
		$sumArr [$current_topic] = array ();
		for($count = 0; $count < count ( $dataArr ); $count ++) {
			$currentObj = $dataArr [$count];
			$sumArr [$current_topic] = array_merge_recursive ( $sumArr [$current_topic], $currentObj );
		}
		$totalDataArray [$current_topic] = $sumArr [$current_topic];
	}
	return $totalDataArray;
}


function completeHeatMapDataForEntity($result_array, $param) 
{
	/**
	 * organize the data in the right structure
	 */
	$data = getHeatMapDataByEntity ( $result_array, $param );
	$reducedDimData = array ();
	$result = array ();

	$total_padded_data = $result_array ["extra"] [0];

	$topic_list = __::keys ( $data );
	for($ind = 0; $ind < count ( $topic_list ); $ind ++) {
		$currentTopic = $topic_list [$ind];
		$currentData = $data [$currentTopic];
		$reducedDimData [$currentTopic] = array ();
		$result [$currentTopic] = array ();

		foreach ( $currentData as $obj ) {
			$temp = array ();
			$temp ["x"] = $obj ["x"];
			$temp ["numofnews"] = $obj ["y"];	
			$temp ["y"] = $obj ["y"];
			$unix_timestamp = $obj ["x"];
		
			$temp ["timerange"] = $obj ["timerange"];
			
			
			$weekday = gmdate('N', $unix_timestamp); // 1-7
			$month = gmdate('m', $unix_timestamp); // 1-12
			//$day = gmdate('d', $unix_timestamp); // 1-31
			
			
			$hour = gmdate('H', $unix_timestamp);
			$minute = gmdate('i', $unix_timestamp);
			$second = gmdate('s', $unix_timestamp);
			$weekNumberInYear = gmdate('W', $unix_timestamp); //convert to week number
			
			
			$year = gmdate('Y', $unix_timestamp); // 2004
			$temp ["weekday"] = intval ( $weekday ); // 1-7			
			
			$temp ["year"] = intval ( $year );
			$temp ["month"] = intval ( $month );
			
			$weekVal = (intval ( $unix_timestamp/ (7*24*3600) ) ) * (7*24*3600);
			
			$temp ["week"] = intval ( $weekVal);
			
			$dayVal = (intval ( $unix_timestamp/ 86400 ) ) * 86400;
			
			$temp ["day"] = intval ( $dayVal );
			$temp ["hour"] = intval ( $hour );
			
			$temp ["minute"] = intval ( $minute );
// 			$temp ["second"] = intval ( $second );
// 			$temp ["weekNumberInYear"] = intval ( $weekNumberInYear );

			array_push ( $reducedDimData [$currentTopic], $temp );
		}
		$result [$currentTopic] = array_diff_assoc ( $total_padded_data, $reducedDimData [$currentTopic] );
		$result [$currentTopic] = $reducedDimData [$currentTopic] + $result [$currentTopic]; // union of array

		$result [$currentTopic] = __::sortBy ( $result [$currentTopic], function ($obj) {
			return $obj ["x"];
		} ); // sort by timestamp
	}

	return $result;
}

////////////////////////////////////////////////


if ( !(class_exists('determineHotnessOfEntity')) )
{
	class determineHotnessOfEntity
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
		private $result_array;
		private $minimumSize; //threshold to ensure it is not empty
		
		public function __construct(  ) // seprate the data by subjects
		{
			/**
			 * $flag set to true means we are in training mode
			 */
			$this->counter = 0;
			$this->ewmaObj = array ();
			$this->minimumSize = 5;
		}
	
	
		public function setData( $result_array ) // seprate the data by subjects
		{
			/**
			 * $flag set to true means we are in training mode
			 */
			$this->result_array = $result_array;
			$this->counter = $this->counter + 1;
			if ($this->counter > 1)
			{
				/**
				 * training is over
				 */
				$this->trainingFlag = false;
			}
			else
			{
				/**
				 * training is going on
				 */	
				$this->trainingFlag = true;
			}
		} 
		
		
		public function getAnomalyScoreByEntity( $param ) 
		{
			/**
			 * *put data in a format for easy mathematical computation and calculate anomaly score for each entity
			 */
		
			$output = array ();
			$result = getTimeSeries($this->result_array, $param);
			$topic_list = __::keys ( $result );
		
			$output = array ();
		
			for($ind = 0; $ind < count ( $topic_list ); $ind ++) 
			{
				$currentTopic = $topic_list [$ind];
				$currentDataList = $result [$currentTopic][0];
				/**
				 * training mode as a seed for the operation as default
				 */
				$this->ewmaObj[$currentTopic] = new probabilisticEWMA ( $currentDataList, $this->trainingFlag );
				if (!($this->trainingFlag)) 
				{
					/**
					 * after training the model
					 */

					$this->ewmaObj[$currentTopic]->setStatus ( $this->trainingFlag );
					$this->ewmaObj[$currentTopic]->setData ( $currentDataList );
				}	
							
				$anomalyScoreList = $this->ewmaObj[$currentTopic]->calcAnomalyScore ();
				$sum_of_array_elements = array_sum($currentDataList);
				if ($sum_of_array_elements > $this->minimumSize )
				{
					$arr = array(
							"term" 		=> $currentTopic,
							"score" 	=> end($anomalyScoreList)
							//"size" =>	array_sum($currentDataList)
					);
					$output[] = $arr;
				}
			}
			//$output = __::filter ( $output, function ($obj) { return $obj ["size"] > 0 ;} );//accept values greater than 10
			
			$output = __::sortBy ( $output, function ($obj) { return $obj ["score"];} );//ascending order
			return $output;
		}
	}

}

function getMissingNewsData($result_array, $param)
{
	
	$objEntity = completeDataForEntity($result_array, $param);
	$topic_list = __::keys ( $objEntity );
	$output = array();
	
	for($ind = 0; $ind < count ( $topic_list ); $ind ++) 
	{
		$currentTopic = $topic_list [$ind];
		$currentObjEntity = $objEntity[$currentTopic];
		$output[$currentTopic] = array();
		for($indx = 0; $indx < count ( $currentObjEntity ); $indx ++)
		{
			$currentObj = $currentObjEntity[$indx];
			$xVal = $currentObj["x"];
			$yVal = $currentObj["y"];

			$dayInSecs = 86400;
			$xValue = intval ($xVal/$dayInSecs) * $dayInSecs; //normalize to beginning of the day
			
			$remainingSecs = $xVal - $xValue;
			$formattedOutput = $yVal."-".$remainingSecs;
			$output[$currentTopic][$xValue] = $formattedOutput;	
		}
	}
	
	return $output;
}



function getHeatMapAggregatedDataHourvsMinute( $result_array,  $param)
{
	/**
	 * hours vs minutes
	 */
	global $hotnessObj;
	$NUM_OF_TERMS = 15;
	/**
	 * generate data for the heatmap by considering the
	 */
	$aggregType = $_SESSION["aggregation_type"];
	$totalDataArray = array ();
	$heatMapEntity = completeHeatMapDataForEntity ( $result_array, $param ); // data set for creating heatmap
	$hotnessObj->setData ( $result_array );
	$entity_score = $hotnessObj->getAnomalyScoreByEntity ( $param );
	
	// $numOfMissingNewsObject = getMissingNewsData($result_array, $param);
	
	$topic_list = __::pluck ( $entity_score, "term" );
	$topic_list = array_slice($topic_list,0, $NUM_OF_TERMS);
	$topic_count_array = array ();
	
	for($ind = 0; $ind < count ( $topic_list ); $ind ++) {
		$current_topic = $topic_list [$ind];
		$currentData = $heatMapEntity [$current_topic];
		
		$seriesObject = getTimeSeries ( $result_array, $param ); // topic by time series
		
		$topic_count_array [$current_topic] = array_sum ( $seriesObject [$current_topic] [0] ); // topic count
		
		$totalDataArray [$current_topic] = array ();
		
		$groupedData = groupByMulti ( $currentData, [ 
				"day",
				"hour",
				"minute"
		] );
		/**
		 * move lower into the depth of the array to obtain day as key, and hour as value
		 */
		$dayList = __::keys ( $groupedData );
		$dayList = array_filter ( $dayList ); // remove nulls
		$dayList = __::sortBy ( $dayList, function ($n) {
			return $n;
		} );
		foreach ( $dayList as $cday ) {
			$currentData = $groupedData [$cday]; // month as key, and (day, hour) as value
			$hourList = __::keys ( $currentData );
			$hourList = array_filter ( $hourList ); // remove nulls
			$hourList = __::sortBy ( $hourList, function ($n) {
				return $n;
			} );
			foreach ( $hourList as $hour ) {
				$totalHourData = $currentData [$hour]; // month as key, and (day, hour) as value
				$minuteList = __::keys ( $totalHourData );
				$minuteList = array_filter ( $minuteList ); // remove nulls
				
				foreach ( $minuteList as $minute ) 
				{
					$minuteArr = $totalHourData [$minute];

					$currentHourObject = $minuteArr [0];
					$num_of_news = $currentHourObject ["numofnews"];
					$time_range = $currentHourObject ["timerange"];
					$hour = $currentHourObject ["hour"];
					$minute = $currentHourObject ["minute"];
						
					
					list ( $start, $end ) = explode ( "-", $time_range );
					$avgStamp = ($start + $end) / 2;
					

					$aggregType = $_SESSION["aggregation_type"];
					$hoursInSecs = $_SESSION[$aggregType]["aggregSecX"];
					$avgStamp = intval ($avgStamp/$hoursInSecs) * $hoursInSecs;

					
					//if (isset ( $avgStamp ) && isset ( $time_range ) && isset ( $minute ) && isset ( $num_of_news ) && ( $avgStamp != "" ) &&  ( $time_range != "" ) && ( $minute != "" ) &&  ( $num_of_news != "" ) ) 
					if ( isset ( $time_range ) && isset ( $minute ) && isset ( $num_of_news )  &&  ( $time_range != "" ) && ( $minute != "" ) &&  ( $num_of_news != "" ) )					
					{
						$arr_news = array (
							"hour" => $avgStamp, 
							"minute" => $minute,
							"numofnews" => $num_of_news,
							"timerange" => $time_range
						);

// 						$arr_news = array (
// 								"hour" => $hour,
// 								"minute" => $minute,
// 								"numofnews" => $num_of_news,
// 								"timerange" => $time_range
// 						);
						$totalDataArray [$current_topic] [] = $arr_news;
					}					
				}
			}
		}
	}
	$output = array ();
	$output ["heat_map"] = $totalDataArray;
	$output ["topic_count"] = $topic_count_array;
	$output ["aggregation_type"] =$aggregType;
	
	return $output;
}




function getHeatMapAggregatedDataDayvsHour( $result_array,  $param) 
{  
	/**
	 *  Days vs hours
	 */
	
  	global $hotnessObj; 
  	$NUM_OF_TERMS = 15;
	/**
	 * generate data for the heatmap by considering the 
	 */
  	$aggregType = $_SESSION["aggregation_type"];
	$totalDataArray = array ();
	$heatMapEntity = completeHeatMapDataForEntity($result_array,  $param); //data set for creating heatmap
	$hotnessObj->setData( $result_array );
	$entity_score = $hotnessObj->getAnomalyScoreByEntity(  $param );
	

	//$numOfMissingNewsObject = getMissingNewsData($result_array, $param);
	
	
	$topic_list = __::pluck($entity_score, "term");
	$topic_list = array_slice($topic_list,0, $NUM_OF_TERMS);
	$topic_count_array = array ();

	for($ind = 0; $ind < count ( $topic_list ); $ind ++) 
	{
		$current_topic = $topic_list [$ind];
		$currentData = $heatMapEntity[$current_topic];
		
		$seriesObject = getTimeSeries($result_array, $param); //topic by time series
		
		$topic_count_array[$current_topic] = array_sum($seriesObject[$current_topic][0]);//topic count
		
		
		$totalDataArray [$current_topic]  = array ();
		
		$groupedData = groupByMulti ( $currentData, ["year", "month", "day", "hour"] );
		/**
		 * move lower into the depth of the array to obtain day as key, and hour as value
		 */
		$yearList = __::keys ( $groupedData );
		$yearList = array_filter ( $yearList ); // remove nulls
		$yearList = __::sortBy ( $yearList, function ($n) {
			return $n;
		} );
		foreach ( $yearList as $cyear ) 
		{
			$currentData = $groupedData [$cyear]; // month as key, and (day, hour) as value
			$monthList = __::keys ( $currentData );
			$monthList = array_filter ( $monthList ); // remove nulls
			$monthList = __::sortBy ( $monthList, function ($n) {
				return $n;
			} );
			foreach ( $monthList as $month ) 
			{
				$totalDayData = $currentData [$month]; // month as key, and (day, hour) as value
				$dayList = __::keys ( $totalDayData );
				$dayList = array_filter ( $dayList ); // remove nulls
				$tempData = array ();
				
				foreach ( $dayList as $day ) 
				{
					$hourArr = $totalDayData [$day];
					$hourlist = __::keys ( $hourArr );
					$hourlist = array_filter ( $hourlist ); // remove nulls
					
					foreach ( $hourlist as $hour ) 
					{
						$currentHourObject = $hourArr [$hour] [0];
						$num_of_news = $currentHourObject ["numofnews"];
						$time_range = $currentHourObject ["timerange"];
						
						list ( $start, $end ) = explode ( "-", $time_range );
						$avgStamp = ( $start + $end )/2;
						
						//$dayInSecs = 86400;
						
						$dayInSecs = $_SESSION[$aggregType]["aggregSecX"];
						$avgStamp = intval ($avgStamp/$dayInSecs) * $dayInSecs; //normalize to beginning of the day

						
						if ( isset($avgStamp) && isset($time_range ) && isset($hour ) && isset($num_of_news) &&  ( $avgStamp != "" ) &&  ( $time_range != "" ) && ( $hour != "" ) &&  ( $num_of_news != "" ) )
						{
							$arr_news = array (
									"day" => $avgStamp, // fix issue with cyclic time at once
									"hour" => $hour,
									"numofnews" => $num_of_news,
									"timerange" => $time_range 
							);
							$totalDataArray [$current_topic] [] = $arr_news;
						}
					}
				}
			}
		}
	}
	$output = array ();
	$output["heat_map"] = $totalDataArray;
	$output["topic_count"] = $topic_count_array;
	$output ["aggregation_type"] =$aggregType;
	return $output;
}



function getHeatMapAggregatedDataWeekvsDay( $result_array,  $param)
{
	/**
	 * Weeks vs Days
	 */
	global $hotnessObj;
	$NUM_OF_TERMS = 15;
	/**
	 * generate data for the heatmap by considering the
	 */
	$aggregType = $_SESSION["aggregation_type"];
	$totalDataArray = array ();
	$heatMapEntity = completeHeatMapDataForEntity ( $result_array, $param ); // data set for creating heatmap
	$hotnessObj->setData ( $result_array );
	$entity_score = $hotnessObj->getAnomalyScoreByEntity ( $param );

	// $numOfMissingNewsObject = getMissingNewsData($result_array, $param);

	$topic_list = __::pluck ( $entity_score, "term" );
	$topic_list = array_slice($topic_list,0, $NUM_OF_TERMS);
	$topic_count_array = array ();

	for($ind = 0; $ind < count ( $topic_list ); $ind ++) {
		$current_topic = $topic_list [$ind];
		$currentData = $heatMapEntity [$current_topic];

		$seriesObject = getTimeSeries ( $result_array, $param ); // topic by time series

		$topic_count_array [$current_topic] = array_sum ( $seriesObject [$current_topic] [0] ); // topic count

		$totalDataArray [$current_topic] = array ();

		$groupedData = groupByMulti ( $currentData, [
				"week",
				"day"
		] );
		/**
		 * move lower into the depth of the array to obtain day as key, and hour as value
		*/
		$weekList = __::keys ( $groupedData );
		$weekList = array_filter ( $weekList ); // remove nulls
		$weekList = __::sortBy ( $weekList, function ($n) {
			return $n;
		} );
		foreach ( $weekList as $cweek ) {
			$currentData = $groupedData [$cweek]; // month as key, and (day, hour) as value
			$dayList = __::keys ( $currentData );
			$dayList = array_filter ( $dayList ); // remove nulls
			$dayList = __::sortBy ( $dayList, function ($n) {
				return $n;
			} );
			foreach ( $dayList as $cday ) 
			{
				$currentHourObject = $currentData [$cday][0]; // month as key, and (day, hour) as value
				$num_of_news = $currentHourObject ["numofnews"];
				$time_range = $currentHourObject ["timerange"];
						
				list ( $start, $end ) = explode ( "-", $time_range );
				$avgStamp = ($start + $end) / 2;
				$day = gmdate('N', $avgStamp); // 1-7
				

						
				if ( isset ( $cweek ) && isset ( $time_range ) && isset ( $day ) && isset ( $num_of_news ) && ( $day != "" ) &&  ( $time_range != "" ) && ( $cweek != "" ) &&  ( $num_of_news != "" ) )
				{
					$arr_news = array (
						"week" => $cweek,
						"day" => $day,
						"numofnews" => $num_of_news,
						"timerange" => $time_range
					);
					$totalDataArray [$current_topic] [] = $arr_news;
				}
			}
			
		}
	}
	$output = array ();
	$output ["heat_map"] = $totalDataArray;
	$output ["topic_count"] = $topic_count_array;
	$output ["aggregation_type"] =$aggregType;

	return $output;
}


function getHeatMapAggregatedDataMonthvsWeek( $result_array,  $param)
{
	/**
	 * Month vs Week
	 */
	global $hotnessObj;
	$NUM_OF_TERMS = 15;
	/**
	 * generate data for the heatmap by considering the
	 */
	$aggregType = $_SESSION["aggregation_type"];
	$totalDataArray = array ();
	$heatMapEntity = completeHeatMapDataForEntity ( $result_array, $param ); // data set for creating heatmap
	$hotnessObj->setData ( $result_array );
	$entity_score = $hotnessObj->getAnomalyScoreByEntity ( $param );

	// $numOfMissingNewsObject = getMissingNewsData($result_array, $param);

	$topic_list = __::pluck ( $entity_score, "term" );
	$topic_list = array_slice($topic_list,0, $NUM_OF_TERMS);
	$topic_count_array = array ();

	for($ind = 0; $ind < count ( $topic_list ); $ind ++) {
		$current_topic = $topic_list [$ind];
		$currentData = $heatMapEntity [$current_topic];

		$seriesObject = getTimeSeries ( $result_array, $param ); // topic by time series

		$topic_count_array [$current_topic] = array_sum ( $seriesObject [$current_topic] [0] ); // topic count

		$totalDataArray [$current_topic] = array ();

		$groupedData = groupByMulti ( $currentData, [
				"year",
				"month",
				"week"
		] );
		/**
		 * move lower into the depth of the array to obtain day as key, and hour as value
		*/
		$yearList = __::keys ( $groupedData );
		$yearList = array_filter ( $yearList ); // remove nulls
		$yearList = __::sortBy ( $yearList, function ($n) {
			return $n;
		} );
		
		foreach ( $yearList as $cyear )
		{
			$currentData = $groupedData [$cyear]; // month as key, and (day, hour) as value
			$monthList = __::keys ( $currentData );
			$monthList = array_filter ( $monthList ); // remove nulls
			$monthList = __::sortBy ( $monthList, function ($n) {
				return $n;
			} );

			foreach ( $monthList as $cmonth ) 
			{
				$currentMData = $currentData [$cmonth]; // month as key, and (day, hour) as value
				$weekList = __::keys ( $currentMData );
				$weekList = array_filter ( $weekList ); // remove nulls
				$weekList = __::sortBy ( $weekList, function ($n) {
					return $n;
				} );
				foreach ( $weekList as $cweek )
				{
					$currentWeekObject = $currentMData [$cweek][0]; // month as key, and (day, hour) as value
					$num_of_news = $currentWeekObject ["numofnews"];
					$time_range = $currentWeekObject ["timerange"];	
	
					if ( isset ( $cweek ) && isset ( $time_range ) && isset ( $cmonth ) && isset ( $num_of_news ) && ( $cmonth != "" ) &&  ( $time_range != "" ) && ( $cweek != "" ) &&  ( $num_of_news != "" ) )
					{
						$arr_news = array (
								"month" => $cmonth * $cyear, //use the year as a scalar value
								"week" => $cweek,
								"numofnews" => $num_of_news,
								"timerange" => $time_range
						);
						$totalDataArray [$current_topic] [] = $arr_news;
					}
				}
					
			}
		}
	}
	$output = array ();
	$output ["heat_map"] = $totalDataArray;
	$output ["topic_count"] = $topic_count_array;
	$output ["aggregation_type"] =$aggregType;

	return $output;
}



function getRequiredExtent ($db, $window_size_in_days )
{
	if($db->connect_errno)
	{
		printf ("Connection failed:" . $db->connect_error);
		exit();
	}

	$query = "SELECT MAX(a.unix_timestamp) AS oldtime FROM NewsMetaData a, NewsContent b WHERE b.content IS NOT NULL AND a.uuid = b.uuid ";
	$result = $db->query($query);


	if(!$result)	// Verify the tweet query did not fail.
	{
		printf("Query failed: " . $db->error);
		exit();
	}

	$extent = array(); //get extent of the data


	if($result->num_rows != 0)
	{
		$most_recent_date = $result->fetch_assoc();	// Get the most recent tweet.
		$newest_timestamp = $most_recent_date[oldtime];
		$extent["new"] = $newest_timestamp;

		$dt = new DateTime("@$newest_timestamp");  // convert UNIX timestamp to PHP DateTime

		$window = 'P'.$window_size_in_days.'D';//get window from settings.php

		$dt->sub(new DateInterval($window));
		$oldest_timestamp = $dt->getTimestamp();

		$extent["old"] = $oldest_timestamp; //add to extent array
	}
	return $extent;
}


function getDataTitle($db, $start_timestamp, $end_timestamp, $arregationSec)
{
	/**
	 * Primary source of data for the heatmap
	 */
	//$query = "select DISTINCT GROUP_CONCAT( concat(a.title,'---') ) as titles, concat('$arregationSec'*floor(a.unix_timestamp/'$arregationSec'),'-', '$arregationSec'*floor(a.unix_timestamp/'$arregationSec') + '$arregationSec') as range_t,   GROUP_CONCAT(a.title) as titlelist  from news.NewsMetaData a, NewsContent b WHERE b.content IS NOT NULL  AND a.unix_timestamp>='$start_timestamp' AND a.unix_timestamp<='$end_timestamp' AND   a.uuid = b.uuid group by range_t;";    
// 	$query = "select DISTINCT GROUP_CONCAT( concat(a.title,'---') ) as titles, concat('$arregationSec'*floor(a.unix_timestamp/'$arregationSec'),'-', '$arregationSec'*floor(a.unix_timestamp/'$arregationSec') + '$arregationSec') as range_t  from news.NewsMetaData a, NewsContent b WHERE b.content IS NOT NULL  AND a.unix_timestamp>='$start_timestamp' AND a.unix_timestamp<='$end_timestamp' AND   a.uuid = b.uuid group by range_t ORDER BY a.unix_timestamp;";
	$query = "select DISTINCT GROUP_CONCAT( concat(a.title,'---') ) as titles, concat('$arregationSec'*floor(a.unix_timestamp/'$arregationSec'),'-', '$arregationSec'*floor(a.unix_timestamp/'$arregationSec') + '$arregationSec') as range_t  from news.NewsMetaData a, NewsContent b WHERE b.content IS NOT NULL  AND a.unix_timestamp>='$start_timestamp' AND a.unix_timestamp<='$end_timestamp' AND   a.uuid = b.uuid group by range_t ORDER BY a.unix_timestamp DESC;";	
	$result = $db->query ( $query );

	if (! $result) // Verify the tweet query did not fail.
	{
		printf ( "Query failed: " . $db->error );
		exit ();
	}
	

	$output = array(); //get extent of the data
	while ( $row = $result->fetch_assoc () ) 
	{
		$key = $row ['range_t'] ;
		
		$titleArr =  explode ( "---,", cleanText( $row ['titles'] ) )	;
		
		unset($outputVal );
		$outputVal = array();
		
		foreach ($titleArr as $value) {
			$currentstring = str_replace("---", "", $value );
			$outputVal[] = $currentstring;
		}
		
		$output[$key] = $outputVal ;

	}
	
	return $output;
}


function formatNewsContent($text, $numOfSentences )
{
	$re = '/# Split sentences on whitespace between them.
        (?<=                # Begin positive lookbehind.
          [.!?]             # Either an end of sentence punct,
        | [.!?][\'"]        # or end of sentence punct and quote.
        )                   # End positive lookbehind.
        (?<!                # Begin negative lookbehind.
          Mr\.              # Skip either "Mr."
        | Mrs\.             # or "Mrs.",
        | Ms\.              # or "Ms.",
        | Jr\.              # or "Jr.",
        | Dr\.              # or "Dr.",
        | Prof\.            # or "Prof.",
        | Sr\.              # or "Sr.",
        | T\.V\.A\.         # or "T.V.A.",
		| U\.S\.A\.         # or "U.S.A.",
		| U\.S\.         # or "U.S.",
		| E\.U\.         # or "E.U.",
		| U\.K\.         # or "U.K.",
                            # or... (you get the idea).
        )                   # End negative lookbehind.
        \s+                 # Split on whitespace between sentences.
        /ix';
	$sentences = preg_split($re, $text, -1, PREG_SPLIT_NO_EMPTY);

	$strVal = "";


	for($v = $numOfSentences ; $v <= count ($sentences); $v = $v + $numOfSentences )
	{
		$begIndex = $v-$numOfSentences ;
		$endIndex = $v;

		$output = array_slice($sentences, $begIndex, $numOfSentences  );
		$outputString =  implode ( " ", $output  ) ;
		$strVal .= "<p>". $outputString ."</p>";

	}

	return $strVal;
}

// $out = getHeatMapAggregatedDataWeekvsDay( $result_array,  "topic");
// $aggredData = $out["heat_map"];

function getListOfEntities($db, $aggredData, $param, $start_timestamp, $end_timestamp )
{
	$entityList = __::keys($aggredData);
	if (! empty($entityList))
	{
	
		$entityListStr = implode("|", $entityList);
		
		$groupList = array("topic", "person","organization");
		$needList = __::difference( $groupList, array( $param ) );
		
		$query = "";
		
		unset($outPut);
		$outPut = array();
		
		if ( count(__::difference( $needList, array( "person","organization" ) ) ) == 0 )
		{
			//$query = "select GROUP_CONCAT( concat(a.person,'---') ) as personlist, GROUP_CONCAT( concat(a.organization,'---') ) as organizationlist from news.NewsMetaData a, NewsContent b WHERE b.content IS NOT NULL AND a.topic REGEXP '$entityListStr'   AND a.unix_timestamp>='$start_timestamp' AND a.unix_timestamp<='$end_timestamp' AND   a.uuid = b.uuid;";
			$query = "select GROUP_CONCAT( a.person ) as personlist, GROUP_CONCAT( a.organization ) as organizationlist from news.NewsMetaData a, NewsContent b WHERE b.content IS NOT NULL AND a.topic REGEXP '$entityListStr'   AND a.unix_timestamp>='$start_timestamp' AND a.unix_timestamp<='$end_timestamp' AND   a.uuid = b.uuid;";
			
		}
		else if ( count(__::difference( $needList, array( "person","topic" ) ) ) == 0 )
		{
	 		//$query = "select GROUP_CONCAT( concat(a.person,'---') ) as personlist, GROUP_CONCAT( concat(a.topic,'---') ) as topiclist from news.NewsMetaData a, NewsContent b WHERE b.content IS NOT NULL AND a.organization REGEXP '$entityListStr'   AND a.unix_timestamp>='$start_timestamp' AND a.unix_timestamp<='$end_timestamp' AND   a.uuid = b.uuid;";
			$query = "select GROUP_CONCAT( a.person ) as personlist, GROUP_CONCAT( a.topic ) as topiclist from news.NewsMetaData a, NewsContent b WHERE b.content IS NOT NULL AND a.organization REGEXP '$entityListStr'   AND a.unix_timestamp>='$start_timestamp' AND a.unix_timestamp<='$end_timestamp' AND   a.uuid = b.uuid;";
			
		}
		else if ( count(__::difference( $needList, array( "organization","topic" ) ) ) == 0 )
		{
			//$query = "select GROUP_CONCAT( concat(a.organization,'---') ) as organizationlist, GROUP_CONCAT( concat(a.topic,'---') ) as topiclist from news.NewsMetaData a, NewsContent b WHERE b.content IS NOT NULL AND a.person REGEXP '$entityListStr'   AND a.unix_timestamp>='$start_timestamp' AND a.unix_timestamp<='$end_timestamp' AND   a.uuid = b.uuid;";
			$query = "select GROUP_CONCAT( a.organization ) as organizationlist, GROUP_CONCAT( a.topic ) as topiclist from news.NewsMetaData a, NewsContent b WHERE b.content IS NOT NULL AND a.person REGEXP '$entityListStr'   AND a.unix_timestamp>='$start_timestamp' AND a.unix_timestamp<='$end_timestamp' AND   a.uuid = b.uuid;";
			
		}	
		
		$result = $db->query ( $query );
		
		if (! $result) // Verify the tweet query did not fail.
		{
			printf ( "Query failed: " . $db->error );
			exit ();
		}
		
	
		while ( $row = $result->fetch_assoc () ) 
		{
			
	 		$personListVal =  $row ['personlist'];
	 		$organizationListVal = $row ['organizationlist'];
	 		$topicListVal =  $row ['topiclist'] ;
			
			if (empty($personListVal) )
			{
				unset($temp);
				$temp = array();
				$temp["topic"] = $topicListVal ;
				$temp["organization"] = $organizationListVal;
				$outPut["facets"] = $temp;
			}
			
			else if (empty($organizationListVal) )
			{
				unset($temp);
				$temp = array();
				$temp["topic"] = $topicListVal ;
				$temp["person"] = $personListVal;
				$outPut["facets"] = $temp;
			}
			
				
			else if (empty($topicListVal) )
			{
				unset($temp);
				$temp = array();
				$temp["person"] = $personListVal;
				$temp["organization"] = $organizationListVal;
				$outPut["facets"] = $temp;
			}	
			
		}
		
		return $outPut;
	}
	
}



// $db = new mysqli ( $db_host, $db_user, $db_password, $db_name ); // location, user, pass, database to use

// // // $extent = "1392196521-1402714921";

// $extent = "1392196521-1397455721";
// list ( $start_timestamp, $end_timestamp ) = explode ( "-", $extent );
// $arregationSec = 21600;

// $result_array = getData ( $db, $extent_start, $extent_end, $arregationSec );;
// $hotnessObj = new determineHotnessOfEntity (  );

// $param = "topic";

// $out = getHeatMapAggregatedDataWeekvsDay( $result_array,$param  );
// $aggredData = $out["heat_map"];
// // $entityList = __::keys($aggredData);

// $output = getListOfEntities($db, $aggredData, $param, $start_timestamp, $end_timestamp );

// $v =0;

// $out = getHeatMapAggregatedDataWeekvsDay ($result_array, "organization");
// //$out = getHeatMapAggregatedDataWeekvsDay( $result_array, "person");

// // $out = getHeatMapAggregatedDataMonthvsWeek( $result_array,  "person");
// $v = 0;

// $db = new mysqli ( $db_host, $db_user, $db_password, $db_name ); // location, user, pass, database to use

// $extent = "1397455721-1397542121";


// list ( $extent_start, $extent_end ) = explode ( "-", $extent );
// $arregationSec = 900;

// $result_array = getData ( $db, $extent_start, $extent_end, $arregationSec );;
// $hotnessObj = new determineHotnessOfEntity (  );
// $out = getHeatMapAggregatedDataHourvsMinute( $result_array,  "topic");

// $v = 0;


/**
determine the hotness of each topic in the stream  

$hotness = new determineHotnessOfEntity (  );
$hotness->setData( $result_array );
$out = $hotness->getAnomalyScoreByEntity(  "topic" );
$hotness->setData( $result_array );
$outnext = $hotness->getAnomalyScoreByEntity(  "topic" );
 */

/**
 * create hotness determiner outside the method
 */
// $hotnessObj = new determineHotnessOfEntity (  );
// $out = getHeatMapAggregatedData($result_array,  "topic");
// $v = 0;
// $db = new mysqli ( $db_host, $db_user, $db_password, $db_name ); // location, user, pass, database to use
// $extent = "1392196521-1497455721";
// list ( $start_timestamp, $end_timestamp ) = explode ( "-", $extent );
// $arregationSec = 21600;

// $out = getDataTitle($db, $start_timestamp, $end_timestamp, $arregationSec);

// $v = 0;


?>