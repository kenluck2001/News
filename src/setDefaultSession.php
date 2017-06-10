<?php
session_start ();
require_once('common_function.php');

/**
 * set the default value for the session variable
 */

function setDefaultSessionObject()
{
	/**
	 "Months_vs_Weeks",
	 "Weeks_vs_Days",
	 "Days_vs_Hours",
	 "Hours_vs_Minutes"
	 */


	$arrMonthvsWeek = array (
			"window-size" => "", //specify as number of months
			"selected_window_size" => "", //specify extents based on some interaction
			"aggregSecX" => 2678400, //month in secs as 31 days
			"aggregSecY" => 604800 //week in secs as 7 days
	);


	$arrWeeksvsDays = array (
			"window-size" => "", //specify as number of weeks
			"selected_window_size" => "", //specify extents based on some interaction
			"aggregSecX" => 604800, //week in secs as 7 days
			"aggregSecY" => 86400 //day in secs as 24 hours
	);


	$arrDaysvsHours = array (
			"window-size" => "", //specify as number of weeks
			"selected_window_size" => "", //specify extents based on some interaction
			"aggregSecX" => 86400, //day in secs as 24 hours
			"aggregSecY" => 21600 //6 hours aggregation
	);


	$arrHoursvsMinutes = array (
			"window-size" => "", //specify as number of weeks
			"selected_window_size" => "", //specify extents based on some interaction
			"aggregSecX" => 3600, //hour in secs
			"aggregSecY" => 900 //15 mins
	);


	unset( $_SESSION["Years_vs_Months"] ); //clear session
	$_SESSION["Years_vs_Months"] = $arrYearvsMonth;

	unset( $_SESSION["Months_vs_Weeks"] ); //clear session
	$_SESSION["Months_vs_Weeks"] = $arrMonthvsWeek;

	unset( $_SESSION["Weeks_vs_Days"] ); //clear session
	$_SESSION["Weeks_vs_Days"] = $arrWeeksvsDays;

	unset( $_SESSION["Days_vs_Hours"] ); //clear session
	$_SESSION["Days_vs_Hours"] = $arrDaysvsHours;

	unset( $_SESSION["Hours_vs_Minutes"] ); //clear session
	$_SESSION["Hours_vs_Minutes"] = $arrHoursvsMinutes;


	unset( $_SESSION["aggregation_list"] ); //clear session
	$_SESSION["aggregation_list"] = array(
			"Years_vs_Months",
			"Months_vs_Weeks",
			"Weeks_vs_Days",
			"Days_vs_Hours",
			"Hours_vs_Minutes"
	);

	$_SESSION["search_term"] = "";

	unset( $_SESSION["type"] ); //clear session
	$_SESSION["type"] = "topic";


}



setDefaultSessionObject();


?>


