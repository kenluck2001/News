<?php
require_once('lib/underscore.php');



function getFullExtent ($db, $window_size_in_days )
{	
	if($db->connect_errno)
	{
		printf ("Connection failed:" . $db->connect_error);
		exit();
	}
	
	$query = "SELECT MAX(unix_timestamp) AS oldtime FROM NewsMetaData";
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
		
		
		//$dt->sub(new DateInterval('P15D')); //deduct 15 day from newest time
		$dt->sub(new DateInterval($window));
		$oldest_timestamp = $dt->getTimestamp();
	
		$extent["old"] = $oldest_timestamp; //add to extent array
	}	
	return $extent;
}

function groupByMulti ($obj, $values)
{
	if (count($values) == 0)
	{
		return $obj;
	}
	$byFirst = __::groupBy($obj, $values[0]);
	$rest = $values[1];

	$key_col = __::keys($byFirst ) ;

	foreach ($key_col as $key => $value)
	{
		$byFirst[$value] = __::groupBy($byFirst[$value], $rest);
	}
	return $byFirst;
}

function sd_square($x, $mean)
{
	return pow($x - $mean,2);
}

// Function to calculate standard deviation (uses sd_square)
function sd($array) {
	// square root of sum of squares devided by N-1
	return sqrt(array_sum(array_map("sd_square", $array, array_fill(0,count($array), (array_sum($array) / count($array)) ) ) ) / (count($array)-1) );
}

function flattenArray($dataset, $field )
{
	$aTmp1;
	foreach($dataset as $aV)
	{
		foreach ($field as $key => $value)
		{
			$aTmp1[] = $aV[$value];
		}
	}
	return $aTmp1;
}

