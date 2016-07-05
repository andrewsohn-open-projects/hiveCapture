<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

if( !function_exists('ceiling')) {
    function ceiling($number, $significance = 1) {
        return ( is_numeric($number) && is_numeric($significance) ) ? (ceil($number/$significance)*$significance) : false;
    }
}

if (!function_exists('make_dir')) {
	function make_dir($path, $permissions = 0755) {
		if (!file_exists($path)) {
			mkdir($path, $permissions, TRUE);
		}
	}
}

if (!function_exists('get_gap_days')) {
	function get_gap_days($e_dt, $s_dt = '') {
		if (empty($s_dt)) $s_dt = date('Y-m-d');
		$dff_days = date_diff(date_create($s_dt), date_create($e_dt))->format('%r%a');
		return $dff_days;
	}
}

if (!function_exists('remove_empty_array')) {
	function remove_empty_array($value) {
		return !empty($value);
	}
}

if (!function_exists('strip_tags_content')) {
	function strip_tags_content($text, $tags = '', $invert = FALSE) { 

	  preg_match_all('/<(.+?)[\s]*\/?[\s]*>/si', trim($tags), $tags); 
	  $tags = array_unique($tags[1]); 
	    
	  if(is_array($tags) AND count($tags) > 0) { 
	    if($invert == FALSE) { 
	      return preg_replace('@<(?!(?:'. implode('|', $tags) .')\b)(\w+)\b.*?>.*?</\1>@si', '', $text); 
	    } 
	    else { 
	      return preg_replace('@<('. implode('|', $tags) .')\b.*?>.*?</\1>@si', '', $text); 
	    } 
	  } 
	  elseif($invert == FALSE) { 
	    return preg_replace('@<(\w+)\b.*?>.*?</\1>@si', '', $text); 
	  } 
	  return $text; 
	}
}

if (!function_exists('pure_content')) {
	function pure_content($contents)
	{
		if(!$contents)
	        return false;

	    $contents = preg_replace('/&lt;iframe.*?\/iframe&gt;/i','', $contents);
	    $contents = preg_replace('/&lt;*?\/p&gt;/i','', $contents);
	    $contents = preg_replace('/&lt;br&gt;/i','', $contents);
	    $contents = preg_replace('/&lt;p&gt;/i','', $contents);
	    $contents = preg_replace('/&lt;a.*?\&gt;/i','', $contents);
	    $contents = preg_replace('/&lt;\/a&gt;/i','', $contents);
	    $contents = strip_tags($contents);
	    $contents = htmlspecialchars($contents);
	    return $contents;
	}
}

if (!function_exists('conv_link_content')) {
	function conv_link_content($contents)
	{
		$contents = preg_replace('![_a-z0-9-]+(.[_a-z0-9-]+)*@[a-z0-9-]+(.[a-z0-9-]+)+!', "<a href=\"mailto:\\0\">\\0</a>",$contents);
		$contents = preg_replace('!(http|ftp|scp)(s)?:\/\/[a-zA-Z0-9.?&_/]+!', "<a href=\"\\0\">\\0</a>",$contents);
		
		return nl2br($contents);
	}
}

if (!function_exists('diffSeconds')) {
	function diffSeconds($end, $start) {
	    $end = isset($end) ? $end : date('Y-m-d H:i:s');
	    $start = isset($start) ? $start : date('Y-m-d H:i:s');
	    return strtotime($end) - strtotime($start);
	}
}