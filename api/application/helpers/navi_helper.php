<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

require APPPATH . 'libraries/sgal/autoload.php';
use Sgal\Constants;

/*
* 네비게이션 출력 API
*/
if (!function_exists('navi_get_navi')) {
	function navi_get_navi($rfcl, $rfmt, $clazz = 'now') {
		$glue = '<span class="sp ico_arr">&gt;</span>';
		$str = '<div class="loc"><a href="'.site_url().'" class="loc_link"><span class="sp">home</span></a>';
		if($rfcl){
			$rfcl_cl = '';
			if($rfmt == 'index') $rfcl_cl = $clazz;

			$key = Constants::MENU_CODE.strtoupper($rfcl);
			if(!defined('Constants::class::'.$key)){
				$title = constant(Constants::class.'::'.$key);
				$str .= $glue. '<span class="'.$rfcl_cl.'">'.$title.'</span>';
			}else{
				throw new Exception('constants not exists.');
			}
			
			if($rfmt != 'index'){
				$rfmt_cl = $clazz;

				$key = Constants::MENU_CODE.strtoupper($rfcl).'_'.strtoupper($rfmt);

				if(!defined('Constants::class::'.$key)){
					$title = constant(Constants::class.'::'.$key);
					$str .= $glue. '<span class="'.$rfmt_cl.'">'.$title.'</span>';
				}else{
					throw new Exception('constants not exists.');
				}
			}			
		}
		
		$str .= '</div>';
		return $str;
	}
}

if (!function_exists('navi_print_navi')) {
	function navi_print_navi($rfcl, $rfmt) {
		echo navi_get_navi($rfcl, $rfmt);
	}
}