function getAggregation($db,$extent, $time_aggregation )
{
	$query = "SELECT t.* FROM NewsMetaData t ORDER BY ABS( t.unix_timestamp -". $extent["old"] .") LIMIT 1";
	$result = $db->query($query);
	if(!$result) // Verify the tweet query did not fail.
	{
		printf("Query failed: " . $db->error);
		exit();
	}	
	
	$oldest_date = $result->fetch_assoc();	// Get the oldest news.
	$oldest_date_string;
	$interval;
	
	if($time_aggregation == "1_min")
	{
		$interval = DateInterval::createFromDateString('1 minute');
	
		// Take the start time minutes and make sure the start time begins on 0, 5, 10, 15, ...etc.
		$start_minute = $oldest_date["minute"] / 5;
		$start_minute = floor($start_minute);
		$start_minute = $start_minute * 5;
	
		$start_second = 0;
	
		// Create start date (oldest date)
		$oldest_date_string		  = $oldest_date["year"] . "-" . $oldest_date["month"]  . "-" . $oldest_date["day"]  . " " . $oldest_date["hour"]  . ":" . $start_minute  . ":" . $start_second; // get the oldest date as a string
	
	}
	else if($time_aggregation == "5_min")
	{
		$interval = DateInterval::createFromDateString('5 minutes');
	
		// Take the start time minutes and make sure the start time begins on 0, 5, 10, 15, ...etc.
		$start_minute = $oldest_date["minute"] / 5;
		$start_minute = floor($start_minute);
		$start_minute = $start_minute * 5;
	
		$start_second = 0;
	
		// Create start date (oldest date)
		$oldest_date_string		  = $oldest_date["year"] . "-" . $oldest_date["month"]  . "-" . $oldest_date["day"]  . " " . $oldest_date["hour"]  . ":" . $start_minute  . ":" . $start_second; // get the oldest date as a string
	}
	else if($time_aggregation == "15_min")
	{
		$interval = DateInterval::createFromDateString('15 minutes');
	
		// Take the start time minutes and make sure the start time begins on 0, 15, 30, 45.
		$start_minute = $oldest_date["minute"] / 15;
		$start_minute = floor($start_minute);
		$start_minute = $start_minute * 15;
	
		$start_second = 0;
	
		// Create start date (oldest date)
		$oldest_date_string		  = $oldest_date["year"] . "-" . $oldest_date["month"]  . "-" . $oldest_date["day"]  . " " . $oldest_date["hour"]  . ":" . $start_minute  . ":" . $start_second; // get the oldest date as a string
	}
	else if($time_aggregation == "30_min")
	{
		$interval = DateInterval::createFromDateString(30*60 . ' seconds');
	
		// Take the start time minutes and make sure the start time begins on 0, 30.
		$start_minute = $oldest_date["minute"] / 30;
		$start_minute = floor($start_minute);
		$start_minute = $start_minute * 30;
	
		$start_second = 0;
	
		// Create start date (oldest date)
		$oldest_date_string		  = $oldest_date["year"] . "-" . $oldest_date["month"]  . "-" . $oldest_date["day"]  . " " . $oldest_date["hour"]  . ":" . $start_minute  . ":" . $start_second; // get the oldest date as a string
		$oldest_date = new DateTime($oldest_date_string); // create new DateTime objects of the oldest Tweet date
	}
	else if($time_aggregation == "1_hour")
	{
		$interval = DateInterval::createFromDateString('1 hour');
		$start_hour = $oldest_date["hour"];
	
		$start_minute = 0;
		$start_second = 0;
	
		// Create start date (oldest date)
		$oldest_date_string		  = $oldest_date["year"] . "-" . $oldest_date["month"]  . "-" . $oldest_date["day"]  . " " . $start_hour  . ":" . $start_minute  . ":" . $start_second; // get the oldest date as a string
	}
	else if($time_aggregation == "3_hour")
	{
		$interval = DateInterval::createFromDateString('3 hours');
	
		// Take the start time minutes and make sure the start time begins on 0, 6, 12, 18.
		$start_hour = $oldest_date["hour"] / 6;
		$start_hour = floor($start_hour);
		$start_hour = $start_hour * 6;
	
		$start_minute = 0;
		$start_second = 0;
	
		// Create start date (oldest date)
		$oldest_date_string		  = $oldest_date["year"] . "-" . $oldest_date["month"]  . "-" . $oldest_date["day"]  . " " . $start_hour  . ":" . $start_minute  . ":" . $start_second; // get the oldest date as a string
	}
	else if($time_aggregation == "6_hour")
	{
		$interval = DateInterval::createFromDateString('6 hours');
	
		// Take the start time minutes and make sure the start time begins on 0, 6, 12, 18.
		$start_hour = $oldest_date["hour"] / 6;
		$start_hour = floor($start_hour);
		$start_hour = $start_hour * 6;
	
		$start_minute = 0;
		$start_second = 0;
	
		// Create start date (oldest date)
		$oldest_date_string		  = $oldest_date["year"] . "-" . $oldest_date["month"]  . "-" . $oldest_date["day"]  . " " . $start_hour  . ":" . $start_minute  . ":" . $start_second; // get the oldest date as a string
	}
	else if($time_aggregation == "12_hour")
	{
		$interval = DateInterval::createFromDateString('12 hours');
	
		// Take the start time minutes and make sure the start time begins on 0, 12.
		$start_hour = $oldest_date["hour"] / 12;
		$start_hour = floor($start_hour);
		$start_hour = $start_hour * 12;
	
		$start_minute = 0;
		$start_second = 0;
	
		// Create start date (oldest date)
		$oldest_date_string		  = $oldest_date["year"] . "-" . $oldest_date["month"]  . "-" . $oldest_date["day"]  . " " . $start_hour  . ":" . $start_minute  . ":" . $start_second; // get the oldest date as a string
	}
	else if($time_aggregation == "24_hour")
	{
		$interval = DateInterval::createFromDateString('24 hours');
	
		// Take the start time minutes and make sure the start time begins on 0.
		$start_hour = $oldest_date["hour"] / 24;
		$start_hour = floor($start_hour);
		$start_hour = $start_hour * 24;
	
		$start_minute = 0;
		$start_second = 0;
	
		// Create start date (oldest date)
		$oldest_date_string		  = $oldest_date["year"] . "-" . $oldest_date["month"]  . "-" . $oldest_date["day"]  . " " . $start_hour  . ":" . $start_minute  . ":" . $start_second; // get the oldest date as a string
		$oldest_date = new DateTime($oldest_date_string); // create new DateTime objects of the oldest Tweet date
	}
	else if($time_aggregation == "48_hour")
	{
		$interval = DateInterval::createFromDateString('48 hours');
	
		// Take the start time minutes and make sure the start time begins on 0.
		$start_hour = $oldest_date["hour"] / 24;
		$start_hour = floor($start_hour);
		$start_hour = $start_hour * 24;
	
		$start_minute = 0;
		$start_second = 0;
	
		// Create start date (oldest date)
		$oldest_date_string		  = $oldest_date["year"] . "-" . $oldest_date["month"]  . "-" . $oldest_date["day"]  . " " . $start_hour  . ":" . $start_minute  . ":" . $start_second; // get the oldest date as a string
	}
	
	$output = array();
	$output["interval"] = $interval;
	$output["oldDate"] = $oldest_date_string	;
	return $output;
	
}

