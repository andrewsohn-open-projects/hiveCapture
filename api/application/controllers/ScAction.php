<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require APPPATH . 'libraries/vendor/autoload.php';
use JonnyW\PhantomJs\Client;

class ScAction extends HI_Controller {
	function __construct() {
		parent::__construct();
		$this->load->helper('string');
		$this->load->library('uuid');
		$this->load->helper('download');
		$this->load->helper('directory');
		$this->load->helper("file");
	}

	public function index() {
		$cache_life = 60; //caching time, in seconds

// 		$url_arr_st = '';
// 		if(isset($_REQUEST['urls'])&& $_REQUEST['urls']!=''){
// 			$url_arr_st = $_REQUEST['urls'];	
// 		}

// 		$url_arr = explode(',', $url_arr_st);
		$v = '';
		if(isset($_REQUEST['url'])&& $_REQUEST['url']!=''){
			$v = $_REQUEST['url'];
		}
		
		$here = FCPATH. DIRECTORY_SEPARATOR;
		$bin_files = $here . 'bin' . DIRECTORY_SEPARATOR;
  		$data_files = $here . 'data' . DIRECTORY_SEPARATOR;
  		$img_url = config_item('upload_url') . DIRECTORY_SEPARATOR;
  		
  		$w = 1024;
		$h = 768;

		if (isset($_REQUEST['w'])) {
	      $w = intval($_REQUEST['w']);
	    }

		if (isset($_REQUEST['h'])) {
			$h = intval($_REQUEST['h']);
		}

		if (isset($_REQUEST['clipw'])) {
			$clipw = intval($_REQUEST['clipw']);
		}

		if (isset($_REQUEST['cliph'])) {
			$cliph = intval($_REQUEST['cliph']);
		}


// 		foreach($url_arr as $k=>$v){
// 		$v = 'http://www.samsung.com/uk';
			$url_segs = parse_url($v);
			if (!isset($url_segs['host'])) {
				exit();
			}

// 			$ch = curl_init();

// 		    curl_setopt($ch, CURLOPT_URL, $v);
// 		    curl_setopt($ch, CURLOPT_NOBODY, 1);
// 		    curl_setopt($ch, CURLOPT_FAILONERROR, 1);
// 		    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
// 		    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
// 		    if(curl_exec($ch) != FALSE){
		    	$v = strip_tags($v);
			    $v = str_replace(';', '', $v);
			    $v = str_replace('"', '', $v);
			    $v = str_replace('\'', '/', $v);
				$v = str_replace('<?', '', $v);
				$v = str_replace('<?', '', $v);
				$v = str_replace('\077', ' ', $v);

				$screen_file = $data_files . $url_segs['host'] . crc32($v) . '_' . $w . '_' . $h . '.jpg';
				$img_url .= $url_segs['host'] . crc32($v) . '_' . $w . '_' . $h . '.jpg'; 
				$client = Client::getInstance();
				$client->getEngine()->setPath($bin_files.'phantomjs');
				$request = $client->getMessageFactory()->createCaptureRequest($v, 'GET');
				$request->setViewportSize($w, $h);
				$request->setOutputFile($screen_file);
// 				$request->setOutputFile('/home/usftp/www/samsung/data/test.jpg');
				$response = $client->getMessageFactory()->createResponse();
				$client->send($request, $response);
				
// 		    }
		    
// 		}
		$this->ajax->output_csrf(array('data' => array( 'url' => $img_url, 'status' => true)));
		
	}
	
	public function chromeEx() {
		$cache_life = 60; //caching time, in seconds
		
		$v = '';
		if(isset($_REQUEST['url'])&& $_REQUEST['url']!=''){
			$v = $_REQUEST['url'];
		}
		
		$prefix = '';
		if(isset($_REQUEST['prefix'])&& $_REQUEST['prefix']!=''){
			$prefix = $_REQUEST['prefix'];
		}
		
		$order = '';
		if(isset($_REQUEST['order'])&& $_REQUEST['order']!=''){
			$order = intval($_REQUEST['order'])+1;
		}
		
		$here = FCPATH;
		$bin_files = $here . 'bin' . DIRECTORY_SEPARATOR;
		$data_files = $here . 'data' . DIRECTORY_SEPARATOR;
		
		
		if(isset($_REQUEST['uuid'])&& $_REQUEST['uuid']!=''){
			$folder_name = $_REQUEST['uuid'];
		}else{
			$folder_name = random_string('alnum', 16);
		}
		
		if (!file_exists($data_files.$folder_name)) make_dir($data_files.$folder_name);
		
		$img_url = config_item('upload_url') . DIRECTORY_SEPARATOR . $folder_name . DIRECTORY_SEPARATOR;
		
		$w = 1024;
		$h = 768;
		
		if (isset($_REQUEST['w'])) {
			$w = intval($_REQUEST['w']);
		}
		
		if (isset($_REQUEST['h'])) {
			$h = intval($_REQUEST['h']);
		}
		
		if (isset($_REQUEST['clipw'])) {
			$clipw = intval($_REQUEST['clipw']);
		}
		
		if (isset($_REQUEST['cliph'])) {
			$cliph = intval($_REQUEST['cliph']);
		}
		
		
		$v = strip_tags($v);
		$v = str_replace(';', '', $v);
		$v = str_replace('"', '', $v);
		$v = str_replace('\'', '/', $v);
		$v = str_replace('<?', '', $v);
		$v = str_replace('<?', '', $v);
		$v = str_replace('\077', ' ', $v);
		
// 		$img_name = random_string('alnum', 16);
		 
		$disallowed = array('http://', 'https://');
		foreach($disallowed as $d) {
			if(strpos($v, $d) === 0) {
				 $domain_name = str_replace($d, '', $v);
			}
		}
		
		$domain_name = str_replace('/', '_', $domain_name);
		$img_name = $prefix . '_' . $order . '_' . $domain_name;
		
// 		$screen_file = $data_files .$folder_name. DIRECTORY_SEPARATOR . $img_name  . '_' . $w . '_' . $h . '.jpg';
		$screen_file = $data_files .$folder_name. DIRECTORY_SEPARATOR . $img_name  . '.jpg';
		$img_url .= $img_name . '.jpg';
// 		echo '{"screen_file":"'.$screen_file .'", "img_url" : "'.$img_url.'"}';
		$client = Client::getInstance();

        $client->getEngine()->setPath($bin_files.'phantomjs');
        $request = $client->getMessageFactory()->createCaptureRequest($v, 'GET');
        $request->setViewportSize($w, $h);
        $request->setOutputFile($screen_file);
        $response = $client->getMessageFactory()->createResponse();

//$client->isLazy();
//$client->getEngine()->setPath($bin_files.'phantomjs');
//$request  = $client->getMessageFactory()->createCaptureRequest();
//$response = $client->getMessageFactory()->createResponse();

//$request->setMethod('GET');
//$request->setUrl($v);
//$request->setTimeout(8000);


        $client->send($request, $response);
		
// 		$this->ajax->output_csrf(array('data' => array( 'url' => $img_url, 'status' => true)));
		echo '{"data":{"url":"'.$img_url.'","status":true}}';
	}
	
