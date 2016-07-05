<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

// 게시글보기 썸네일 생성
if (!function_exists('th_get_view')) {
	function th_get_view($contents, $device='pc', $view=true)
	{
		if(!$contents)
	        return false;

	    $contents = str_replace("&lt;", "<", $contents);
	    $contents = str_replace("&gt;", ">", $contents);

	    // $contents 중 img 태그 추출
	    if('m' == $device){
	    	// if ($view)
		    //     $pattern = "/<[]img([^>]*)>/iS";
		    // else
		    //     $pattern = "/<img[^>]*src=[\'\"]?([^>\'\"]+[^>\'\"]+)[\'\"]?[^>]*>/i";
		    // preg_match_all($pattern, $contents, $matchs);

		    // // echo $device;
		    // var_dump($matchs[0]);
		    // echo ;
		    $contents = preg_replace('/width\=(\'|\")?[0-9]+(\'|\")?/i', 'width="100%"', $contents);
	    }

	    return $contents;
	}
}