function getFieldDomain($dataset, $field_name )
{
	/*
		get unique item in the field
	*/
	$unique_items_arr = __::pluck($dataset, $field_name);
	$unique_items_arr = __::uniq( $unique_items_arr );
	return $unique_items_arr;
}

function getSparkLineDataByParameter($result_array, $param,  $interval, $oldest_date_string  )
{
	/*
		$param can be 'topic', 'person', 'organization' ;
		because there are database field used to filter the data
	*/
	
	$topic_list = getFieldDomain($result_array, $param); //get the list of topics
	$topic_list = array_filter($topic_list);//remove nulls
	$grouped_by_topic = __::groupBy($result_array, $param);
	
	
	$utc_offset = 0; //set to 0 now
	
	for($ind = 0; $ind < count($topic_list); $ind++)
	{
	
		unset($result);
		$current_topic = $topic_list[$ind];
		$result = $grouped_by_topic[$current_topic];
	
	
	
		// Starting from the oldest date, collect news into intervals by adding interval.
		$current_date 	= new DateTime($oldest_date_string);
		$next_date		= new DateTime($oldest_date_string);
		$next_date 		= $next_date->add($interval);	// make sure the news falls before this inteval
	
		$current_news_in_interval 	= 0;
	
		$news_id_array= array();
	
	
		foreach ( $result as $text_row )
		{
			$news_date_string  = $text_row["year"] . "-" . $text_row["month"]  . "-" . $text_row["day"]  . " " . $text_row["hour"]  . ":" . $text_row["minute"]  . ":" . $text_row["second"]; // get the oldest date as a string
			$news_date 		= new DateTime($news_date_string); // create new DateTime of the news date
			$news_id = $text_row["uuid"];
	
	
			if($news_date < $next_date) // If Before next_date, add to interval.
			{
				$news_id_array[]=$news_id;
				$current_news_in_interval++;
					
			}// end of if($news_date < $next_date)
			else // Else, this news is AFTER next date. Then we want to add collected news between [current_date, next_date) to current_date interval (front end).
			{
				// Convert time with the selected time offset
				$current_date_timestamp = strtotime($current_date->format('Y-m-d H:i:s'));
				$current_date_timestamp = $current_date_timestamp + $utc_offset * 60 * 60;
				$current_date_with_offset = date('Y-m-d H:i:s', $current_date_timestamp);
				$arr_news = array(
						"x" 				=> $current_date_with_offset,
						"y"					=> $current_news_in_interval,
						"newsid"			=> $news_id_array
				);
				$json_news_graph_data[$current_topic][] = $arr_news;
	
				$current_date = new DateTime($next_date->format('Y-m-d H:i:s'));
				$next_date = $next_date->add($interval);
	
				// Then keep increasing the interval until we find the next interval that will contain news.
				while($news_date >= $next_date) //
				{
					// Convert time with the selected time offset
					$current_date_timestamp = strtotime($current_date->format('Y-m-d H:i:s'));
					$current_date_timestamp = $current_date_timestamp + $utc_offset * 60 * 60;
					$current_date_with_offset = date('Y-m-d H:i:s', $current_date_timestamp);
	
					// Push empty group
					$arr_news = array(
							"x" 				=> $current_date_with_offset,
							"y"					=> 0,
							"newsid"			=> array()
					);
	
					$json_news_graph_data[$current_topic][] = $arr_news;
					$current_date = new DateTime($next_date->format('Y-m-d H:i:s'));
					$next_date = $next_date->add($interval);
				}
	
				$current_news_in_interval = 1;;
	
				$news_id_array=array();
				$news_id_array[]=$news_id;
	
			}
				
		} // end looking for news... foreach ( $result as $text_row )
	
		// Convert time with the selected time offset
		$current_date_timestamp = strtotime($current_date->format('Y-m-d H:i:s'));
		$current_date_timestamp = $current_date_timestamp + $utc_offset * 60 * 60;
		$current_date_with_offset = date('Y-m-d H:i:s', $current_date_timestamp);
			
		// Make json object from all news collected in the LAST interval.
	
		$arr_news = array(
				"x" 				=> $current_date_with_offset,
				"y"					=> $current_news_in_interval,
				"newsid"			=> $news_id_array
		);
	
	
		$json_news_graph_data[$current_topic][] = $arr_news;
	
		$current_date = new DateTime($next_date->format('Y-m-d H:i:s'));
		$next_date = $next_date->add($interval);
	
		// If the data does not go all the way to the end of the timeline, add intervals of 0.
		while($current_date <= $most_recent_date)
		{
			// Convert time with the selected time offset
			$current_date_timestamp = strtotime($current_date->format('Y-m-d H:i:s'));
			$current_date_timestamp = $current_date_timestamp + $utc_offset * 60 * 60;
			$current_date_with_offset = date('Y-m-d H:i:s', $current_date_timestamp);
	
			// Push empty group
			$arr_news = array(
					"x" 				=> $current_date_with_offset,
					"y"					=> 0,
					"newsid"			=> array()
			);
	
			$json_news_graph_data[$current_topic][] = $arr_news;
	
			$current_date = new DateTime($next_date->format('Y-m-d H:i:s'));
			$next_date = $next_date->add($interval);
		}//end of while($current_date <= $most_recent_date)
	
	} // end looping through each sentiment for loop
	
	//ensure each sparkline is for a term
	//$copyData = $json_news_graph_data;
	$storeData = array();
	
	//$json_news_graph_data
	$topic_set = array();
	$selected_topic = array();
	for($ind = 0; $ind < count($topic_list); $ind++)
	{
		$current_topic = $topic_list[$ind];
		$data = $json_news_graph_data[$current_topic];
		$individual_topics = explode(",", $current_topic);
		$individual_topics = array_filter( $individual_topics);
		for($ivn = 0; $ivn < count($individual_topics); $ivn++)
		{
			array_push($selected_topic,$individual_topics[$ivn]);
			$currentData = array(
					$param => $individual_topics[$ivn],
					"value" => $data
			);
			array_push($storeData, $currentData);
		}
	}
	
	
	$grouped_data_by_topic = __::groupBy($storeData, $param);
	unset($storeData);
	
	
	$selected_topics = __::uniq( $selected_topic );
	$selected_topics = array_filter($selected_topics );
	unset($selected_topic);
	
	
	$totalTopicsArray = array();
	
	for($ind = 0; $ind < count($selected_topics); $ind++)
	{
		$current_topic = $selected_topics[$ind];
		$currentTopicObj = $grouped_data_by_topic[$current_topic];
		$num_of_elements_topic_obj = count($currentTopicObj);
	
		$outputArray = array();
	
		if ($num_of_elements_topic_obj >= 1)
		{
			$result = array();
			$result_news = array();
			for( $index=0; $index < $num_of_elements_topic_obj; $index++)
			{
				$currentObject = $currentTopicObj[$index];
				$currentObjectValue = $currentTopicObj[$index]["value"];
	
				foreach ( $currentObjectValue as $curent_row )
				{
					$yVal = $curent_row["y"];
					$xVal = $curent_row["x"];
					$newsIdArray = $curent_row["newsid"];
	
					if ( array_key_exists($xVal, $result ) )
					{
						$temp = $result[$xVal];
						$result[$xVal] = $temp + $yVal;
					}
					else
					{
						$result[$xVal] = $yVal;
					}
	
	
					if ( array_key_exists($xVal, $result_news ) )
					{
						$tempSet = $result_news[$xVal];
						$result_news[$xVal] = __::uniq( array_merge($tempSet, $newsIdArray) );
					}
					else
					{
						$result_news[$xVal] = $newsIdArray;
					}
	
				}
					
			}
			//get all keys
			$xValuesArray = __::keys($result);
	
	
			foreach ($xValuesArray as &$xvalue) {
				$currentData = array(
						"x" => $xvalue,
						"y" => $result[$xvalue],
						"newsid" => $result_news[$xvalue]
				);
				array_push($outputArray, $currentData);
			}
			unset($result);
			unset($result_news);
		}
	
		$totalTopicsArray[$current_topic] = $outputArray;
		unset($outputArray);	
	}
	return $totalTopicsArray;
}