	public function getUuid() {
		$this->ajax->output_csrf(array('data' => array( 'uuid' => random_string('alnum', 16))));
	}
	
	public function getImageList() {
		$uuid = '';
		if(isset($_REQUEST['uuid'])&& $_REQUEST['uuid']!=''){
			$uuid = $_REQUEST['uuid'];
		}
		
		$dir = './data' . DIRECTORY_SEPARATOR . $uuid;
		$map = directory_map($dir,1);
		$imgs = array();
		
		foreach($map as $k=>$v){
			$imgs[$k] = array(
				"no" => $k,
				"name" => $v,
				"url" => site_url().'/data/'.$uuid.'/'.$v
			);
		}
		$this->ajax->output_csrf(array('data' => array( 'imgList' => $imgs, 'status' => true)));
	}
	
	public function procZip() {
		$uuid = '';
		if(isset($_REQUEST['uuid'])&& $_REQUEST['uuid']!=''){
			$uuid = $_REQUEST['uuid'];
		}
	
		// 압축할 디렉토리
		$dir = FCPATH. 'data' . DIRECTORY_SEPARATOR . $uuid;
		
		// 압축파일 경로 + 이름
		$zipfile = FCPATH. 'data' . DIRECTORY_SEPARATOR . $uuid.".zip";
		
		$zip = new ZipArchive;
		$res = $zip->open($zipfile, ZipArchive::CREATE);
		
		if ($res === TRUE) {
			$this->dirZip($zip,$dir);
			$zip->close();
			
			delete_files($dir, true);
			
// 			$zip_url = site_url('scAction/getDownloadZip');
			$zip_url = site_url().'/data/'.$uuid.'.zip';
			
			$this->ajax->output_csrf(array('data' => array( 'zipUrl' => $zip_url, 'status' => true)));
		} else {
			$this->ajax->output_csrf(array('data' => array('status' => false)));
		}
	}
	
	public function getDownloadZip() {
		$uuid = '';
		if(isset($_REQUEST['uuid'])&& $_REQUEST['uuid']!=''){
			$uuid = $_REQUEST['uuid'];
		}
		
		$data = file_get_contents(FCPATH. 'data' . DIRECTORY_SEPARATOR . $uuid.".zip");
		$name = $uuid.'_'.date("Y-m-d").".zip";
		
		force_download($name, $data);
	}
	
	public function getDownloadImg() {
		$uuid = '';
		if(isset($_REQUEST['uuid'])&& $_REQUEST['uuid']!=''){
			$uuid = $_REQUEST['uuid'];
		}
		
		$img = '';
		if(isset($_REQUEST['img'])&& $_REQUEST['img']!=''){
			$img = $_REQUEST['img'];
		}
	
		$data = file_get_contents(FCPATH. 'data' . DIRECTORY_SEPARATOR . $uuid . DIRECTORY_SEPARATOR . $img);
	
		force_download($img, $data);
	}
	
	public function deleteAll() {
		$uuid = '';
		if(isset($_REQUEST['uuid'])&& $_REQUEST['uuid']!=''){
			$uuid = $_REQUEST['uuid'];
		}
		
		// 압축할 디렉토리
		$dir = FCPATH. 'data' . DIRECTORY_SEPARATOR . $uuid;
		$zipfile = FCPATH. 'data' . DIRECTORY_SEPARATOR . $uuid.".zip";
		
		if (file_exists($dir)){
			delete_files($dir, true);
			rmdir($dir);
		}
		if (file_exists($zipfile)){
			unlink($zipfile);
		}
		
		$this->ajax->output_csrf(array('data' => array('status' => true)));
	}
	
	private function dirZip($resource,$dir) {
		if(filetype($dir) === 'dir') {
			clearstatcache();
	
			if($fp = @opendir($dir)) {
				while(false !== ($ftmp = readdir($fp))){
					if(($ftmp !== ".") && ($ftmp !== "..") && ($ftmp !== "")){
						if(filetype($dir.'/'.$ftmp) != 'dir') $resource->addFile($dir.'/'.$ftmp, $ftmp);
					}
				}
			}
			
			if(is_resource($fp)){
				closedir($fp);
			}
		}
	}
}
