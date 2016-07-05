<?php if (!defined('BASEPATH')) exit('No direct script access allowed'); 

class HI_Email extends CI_Email {
	function __construct() {
		parent::__construct();		
	}

	public function getHeaders($type = '') {
		$this->_build_headers();
		return (empty($type) ? $this->_headers : $this->_headers[$type]);
	}

	public function getRawData() {
		if (FALSE !== $this->_build_headers() && FALSE !== $this->_build_message()) {
			return $this->_header_str . '\n' .
					$this->_subject . '\n' .
					$this->_finalbody;
		}
		return '';
	}

	protected function makeNameEmail($emails) {
		$name_email = $this->_str_to_array($emails);
		foreach ($name_email as &$email) {
			if (!preg_match('/(.*)\s+\<(.*)\>/', $email, $match)) {
				continue;	
			}

			$name = $match[1];
			if (!preg_match('/[\200-\377]/', $name)) {
				$name = '"'.addcslashes($name, "\0..\37\177'\"\\").'"';
			} else {
				$name = $this->_prep_q_encoding($name);
			}

			$email = $name . ' <' . $match[2] . '>';
		}

		return $name_email;
	}

	/**
	 * Set Recipients
	 *
	 * @param	string
	 * @return	CI_Email
	 */
	public function to($to) {
		$to = $this->makeNameEmail($to);	
		if ($this->validate) {
			$this->validate_email($to);
		}

		if ($this->_get_protocol() !== 'mail') {
			$this->set_header('To', implode(', ', $to));
		}

		$this->_recipients = $to;
		return $this;
	}

	/**
	 * Set CC
	 *
	 * @param	string
	 * @return	CI_Email
	 */
	public function cc($cc) {
		$cc = $this->_str_to_array($cc);

		if ($this->validate) {
			$this->validate_email($cc);
		}

		$this->set_header('Cc', implode(', ', $cc));
		if ($this->_get_protocol() === 'smtp') {
			$this->_cc_array = $cc;
		}

		return $this;
	}

	// --------------------------------------------------------------------

	/**
	 * Set BCC
	 *
	 * @param	string
	 * @param	string
	 * @return	CI_Email
	 */
	public function bcc($bcc, $limit = '')
	{
		if ($limit !== '' && is_numeric($limit)) {
			$this->bcc_batch_mode = TRUE;
			$this->bcc_batch_size = $limit;
		}

		$bcc = $this->_str_to_array($bcc);

		if ($this->validate) {
			$this->validate_email($bcc);
		}

		if ($this->_get_protocol() === 'smtp' OR ($this->bcc_batch_mode && count($bcc) > $this->bcc_batch_size)) {
			$this->_bcc_array = $bcc;
		} else {
			$this->set_header('Bcc', implode(', ', $bcc));
		}

		return $this;
	}


	/**
	 * Send SMTP command
	 *
	 * @param	string
	 * @param	string
	 * @return	string
	 */
	protected function _send_command($cmd, $data = '') {
		switch ($cmd)
		{
			case 'hello' :

						if ($this->_smtp_auth OR $this->_get_encoding() === '8bit')
						{
							$this->_send_data('EHLO '.$this->_get_hostname());
						}
						else
						{
							$this->_send_data('HELO '.$this->_get_hostname());
						}

						$resp = 250;
			break;
			case 'starttls'	:

						$this->_send_data('STARTTLS');
						$resp = 220;
			break;
			case 'from' :

						$this->_send_data('MAIL FROM:<'.$data.'>');
						$resp = 250;
			break;
			case 'to' :

						if ($this->dsn)
						{
							$this->_send_data('RCPT TO:<'.$data.'> NOTIFY=SUCCESS,DELAY,FAILURE ORCPT=rfc822;'.$data);
						}
						else
						{
							$this->_send_data('RCPT TO:'.$data.'');
						}

						$resp = 250;
			break;
			case 'data'	:

						$this->_send_data('DATA');
						$resp = 354;
			break;
			case 'reset':

						$this->_send_data('RSET');
						$resp = 250;
			break;
			case 'quit'	:

						$this->_send_data('QUIT');
						$resp = 221;
			break;
		}

		$reply = $this->_get_smtp_data();

		$this->_debug_msg[] = '<pre>'.$cmd.': '.$reply.'</pre>';

		if ((int) substr($reply, 0, 3) !== $resp)
		{
			$this->_set_error_message('lang:email_smtp_error', $reply);
			return FALSE;
		}

		if ($cmd === 'quit')
		{
			fclose($this->_smtp_connect);
		}

		return TRUE;
	}	
}