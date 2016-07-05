<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * @see http://logging.apache.org/log4php/
 * @see https://github.com/fukata/ci-log4php
 */
require_once APPPATH . 'third_party/log4php/Logger.php';

class HI_Log extends CI_Log {
	protected $logger;
	protected $initialized = FALSE;

	/**
	 * @see http://logging.apache.org/log4php/docs/introduction.html
	 */
	protected $_levels = array(
		'OFF' => 0, 'FATAL' => 1, 'ERROR' => 2, 'WARN' => 3, 'INFO' => 4, 'DEBUG' => 5, 'TRACE' => 6
	);

	function __construct() {
		parent::__construct();		
		$this->_initialize();
	}

	private function _initialize() {
		if (TRUE === $this->initialized) return;

		$this->initialized = TRUE;
		$config =& get_config();
		$level = array_search($this->_threshold, $this->_levels);
		$config['log4']['rootLogger']['level'] = strtolower($level);
		if (!isset($level)) {
			$config['log4']['rootLogger']['level'] = 'OFF';
		}
		
		Logger::configure($config['log4']);
		$this->logger = Logger::getRootLogger();
	}

	public function write_log($level = 'error', $msg) {
		if (FALSE === $this->_enabled) return FALSE;

		$level = strtoupper($level);
		if (!isset($this->_levels[$level]) OR ($this->_levels[$level] > $this->_threshold)) {			
			return FALSE;
		}

		if ('TRACE' === $level) $this->logger->trace($msg);
		if ('DEBUG' === $level) $this->logger->debug($msg);
		if ('INFO' === $level) 	$this->logger->info($msg);
		if ('WARN' === $level) 	$this->logger->warn($msg);
		if ('ERROR' === $level) $this->logger->error($msg);
		if ('FATAL' === $level) $this->logger->fatal($msg);

		return TRUE;
	}
}