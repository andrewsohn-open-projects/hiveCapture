<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

if (!function_exists('fe_set_class')) {
	function fe_set_class($src, $dist, $clazz = 'on') {
		return fe_is_equal_class($src, $dist, $clazz);
	}
}

if (!function_exists('fe_is_equal_class')) {
	function fe_is_equal_class($src, $dist, $clazz = 'on') {
		return ($src == $dist ? $clazz : '');
	}
}

if (!function_exists('fe_script')) {
	function fe_script($script = '', $jQuery = FALSE) {
		return fe_open_script() .
			($jQuery ? "\n(function($, win) {\n
				'use strict';
				\t$(function() {\n
			" : '') .
			$script .
			($jQuery ? "
				\t});
			\n})(jQuery, window)\n" : '') .
			fe_close_script();
	}
}

if (!function_exists('fe_script_location')) {
	function fe_script_location($script = '', $location = '') {
		if ('' !== $location) {
			$script .= "\n
				window.location.href = '" .  str_replace('&amp;', '&', $location) . "';
			";
		}

		return fe_script($script);
	}
}

if (!function_exists('fe_open_script')) {
	function fe_open_script() {
		return $_script = "\n<script>\n";
	}
}

if (!function_exists('fe_close_script')) {
	function fe_close_script() {
		return $_script = "\n</script>\n";
	}
}

if (!function_exists('fe_alert')) {
	function fe_alert($msg = '', $url = '') {
		if (!$msg) $msg = '올바른 방법으로 이용해 주십시오.';
		$msg2 = str_replace("\\n", "<br>", $msg);
		if (!$url) {
			$url = get_instance()->agent->referrer();
		}
			
		$str = '<script>';
		$str .= 'alert("' . strip_tags($msg) . '");';
		if ($url) {
			$str .= 'document.location.replace("' . str_replace('&amp;', '&', $url) . '");';
		} else {
			$str .= 'history.back();';
		}

		$str .= '</script>';
		echo $str;
	}
}

if (!function_exists('fe_get_checked')) {
	function fe_get_checked($field, $value) {
		return ($field == $value ? ' checked="checked"' : '');
	}
}

if (!function_exists('fe_print_checked')) {
	function fe_print_checked($field, $value) {
		echo fe_get_checked($field, $value);
	}
}

if (!function_exists('fe_get_selected')) {
	function fe_get_selected($field, $value) {
		return ($field == $value ? ' selected="selected"' : '');
	}
}

if (!function_exists('fe_get_class_selected')) {
	function fe_get_class_selected($field, $value) {
		return ($field == $value ? ' class="selected"' : '');
	}
}

if (!function_exists('fe_print_selected')) {
	function fe_print_selected($field, $value, $mode=1) {
		echo ($mode === 1)? fe_get_selected($field, $value):fe_get_class_selected($field, $value);
	}
}

if (!function_exists('fe_text_shortener')) {
	function fe_text_shortener($text, $limit=160) {
		$str = strip_tags($text);
		$len = mb_strlen($str);
		if ($limit <= $len) {
			$str = mb_substr($str, 0, $limit) . '...';
		}

		echo $str;
	}
}

if (!function_exists('fe_print_detail_link')) {
	function fe_print_detail_link($spot, $text) {
		$ele = '<a href="';
		$href = FALSE;
		$target = '_blank';
		// $target = '_self';
		if(isset($spot->detaile_url) && $spot->detaile_url){
			$href = $spot->detaile_url;
		} else if(isset($spot->etc_url) && $spot->etc_url){
			$href = $spot->etc_url;
		}

		if($href == FALSE) return;
		$ele .= $href.'" class="go_hp" target="'.$target.'">'.$text.'</a>';
		echo $ele;
	}
}