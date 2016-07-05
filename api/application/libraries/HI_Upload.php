<?php if (!defined('BASEPATH')) exit('No direct script access allowed'); 

class HI_Upload extends CI_Upload {
	protected $_multi_upload_data = array();
	protected $_keys = array('name', 'type', 'tmp_name', 'error', 'size');

	function __construct($config = array()) {
		parent::__construct($config);
	}

	public function multi_data() {
		return $this->_multi_upload_data;
	}

	protected function set_multi_data() {
		$this->_multi_upload_data[] = array(
			'file_name'		=> $this->file_name,
			'file_type'		=> $this->file_type,
			'file_path'		=> $this->upload_path,
			'full_path'		=> $this->upload_path.$this->file_name,
			'raw_name'		=> str_replace($this->file_ext, '', $this->file_name),
			'orig_name'		=> $this->orig_name,
			'client_name'	=> $this->client_name,
			'file_ext'		=> $this->file_ext,
			'file_size'		=> $this->file_size,
			'is_image'		=> $this->is_image(),
			'image_width'		=> $this->image_width,
			'image_height'		=> $this->image_height,
			'image_type'		=> $this->image_type,
			'image_size_str'	=> $this->image_size_str
		);
	}

	protected function _do_upload($_file) {
		if ( ! isset($_file))
		{
			$this->set_error('upload_no_file_selected');
			return FALSE;
		}

		// Is the upload path valid?
		if ( ! $this->validate_upload_path())
		{
			// errors will already be set by validate_upload_path() so just return FALSE
			return FALSE;
		}

		// Was the file able to be uploaded? If not, determine the reason why.
		if ( ! is_uploaded_file($_file['tmp_name']))
		{
			$error = isset($_file['error']) ? $_file['error'] : 4;

			switch ($error)
			{
				case UPLOAD_ERR_INI_SIZE:
					$this->set_error('upload_file_exceeds_limit');
					break;
				case UPLOAD_ERR_FORM_SIZE:
					$this->set_error('upload_file_exceeds_form_limit');
					break;
				case UPLOAD_ERR_PARTIAL:
					$this->set_error('upload_file_partial');
					break;
				case UPLOAD_ERR_NO_FILE:
					$this->set_error('upload_no_file_selected');
					break;
				case UPLOAD_ERR_NO_TMP_DIR:
					$this->set_error('upload_no_temp_directory');
					break;
				case UPLOAD_ERR_CANT_WRITE:
					$this->set_error('upload_unable_to_write_file');
					break;
				case UPLOAD_ERR_EXTENSION:
					$this->set_error('upload_stopped_by_extension');
					break;
				default:
					$this->set_error('upload_no_file_selected');
					break;
			}

			return FALSE;
		}

		// Set the uploaded data as class variables
		$this->file_temp = $_file['tmp_name'];
		$this->file_size = $_file['size'];

		// Skip MIME type detection?
		if ($this->detect_mime !== FALSE)
		{
			$this->_file_mime_type($_file);
		}

		$this->file_type = preg_replace('/^(.+?);.*$/', '\\1', $this->file_type);
		$this->file_type = strtolower(trim(stripslashes($this->file_type), '"'));
		$this->file_name = $this->_prep_filename($_file['name']);
		$this->file_ext	 = $this->get_extension($this->file_name);
		$this->client_name = $this->file_name;

		// Is the file type allowed to be uploaded?
		if ( ! $this->is_allowed_filetype())
		{
			$this->set_error('upload_invalid_filetype');
			return FALSE;
		}

		// if we're overriding, let's now make sure the new name and type is allowed
		if ($this->_file_name_override !== '')
		{
			$this->file_name = $this->_prep_filename($this->_file_name_override);

			// If no extension was provided in the file_name config item, use the uploaded one
			if (strpos($this->_file_name_override, '.') === FALSE)
			{
				$this->file_name .= $this->file_ext;
			}
			else
			{
				// An extension was provided, let's have it!
				$this->file_ext	= $this->get_extension($this->_file_name_override);
			}

			if ( ! $this->is_allowed_filetype(TRUE))
			{
				$this->set_error('upload_invalid_filetype');
				return FALSE;
			}
		}

		// Convert the file size to kilobytes
		if ($this->file_size > 0)
		{
			$this->file_size = round($this->file_size/1024, 2);
		}

		// Is the file size within the allowed maximum?
		if ( ! $this->is_allowed_filesize())
		{
			$this->set_error('upload_invalid_filesize');
			return FALSE;
		}

		// Are the image dimensions within the allowed size?
		// Note: This can fail if the server has an open_basedir restriction.
		if ( ! $this->is_allowed_dimensions())
		{
			$this->set_error('upload_invalid_dimensions');
			return FALSE;
		}

		// Sanitize the file name for security
		$this->file_name = $this->_CI->security->sanitize_filename($this->file_name);

		// Truncate the file name if it's too long
		if ($this->max_filename > 0)
		{
			$this->file_name = $this->limit_filename_length($this->file_name, $this->max_filename);
		}

		// Remove white spaces in the name
		if ($this->remove_spaces === TRUE)
		{
			$this->file_name = preg_replace('/\s+/', '_', $this->file_name);
		}

		/*
		 * Validate the file name
		 * This function appends an number onto the end of
		 * the file if one with the same name already exists.
		 * If it returns false there was a problem.
		 */
		$this->orig_name = $this->file_name;

		if ($this->overwrite === FALSE)
		{
			$this->file_name = $this->set_filename($this->upload_path, $this->file_name);

			if ($this->file_name === FALSE)
			{
				return FALSE;
			}
		}

		/*
		 * Run the file through the XSS hacking filter
		 * This helps prevent malicious code from being
		 * embedded within a file. Scripts can easily
		 * be disguised as images or other file types.
		 */
		if ($this->xss_clean && $this->do_xss_clean() === FALSE)
		{
			$this->set_error('upload_unable_to_write_file');
			return FALSE;
		}

		/*
		 * Move the file to the final destination
		 * To deal with different server configurations
		 * we'll attempt to use copy() first. If that fails
		 * we'll use move_uploaded_file(). One of the two should
		 * reliably work in most environments
		 */
		if ( ! @copy($this->file_temp, $this->upload_path.$this->file_name))
		{
			if ( ! @move_uploaded_file($this->file_temp, $this->upload_path.$this->file_name))
			{
				$this->set_error('upload_destination_error');
				return FALSE;
			}
		}

		/*
		 * Set the finalized image dimensions
		 * This sets the image width/height (assuming the
		 * file was an image). We use this information
		 * in the "data" function.
		 */
		$this->set_image_properties($this->upload_path.$this->file_name);
		return TRUE;
	}

	public function do_multi_upload($field, $isCheck = TRUE) {
		//Clear multi_upload_data.
		$this->_multi_upload_data = array();		
		if (!isset($_FILES[$field])) {
			return FALSE;
		}
		
		if (!is_array($_FILES[$field]['name'])) {
			$success = $this->do_upload($field);
			if ($success) {
				$this->set_multi_data();
			}
		}

		// Is the upload path valid?
		if (!$this->validate_upload_path()) {
			// errors will already be set by validate_upload_path() so just return FALSE
			return FALSE;
		}

		foreach ($_FILES[$field]['name'] as $i => $v) {
			$_file = array();

			foreach ($this->_keys as $key) {
				$_file[$key] = $_FILES[$field][$key][$i];				
			}

			if (!$this->_do_upload($_file)) {
				$this->file_name = '';
			}

			$this->set_multi_data();
		}
		
		//Return all file upload data.
		return TRUE;
	}
}