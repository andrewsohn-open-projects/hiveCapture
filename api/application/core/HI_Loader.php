<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

class HI_Loader extends CI_Loader {
	function __construct() {
		parent::__construct();
	}

	/**
	 * Template 
	 *
	 * @param	string	$path	File path
	 * @param	array	$vars	An associative array of data
	 *				to be extracted for use in the view
	 * @param	bool	$return	Whether to return the file output
	 * @return	object|string
	 */
	public function template($path, $vars = array(), $return = FALSE) {
		return $this->_ci_load(array('_ci_path' => $path, '_ci_vars' => $this->_ci_object_to_array($vars), '_ci_return' => $return));
	}
}	

