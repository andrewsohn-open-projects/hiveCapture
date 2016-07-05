<?php
class Spots extends CI_Model{
	function __construct(){
		parent::__construct();
	}
	
	/**
	 *  메인 Hot Spot List 
	 */
	public function getMainRecommendList(){
		
		$sql = " select
					spot_no
					, cat_no
					, spot_nm
					, spot_en_nm
					, area_no
					, resp_img_path
					, resp_img_nm
					, description
					, add_item
					, detaile_url
					, etc_url
					, restaurant_info
					, blog_keyword
					, hash_tag
					, etc
					, recom_yn
					, del_yn
					, ins_id
					, ins_dt
					, upd_id
					, upd_dt
				from spot_mst
				where 1=1
				and recom_yn = 'Y'
				and del_yn = 'N'
				order by upd_dt desc
				limit 0, 8 " ;
		// $arr = array();
		// return $this->db->query($sql, $arr)->result();
		return $this->db->query($sql)->result();
	}

	/**
	 * 친해지기 Spot List 
	 */
	public function getSpotList($page=1, $pagePer=8, $cate=''){  

		$start = ($page-1)*$pagePer;
		if (1 == $start) $start = 0;

		$arr = array();
		
		$sql =" select spot_no
					, cat_no
					, spot_nm
					, spot_en_nm
					, area_no
					, resp_img_path
					, resp_img_nm
					, add_item
					, desc_title
					, detaile_url
					, etc_url
					, restaurant_info
					, blog_keyword
					, hash_tag
					, etc
					, recom_yn
					, del_yn
					, ins_id
					, ins_dt
					, upd_id
					, upd_dt
			from spot_mst
			where 1=1 ";
		
		if($cate){
			$sql .= " and cat_no = ? ";
			array_push($arr, $cate);
		}

		$sql .= " and del_yn = 'N'
			order by spot_nm asc
			limit ?, ? ";
		array_push($arr, $start, $pagePer);

		return $this->db->query($sql, $arr)->result();
	}

	/**
	 * 친해지기 > 싱가포르 소개 > 추천정보 
	 * list - 꼭 가봐야 할 곳
	 */
	public function getRecomList($idx=array()){
		if(empty($idx)) return;
		
		$sql =" select spot_no
					, cat_no
					, spot_nm
					, spot_en_nm
					, area_no
					, resp_img_path
					, resp_img_nm
					, desc_title
					, description
					, add_item
					, detaile_url
					, etc_url
					, restaurant_info
					, blog_keyword
					, hash_tag
					, etc
					, recom_yn
					, del_yn
					, ins_id
					, ins_dt
					, upd_id
					, upd_dt ";
		if(!empty($idx)){
			$sql .= ', CASE spot_no';

			foreach($idx as $key=>$value){
				$num = $key+1;
				$sql .= ' WHEN '.$value.' THEN '.$num;
			}

			$sql .= ' ELSE 99
					END AS orderby';
		}

		$sql .= " from spot_mst
			where 1=1 
			and spot_no in (";
		
		foreach($idx as $key=>$value){
			$sql .= $value;
			if($key != count($idx)-1) $sql .= ",";
		}
		
		$sql .= " ) and del_yn = 'N'
			order by orderby
			limit 0, 10 ";

		return $this->db->query($sql)->result();
	}
	/**
	 *  친해지기 Spot List 총 건수 
	 */
	public function getSpotListTotal($cate=''){

		$arr = array();

		$sql = " select count(*) as tcnt
					from spot_mst 
					where 1=1
					and del_yn = 'N' ";
		if($cate){
			$sql .= " and cat_no = ? ";
			array_push($arr, $cate);
		}

		return  $this->db->query($sql, $arr)->row()->tcnt;
	}

	/**
	 *  친해지기 Spot 상세 
	 */
	public function getSpot($no=''){
		if(!$no) return;

		$arr = array();

		$sql = " select 
					max(s1.spot_no) as spot_no
					, max(s1.cat_no) as cat_no
					, max(s1.spot_nm) as spot_nm
					, max(s1.spot_en_nm) as spot_en_nm
					, max(s1.area_no) as area_no
					, max(s1.area_nm) as area_nm
					, max(s1.resp_img_path) as resp_img_path
					, max(s1.resp_img_nm) as resp_img_nm
					, max(s1.description) as description
					, max(s1.add_item) as add_item
					, max(s1.detaile_url) as detaile_url
					, max(s1.etc_url) as etc_url
					, max(s1.restaurant_info) as restaurant_info
					, max(s1.blog_keyword) as blog_keyword
					, max(s1.hash_tag) as hash_tag
					, max(s1.etc) as etc
					, max(s1.recom_yn) as recom_yn
					, max(s1.del_yn) as del_yn
					, max(s1.ins_id) as ins_id
					, max(s1.ins_dt) as ins_dt
					, max(s1.upd_id) as upd_id
					, max(s1.upd_dt) as upd_dt
				    , SUBSTRING_INDEX(GROUP_CONCAT(s2.spot_no order by s2.spot_no asc SEPARATOR '||'), '||', 4) as eatery_no
				    , SUBSTRING_INDEX(GROUP_CONCAT(s2.spot_nm order by s2.spot_no asc SEPARATOR '||'), '||', 4) as eatery_nm
				    , SUBSTRING_INDEX(GROUP_CONCAT(s2.resp_img_path order by s2.spot_no asc SEPARATOR '||'), '||', 4) as eatery_img_path
					, SUBSTRING_INDEX(GROUP_CONCAT(s2.resp_img_nm order by s2.spot_no asc SEPARATOR '||'), '||', 4) as eatery_img_nm
				from (
					select 
						a.spot_no
						, a.cat_no
						, a.spot_nm
						, a.spot_en_nm
						, a.area_no
						, c.area_nm
						, a.resp_img_path
						, a.resp_img_nm
						, a.description
						, a.add_item
						, a.detaile_url
						, a.etc_url
						, a.restaurant_info
						, a.blog_keyword
						, a.hash_tag
						, a.etc
						, a.recom_yn
						, a.del_yn
						, a.ins_id
						, a.ins_dt
						, a.upd_id
						, a.upd_dt
					from spot_mst a, area_mst c
					where 1=1
					and a.area_no = c.area_no
					and a.spot_no = ?
				) s1
                left join (
					select
                    @key1 as key1
					, s.spot_no
				    , s.spot_nm
				    , s.resp_img_path
				    , s.resp_img_nm
					from spot_mst s
					where s.spot_no in
					(
						select  
							trim(substr(t1.restaurant_info, t1.pos1, t1.pos2 - t1.pos1 + 1)) as val 
						 from (
						 select restaurant_info
						  , substring_index(restaurant_info,',',no)
						  , char_length(substring_index(concat(',',restaurant_info), ',', no)) + 1 pos1
						  , char_length(substring_index(restaurant_info, ',', no)) pos2
						  , no    
						 from spot_mst a
						 , copy_t b    
						 where 1=1
						 and a.spot_no = ?
                         and (@key1:= a.spot_no)
						 and b.no <= char_length (restaurant_info) - char_length (replace(restaurant_info, ',', '')) + 1
						) t1
					)
				) s2
                on s1.spot_no = s2.key1 ";
		
		array_push($arr, $no, $no);

		return  $this->db->query($sql, $arr)->row();
	}
}