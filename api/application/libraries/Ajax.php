<?php if (!defined('BASEPATH')) exit('No direct script access allowed'); 

class Ajax {
	private $CI;
	
	function __construct() {
		$this->CI = &get_instance();
	}

	/**
	 * @param mixed $data
	 * @param int   $error
	 */
	public function output_csrf($data = NULL) {
		$this->output($data, TRUE);
	}

	/**
	 * @param mixed $data
	 * @param int   $error
	 * @param int   $error
	 */
	public function output($data = NULL, $isCrsf = FALSE) {
		$this->CI->output->set_content_type('application/json');
		$result = array();
		if (isset($data)) $result = array_merge($result, $data);
		if (isset($error) && 0 !== $error) $result['error'] = $error;
		
		if (TRUE == $isCrsf) {
			$result['csrf'] = array(
				'name' => $this->CI->security->get_csrf_token_name()
				, 'hash' => $this->CI->security->get_csrf_hash()
			);
		}
		
		$this->CI->output->set_output(json_encode($result));
	}
}