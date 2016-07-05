<?php
class Banners extends CI_Model{
	function __construct(){
		parent::__construct();
	}
	

	/**
	 * 메인 하단 배너 리스트 
	 */
	public function getBannerList($pos_arr = array(), $limit_cnt=3){  
		$arr = array();
		$str = '('.implode(',', $pos_arr).')';

		$sql =" select 
					a.ban_no
					, a.ban_nm
					, a.pos_no
					, b.code_nm as pos_nm
					, a.img_path
					, a.img_nm
					, a.img_m_path
					, a.img_m_nm
					, a.url
					, a.link_target
					-- , a.public_yn
					-- , a.ins_id
					-- , a.ins_dt
				from banner_mst a, code b
				where 1=1
				and a.pos_no in ".$str."
				and b.code_mst_no = 1
				and a.pos_no = b.code_no
				and a.public_yn ='Y'
				order by a.pos_no
				limit 0, ? ";

		array_push($arr, $limit_cnt);

		return $this->db->query($sql,$arr)->result();
	}
}