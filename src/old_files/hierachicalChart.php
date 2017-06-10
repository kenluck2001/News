<?php
//session_start();
require_once('lib/underscore.php');
require_once('function_processing.php');
require_once('lib/db_config.php');
require_once('settings.php');
/**
$db = new mysqli($db_host , $db_user, $db_password, $db_name); // location, user, pass, database to use

$extent = getFullExtent ($db, $window_size_in_days);
$query = "SELECT uuid, year, day, hour, minute, second, month, person, organization, topic, title, summary, source, doc_url FROM NewsMetaData WHERE unix_timestamp>=".$extent["old"]." AND unix_timestamp<=".$extent["new"] ;
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
*/
$person_list = getFieldDomain($result_array,'person'); //get the list of persons
$organization_list = getFieldDomain($result_array,'organization'); //get the list of organizations
$topic_list = getFieldDomain($result_array, 'topic');//get the list of topics

//REMOVE NULLS
$person_list = array_filter( $person_list );
$organization_list = array_filter( $organization_list );
$topic_list = array_filter( $topic_list );

$groupByPerson = __::groupBy($result_array, 'person');
$groupByOrganization = __::groupBy($result_array, 'organization');
$groupByTopic = __::groupBy($result_array, 'topic');

$groupByUUID = __::groupBy($result_array, 'uuid');

$groupByPerson_and_Organization = groupByMulti($result_array, ['person', 'organization']);
$groupByOrganization_and_Topic = groupByMulti($result_array, ['organization', 'topic']);
$groupByTopic_and_Person = groupByMulti($result_array, ['topic', 'person']);


//shows the relationship between person and organization (person -> organization)

$output_PO = createData($person_list, $organization_list, $groupByPerson, $groupByOrganization, $groupByPerson_and_Organization, $groupByUUID, "PO" );
//shows the relationship between organization and topic (organization -> topic)
$output_OT = createData($organization_list, $topic_list, $groupByOrganization, $groupByTopic, $groupByOrganization_and_Topic, $groupByUUID, "OT" );
//shows the relationship between topic and person (topic -> person)
$output_TP = createData($topic_list, $person_list, $groupByTopic, $groupByPerson, $groupByTopic_and_Person, $groupByUUID, "TP" );

$result = array_merge($output_PO, $output_OT);
$hierarchicalData = array_merge($result, $output_TP);

//$nresult = removeElementWithValue($result, "entity", null);
//$outputJson = json_encode($result);

//print_r($outputJson);

?>