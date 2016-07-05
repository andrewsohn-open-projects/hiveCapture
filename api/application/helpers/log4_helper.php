<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

if (!function_exists('log_trace')) {
	function log_trace($message) {
		static $_log;		
		if (NULL === $_log) $_log =& load_class('Log');
		$_log->write_log('trace', $message);
	}
}

if (!function_exists('log_debug')) {
	function log_debug($message) {
		static $_log;		
		if (NULL === $_log) $_log =& load_class('Log');		
		$_log->write_log('debug', $message);
	}
}

if (!function_exists('log_info')) {
	function log_info($message) {
		static $_log;
		if (NULL === $_log) $_log =& load_class('Log');
		$_log->write_log('info', $message, false);
	}
}

if (!function_exists('log_warn')) {
	function log_warn($message) {
		static $_log;
		if (NULL === $_log) $_log =& load_class('Log');
		$_log->write_log('warn', $message, false);
	}
}

if (!function_exists('log_error')) {
	function log_error($message) {
		static $_log;
		if (NULL === $_log) $_log =& load_class('Log');
		$_log->write_log('error', $message, false);
	}
}

if (!function_exists('log_fatal')) {
	function log_fatal($message) {
		static $_log;
		if (NULL === $_log) $_log =& load_class('Log');
		$_log->write_log('fatal', $message, false);
	}
}