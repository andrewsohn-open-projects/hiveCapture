<?php
class Categories extends CI_Model{
	function __construct(){
		parent::__construct();
	}

	/**
	 * 카테고리 리스트 
	 */
	public function getList(){  

		$sql = "select cat_no
					, cat_nm
					, cat_type_nm
					, del_yn
					, ins_dt
					, upd_dt
				from cat_mst
				where 1=1
				and del_yn = 'N'
				order by ins_dt " ;

		return $this->db->query($sql)->result();
	}

}