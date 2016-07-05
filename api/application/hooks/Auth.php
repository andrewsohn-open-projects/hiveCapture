<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

class Auth {
	private $CI;
	
	function __construct() {
		$this->CI = &get_instance();
	}

	/**
	 * SNS 정보 업데이트 + 블랙리스트 처리
	 */
	public function index() {
		// $isLogin = $this->user->isLogined();
		// $celeb_user_info = $this->CI->session->userdata(Constants::SESSION_USER_INFO);

		// if ($this->CI->isLoginCheck()) {
		// 	$this->user->getAuthUserFromLogined();
		// 	if (!$this->user->isLogined()) {
		// 		echo fe_script_location('alert("로그인 후 이용 가능합니다.");', site_url());
		// 		exit;
		// 	}			
		// }

		// // 로그인이 아니거나 세션이 있는 경우
		// if (Constants::AFTER_LOGIN !== $isLogin || isset($celeb_user_info)) {
		// 	if (Constants::AFTER_LOGIN !== $isLogin) { // 로그인이 아니면 세션 날림
		// 		$this->CI->session->unset_userdata(Constants::SESSION_USER_INFO);
		// 	}

		// 	return;
		// }
	}
}


