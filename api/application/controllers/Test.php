<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require FCPATH . 'vendor/autoload.php';
use JonnyW\PhantomJs\Client;

class Test extends HI_Controller {
	function __construct() {
		parent::__construct();
		
	}

	public function index() {
		$client = Client::getInstance();
		
		$client->getEngine()->setPath('/home/usftp/www/samsung/bin/phantomjs');
		
		$width  = 800;
		$height = 600;
		$top    = 0;
		$left   = 0;
		
		$request = $client->getMessageFactory()->createCaptureRequest('http://www.naver.com', 'GET');
		
		$request->setViewportSize($width, $height);
		//    $request->setCaptureDimensions($width, $height, $top, $left);
		$request->setOutputFile('/home/usftp/www/samsung/data/test.jpg');
		$response = $client->getMessageFactory()->createResponse();
		//print_r($response);
		//print_r($request);
		
		// Send the request
		$client->send($request, $response);
	}
}
