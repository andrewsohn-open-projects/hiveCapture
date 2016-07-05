<?php if (!defined('BASEPATH')) exit('No direct script access allowed'); 

class HI_Parser extends CI_Parser {
	function __construct() {
		parent::__construct();		
	}

	/**
	 * Parse a template
	 *
	 * @param	string $path	File path
	 * @param	array
	 * @param	bool
	 * @return	string
	 */
	public function template($path, $data, $return = FALSE) {
		$template = $this->CI->load->template($path, $data, TRUE);
		return $this->_parse($template, $data, $return);
	}
}