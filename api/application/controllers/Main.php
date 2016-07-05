<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Main extends HI_Controller {
	function __construct() {
		parent::__construct();
	}

	public function index() {
		$data = $this->data;
		$this->_header();

		$view = 'main/entry';
		$this->load->view($view, $data);
		$this->_footer();
	}
}
