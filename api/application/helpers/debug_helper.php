<?php if (!defined('BASEPATH')) exit('No direct script access allowed');
if (!function_exists('beauty_print_r')) {
	define('TAG_LINE_BREAK', '<br/>');

	function beauty_print_r($var = '') {
		$str = print_r($var, TRUE);
		$str = preg_replace('/\n+/', TAG_LINE_BREAK, $str);
		// $str = str_replace(' ', '&nbsp;', $str);
		echo nl2br("<span style='font-family:Tahoma, 굴림; font-size:9pt;'>$str</span>");
	}
}