function calculateZscoreForTerms($totalTopicsArray)
{
	//accept the sparkline data
	$keyValues = __::keys($totalTopicsArray);
	$term_zscore = array();
	
	foreach ($keyValues as &$curkey) 
	{
		$y_arr = __::pluck($totalTopicsArray[$curkey], 'y');
		$y_arr_exclude_currentVal = array_slice($y_arr, 0, count($y_arr)-1);
	
		$mean = array_sum($y_arr_exclude_currentVal)/count($y_arr_exclude_currentVal); //calculate mean based on the previous values in the window
	
		$currentVal = end($y_arr);
		$zscore = 0;
		if (array_sum($y_arr) > 0)  //avoid zero division error
		{
			$zscore = ($currentVal - $mean) / sd($y_arr_exclude_currentVal); //calculate the Z-score
		}
		if($zscore)
		{
			$term_zscore[$curkey] = $zscore;
		}
		else 
		{
			$term_zscore[$curkey] = 0;
		}
	
	}
	return $term_zscore;
}

function createData($person_list, $organization_list, $groupByPerson, $groupByOrganization, $groupByPerson_and_Organization, $groupByUUID, $type )
{
	//$type = "PO" "OT" "TP"
	//PO  person -> organization
	//OT  organization -> topic
	//TP  topic  -> person
	$output_PO = array();
	$arr = array("PO"=>3, "OT"=>4, "TP"=>2);
	
	//print_r($arr[$type]);

	foreach ($person_list as &$current_person)
	{
		foreach ($organization_list as &$current_organization)
		{
			if ( isset($current_person) && isset($current_organization) )
			{
				$cur_group_by_person = $groupByPerson_and_Organization[$current_person];
				if (array_key_exists($current_organization, $cur_group_by_person))
				{

					$d1 = $groupByPerson[$current_person];
					$d2 = $groupByOrganization[$current_organization];

					$d1_name = flattenArray($d1, ['uuid'] );
					$d2_name = flattenArray($d2, ['uuid'] );

					$d1_name = __::uniq($d1_name);
					$d2_name = __::uniq($d2_name);

					$arraysNotAreEqual = ($d1_name !== $d1_name);

					$source_nodes = $d1_name;
					if ($arraysNotAreEqual)
					{
						$source_nodes = __::difference($d1_name, $d2_name); //get the starting nodes
					}

					//get destination nodes
					if($source_nodes)
					{
						foreach ($source_nodes as $key => $value)
						{
							$ucurrent_uuid = $value;
							$currnewsByID = $groupByUUID[$ucurrent_uuid];

							foreach ( $currnewsByID as $text_row )
							{
								$ucurrent_person;
								if($arr[$type] == 3)
								{
									$ucurrent_person = $text_row["person"];
								}
								else if($arr[$type] == 4)
								{
									$ucurrent_person = $text_row["organization"];
								}
								else  if($arr[$type] == 2)
								{
									$ucurrent_person = $text_row["topic"];
								}
								
								$ucurrent_uuid = $text_row["uuid"];
								if($ucurrent_person)
								{
									$current_grouped_by_person = $groupByPerson_and_Organization[$ucurrent_person];

									if (array_key_exists($current_organization, $current_grouped_by_person))
									{
										$current_grouped_by_person = $current_grouped_by_person[$current_organization];
										$getDestination = array_values($current_grouped_by_person);
										$uuid_arr = __::pluck($getDestination, 'uuid');
										//$output[$ucurrent_person] = $uuid_arr ;
										$plan = array();
										$id_arr = array();

										foreach ($uuid_arr as $uuid)
										{
											$currentData = array(
													"id" => $uuid
											);
											array_push($id_arr, $currentData);
										}

										if (!empty($ucurrent_person))
										{
											$currentData = array(
													"id" => $ucurrent_uuid ,
													"entity" => $ucurrent_person,
													"area"   => "$arr[$type]",
													"plans" => $id_arr
											);

											$output_PO[] = $currentData;
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}

	return $output_PO;
}

function removeElementWithValue($array, $key, $value){
     foreach($array as $subKey => $subArray){
          if($subArray[$key] == $value){
               unset($array[$subKey]);
          }
     }
     return $array;
}




function getTimelineData($result,  $interval, $oldest_date_string  )
{

	$json_news_graph_data = array();

	$utc_offset = 0; //set to 0 now

	// Starting from the oldest date, collect news into intervals by adding interval.
	$current_date 	= new DateTime($oldest_date_string);
	$next_date		= new DateTime($oldest_date_string);
	$next_date 		= $next_date->add($interval);	// make sure the news falls before this inteval

	$current_news_in_interval 	= 0;

	$news_id_array= array();


	foreach ( $result as $text_row )
	{
		$news_date_string  = $text_row["year"] . "-" . $text_row["month"]  . "-" . $text_row["day"]  . " " . $text_row["hour"]  . ":" . $text_row["minute"]  . ":" . $text_row["second"]; // get the oldest date as a string
		$news_date 		= new DateTime($news_date_string); // create new DateTime of the news date
		$news_id = $text_row["uuid"];


		if($news_date < $next_date) // If Before next_date, add to interval.
		{
			$news_id_array[]=$news_id;
			$current_news_in_interval++;
					
		}// end of if($news_date < $next_date)
		else // Else, this news is AFTER next date. Then we want to add collected news between [current_date, next_date) to current_date interval (front end).
		{
			// Convert time with the selected time offset
			$current_date_timestamp = strtotime($current_date->format('Y-m-d H:i:s'));
			$current_date_timestamp = $current_date_timestamp + $utc_offset * 60 * 60;
			$current_date_with_offset = date('Y-m-d H:i:s', $current_date_timestamp);
			$arr_news = array(
						"x" 				=> $current_date_with_offset,
						"y"					=> $current_news_in_interval,
						"newsid"			=> $news_id_array
				);
			$json_news_graph_data[] = $arr_news;

			$current_date = new DateTime($next_date->format('Y-m-d H:i:s'));
			$next_date = $next_date->add($interval);

			// Then keep increasing the interval until we find the next interval that will contain news.
			while($news_date >= $next_date) //
			{
				// Convert time with the selected time offset
				$current_date_timestamp = strtotime($current_date->format('Y-m-d H:i:s'));
				$current_date_timestamp = $current_date_timestamp + $utc_offset * 60 * 60;
				$current_date_with_offset = date('Y-m-d H:i:s', $current_date_timestamp);

				// Push empty group
				$arr_news = array(
							"x" 				=> $current_date_with_offset,
							"y"					=> 0,
							"newsid"			=> array()
					);

				$json_news_graph_data[] = $arr_news;
				$current_date = new DateTime($next_date->format('Y-m-d H:i:s'));
				$next_date = $next_date->add($interval);
			}

			$current_news_in_interval = 1;

			$news_id_array=array();
			$news_id_array[]=$news_id;

		}

	} // end looking for news... foreach ( $result as $text_row )

	// Convert time with the selected time offset
	$current_date_timestamp = strtotime($current_date->format('Y-m-d H:i:s'));
	$current_date_timestamp = $current_date_timestamp + $utc_offset * 60 * 60;
	$current_date_with_offset = date('Y-m-d H:i:s', $current_date_timestamp);
			
	// Make json object from all news collected in the LAST interval.

	$arr_news = array(
				"x" 				=> $current_date_with_offset,
				"y"					=> $current_news_in_interval,
				"newsid"			=> $news_id_array
		);


	$json_news_graph_data[] = $arr_news;

	$current_date = new DateTime($next_date->format('Y-m-d H:i:s'));
	$next_date = $next_date->add($interval);

	// If the data does not go all the way to the end of the timeline, add intervals of 0.
	while($current_date <= $most_recent_date)
	{
		// Convert time with the selected time offset
		$current_date_timestamp = strtotime($current_date->format('Y-m-d H:i:s'));
		$current_date_timestamp = $current_date_timestamp + $utc_offset * 60 * 60;
		$current_date_with_offset = date('Y-m-d H:i:s', $current_date_timestamp);

		// Push empty group
		$arr_news = array(
					"x" 				=> $current_date_with_offset,
					"y"					=> 0,
					"newsid"			=> array()
			);

		$json_news_graph_data[] = $arr_news;

		$current_date = new DateTime($next_date->format('Y-m-d H:i:s'));
		$next_date = $next_date->add($interval);
	}//end of while($current_date <= $most_recent_date)


	return $json_news_graph_data;
}


function getNewsWithDecayScore($groupByTime )
{
	$get_time_array = __::keys($groupByTime);
	$size = count($get_time_array);
	$alpha = 5 / $size; //estimate the alpha value using interpolation
	$counter = 0;
	$news_with_decay_score = array();

	foreach ($get_time_array  as $key => $value)
	{
		$current_time = $value;
		$current_Obj_Intime = $groupByTime[$current_time];
		$counter = $counter + 1;

		foreach ($current_Obj_Intime  as $res)
		{
			$news_ID_arr = $res["newsid"];
			foreach ($news_ID_arr  as $keyV => $val)
			{
				$currentID = $val;
				$decay_part = (-1.0 * $alpha * $counter);
				$decay_score = 1 - exp($decay_part );
				/**
				$currentData = array(
						"id" => $currentID,
						"score" => $decay_score,
						"weigth" => 0 //weight based on importance 
				);
				$news_with_decay_score[] = $currentData;
				*/
				$currentData = array(
						"id" => $currentID, //ID
						"score" => $decay_score, //score based on decay
						"weight" => 1, //weight based on importance
						"repeatWeight" => 1 
				);
				$news_with_decay_score[$currentID] = $currentData;

			}
		}
	}
	return $news_with_decay_score;

}

function getNewsWithDecayAndImportantScore($aggregatedData , $result_array )
{
	$groupByTime = __::groupBy($aggregatedData, 'x');
	$news_with_decay_score = getNewsWithDecayScore($groupByTime );

	$news_ObjectHash = array();
	
	$importantWords = $_SESSION["important_words"];
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

		$named_entity = $person.",".$organization;
		$named_entity_arr = explode( ',',$named_entity ) ;
		
		$named_entity_arr = array_filter($named_entity_arr);//remove nulls
		
		////////////////////////////determining beginning of news in window/////////////////////////////////////////
		sort($named_entity_arr); //sort the array based on string
		
		$str = serialize($named_entity_arr); //convert to string
		$md5Val = md5($str);
		
		$currentData = array(
				"id" => $currentID, //current ID
				"hash" => $md5Val, //hash
				"time" => $currentTime
		);
		$news_ObjectHash[] = $currentData;
		
		$curData = array(
				"id" => $currentID, //current ID
				"time" => $currentTime
		);
		
		array_push($output, $curData);
		
		if ( array_key_exists($md5Val, $groupByHash ) )
		{
			array_push($groupByHash[$md5Val], $curData);
		}
		else
		{
			$groupByHash[$md5Val] = array();
			array_push($groupByHash[$md5Val], $curData);
		}
		
		
		array_push($hash_array, $md5Val);

		
		////////////////////////////////////////////////////////////////////////////////////

		////////////////////////////important score/////////////////////////////////////////
		$set_Object = array_intersect($named_entity_arr, $importantWords);
		$set_Object = array_filter($set_Object);

		$currentNewsObj = $news_with_decay_score[$currentID];

		if (!empty($set_Object)) {
			$currentNewsObj["weight"] = 10;
		}
		////////////////////////////////////////////////////////////////////////////////////

		$news_Object[$currentID] = $currentNewsObj;
	}
	
	
	//$hash_array = __::pluck($news_ObjectHash, "hash");
	$hash_array_duplicates = array_count_values($hash_array);

	
	foreach ( $news_ObjectHash as $text_row )
	{	
		//$currentID = $text_row["id"];
		$currentHash = $text_row["hash"];
		$count = $hash_array_duplicates[$currentHash];
		
		$currentElement = $groupByHash[$currentHash];
		//sort by timestamp
		$sortedElement = __::sortBy($currentElement, function($n) { return $n["time"] ; });
		if ($count > 1)
		{
			
			//get last element to update the weight
			$lastElem = end($sortedElement);
			$currentID = $lastElem["id"];

			$currentNewsObj = $news_with_decay_score[$currentID];
			$currentNewsObj["repeatWeight"] = 10;
			$news_Object[$currentID] = $currentNewsObj;
			
		}
		
	}

	return $news_Object;

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

function IsNullOrEmptyString($question){
	return (!isset($question) || trim($question)==='');
}

function SparklineSortByZscore($result_array, $interval, $oldest_date_string, $num_Of_Sparklines)
{
	//$sparklineEntity = array ('topic', 'person', 'organization');
	$sparklineEntity = array ('topic', 'person', 'organization');
	$output = array();
	foreach ($sparklineEntity as $entity)
	{
		$totalTopicsArray = getSparkLineDataByParameter($result_array, $entity, $interval, $oldest_date_string );

		$term_zscore = calculateZscoreForTerms($totalTopicsArray);
		$term_array = __::keys($totalTopicsArray);
		$term_array = array_filter($term_array);
		foreach ($term_array as $term)
		{
			if ($term != NULL)
			{
				$currentData = array(
						"term" => $term, //current ID
						"sparkline" => $totalTopicsArray[$term], //hash
						"zscore" => $term_zscore[$term]
				);
			}
			if ( array_key_exists($entity, $output ) )
			{
				array_push($output[$entity], $currentData);
			}
			else
			{
				$output[$entity] = array();
				array_push($output[$entity], $currentData);
			}
		}
	}

	foreach ($sparklineEntity as $entity)
	{
		$currentData = $output[$entity];
		$sortedCurrentData = __::sortBy($currentData, function($n) { return (-1 * $n["zscore"]) ; });
		$output[$entity] = $sortedCurrentData;
	}

	$sOutput = sliceMultiDimenArray($output, $num_Of_Sparklines);
	$array_values = array_values( $sOutput );

	$currentOutput = array_combine($sparklineEntity, $array_values);
	return $currentOutput;

}


?>