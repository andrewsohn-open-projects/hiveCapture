<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

class HI_Controller extends CI_Controller {
	protected $info = NULL;
	protected $isLoginCheck = FALSE;
	protected $data = array();

	function __construct() {
		parent::__construct();
		$this->data = $this->getCommonInfo();
		
	}

	protected function _header($isDpBody = TRUE) {
		$this->load->view('layout/common/header', $this->data);
		if ($isDpBody) {
			if(file_exists(APPPATH."views/".$this->data['rfcl']."/b_header".EXT)){
				$this->load->view($this->data['rfcl']."/b_header", $this->data);
			}else{
				$this->load->view('layout/common/b_header', $this->data);
			}
		}else{
			$this->load->view('errors/b_header', $this->data);
		}
	}

	protected function _footer($isDpBody = TRUE) {
		if ($isDpBody) {
			$this->load->view('layout/common/b_footer', $this->data);
		}else{
			$this->load->view('errors/b_footer', $this->data);
		}

		$this->load->view('layout/common/footer', $this->data);
	}

	public function getCommonInfo() {
		if (NULL != $this->info) return $this->info;
		$rfcl = $this->router->fetch_class();
		$tcnt = $this->uri->total_segments();
		$lgmt = $this->uri->segment($tcnt, 0);
		
		$this->info = array(
			'title' => config_item('title')
			, 'v' => config_item('version')			
			, 'ast_md' => config_item('asset_mode')
			, 'rfcl' => $rfcl
			, 'rfmt' => $this->router->fetch_method()
			, 'lgmt' => $lgmt
			, 'csrf_name' => $this->security->get_csrf_token_name()
			, 'back_url' => $this->agent->referrer()
		);

		$this->info['device'] = 'pc';
		if($this->agent->is_mobile()) $this->info['device'] = 'm';

		$this->info['ast_url'] = config_item('asset_url');

		return $this->info;
	}

	public function isLoginCheck() {
		return $this->isLoginCheck;
	}
}