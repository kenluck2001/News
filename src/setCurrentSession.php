<?php
session_start ();

require_once('common_function.php');

/**
 * set the current value for the session variable
 */
$aggregationType = $_POST ["aggregationType"] ;
$param = $_POST ["param"] ;
$term = $_POST ["term"] ;


function setAggregationAndType($aggregationType, $param)
{
	unset( $_SESSION ["aggregation_type"] ); //clear session
	$_SESSION ["aggregation_type"] = $aggregationType;

	unset( $_SESSION ["type"] ); //clear session
	$_SESSION ["type"] = $param;

}


function setSearchTerm($term)
{
	unset( $_SESSION["search_term"] ); //clear session
	$_SESSION["search_term"] = $term;

}



if ( isset($aggregationType) &&  isset ($param) )
{
	setAggregationAndType($aggregationType, $param);
}

if ( isset ($term) )
{
	setSearchTerm($term);
}


?>


